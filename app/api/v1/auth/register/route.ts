import { z } from "zod"
import { SECTORS } from "@/lib/constants"
import { apiError, apiSuccess } from "@/lib/api/response"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  businessName: z.string().min(2).max(100),
  sector: z.enum(SECTORS),
  subdomain: z.string().min(2).max(48).optional(),
})

export async function POST(request: Request) {
  let body: any
  try {
    body = await request.json()
  } catch (err) {
    return apiError("Invalid JSON payload", 400)
  }

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid input", 400)
  }

  const { name, email, password, businessName, sector, subdomain } = parsed.data

  // 🔧 Generate a subdomain if not provided
  let finalSubdomain = subdomain?.trim().toLowerCase()
  if (!finalSubdomain) {
    // Convert "My Great Cafe" → "my-great-cafe"
    finalSubdomain = businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")  // replace non-alphanumeric with dash
      .replace(/^-|-$/g, "")        // remove leading/trailing dashes
    // If still empty, fallback
    if (!finalSubdomain) {
      finalSubdomain = `tenant-${Date.now()}`
    }
  }

  if (!subdomain) {
    const safeBase = finalSubdomain.slice(0, 42) || "tenant"
    let suffix = 2

    while (await prisma.tenant.findUnique({ where: { subdomain: finalSubdomain } })) {
      finalSubdomain = `${safeBase.slice(0, 48 - String(suffix).length - 1)}-${suffix}`
      suffix += 1
    }
  }

  try {
    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create Tenant and User in one transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the tenant
      const tenant = await tx.tenant.create({
        data: {
          name: businessName,
          sector: sector,
          subdomain: finalSubdomain,
          // plan defaults to "STARTER"
        },
      })

      // 2. Create the user linked to this tenant
      const user = await tx.user.create({
        data: {
          name: name,
          email: email,
          passwordHash: passwordHash,
          tenantId: tenant.id,
          role: "AGENT", // you can change to "ADMIN" if you prefer
        },
      })

      return { tenant, user }
    })

    return apiSuccess(result, 201)
  } catch (error: any) {
    console.error("❌ Registration error:", error)

    // Handle duplicate email or subdomain
    if (error.code === "P2002") {
      const target = error.meta?.target
      if (target?.includes("email")) {
        return apiError("Email already registered", 409)
      }
      if (target?.includes("subdomain")) {
        return apiError("Subdomain already taken", 409)
      }
    }

    return apiError("Registration failed", 500)
  }
}
