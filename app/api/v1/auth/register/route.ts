import { z } from "zod"
import { SECTORS } from "@/lib/constants"
import { apiError, apiSuccess } from "@/lib/api-response"
import { createTenantWithAdmin, findUserByEmail } from "@/lib/auth-service"
import { signApiToken } from "@/lib/jwt"
import { prisma } from "@/lib/prisma"
import { uniqueSubdomain } from "@/lib/slug"

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  businessName: z.string().min(2).max(100),
  sector: z.enum(SECTORS),
  subdomain: z.string().min(2).max(48).optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid input", 400)
    }

    const { name, email, password, businessName, sector } = parsed.data
    const existing = await findUserByEmail(email)
    if (existing) {
      return apiError("An account with this email already exists", 409)
    }

    const subdomain =
      parsed.data.subdomain ??
      (await uniqueSubdomain(businessName, async (candidate) => {
        const found = await prisma.tenant.findUnique({ where: { subdomain: candidate } })
        return Boolean(found)
      }))

    const { tenant, user } = await createTenantWithAdmin({
      name,
      email,
      password,
      businessName,
      sector,
      subdomain,
    })

    const token = await signApiToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
    })

    return apiSuccess(
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
        },
        tenant: {
          id: tenant.id,
          name: tenant.name,
          sector: tenant.sector,
          subdomain: tenant.subdomain,
          plan: tenant.plan,
        },
      },
      201,
    )
  } catch {
    return apiError("Registration failed", 500)
  }
}
