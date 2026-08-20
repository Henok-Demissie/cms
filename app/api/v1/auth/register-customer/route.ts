import { z } from "zod"
import bcrypt from "bcryptjs"

import { apiError, apiSuccess } from "@/lib/api/response"
import { prisma } from "@/lib/prisma"

const registerCustomerSchema = z
  .object({
    firstName: z.string().trim().min(2).max(50),
    lastName: z.string().trim().min(2).max(50),
    phone: z.string().trim().min(9).max(20),
    gender: z.enum(["MALE", "FEMALE"]),
    language: z.enum(["AM", "EN"]),
    email: z.string().trim().email().optional().or(z.literal("")),
    nationalId: z.string().trim().max(50).optional(),
    password: z.string().min(6).max(128),
    confirmPassword: z.string().min(6).max(128),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

function buildCustomerEmail(phone: string, email?: string) {
  const trimmedEmail = email?.trim()
  if (trimmedEmail) return trimmedEmail

  const digits = phone.replace(/\D/g, "")
  return `customer.${digits}@abetbay.local`
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return apiError("Invalid JSON payload", 400)
  }

  const parsed = registerCustomerSchema.safeParse(body)
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid input", 400)
  }

  const {
    firstName,
    lastName,
    phone,
    gender,
    language,
    email,
    nationalId,
    password,
  } = parsed.data

  const normalizedPhone = phone.replace(/\s+/g, "")
  const customerEmail = buildCustomerEmail(normalizedPhone, email)
  const fullName = `${firstName} ${lastName}`.trim()

  try {
    const passwordHash = await bcrypt.hash(password, 10)

    const customer = await prisma.customer.create({
      data: {
        name: fullName,
        firstName,
        lastName,
        email: customerEmail,
        phone: normalizedPhone,
        gender,
        language,
        nationalId: nationalId?.trim() || null,
        passwordHash,
        role: "CUSTOMER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        language: true,
      },
    })

    return apiSuccess({ user: { ...customer, accountType: "customer" } }, 201)
  } catch (error: unknown) {
    const prismaError = error as { code?: string; meta?: { target?: string[] } }
    if (prismaError.code === "P2002") {
      const target = prismaError.meta?.target ?? []
      if (target.includes("phone")) {
        return apiError("Phone number already registered", 409)
      }
      if (target.includes("email")) {
        return apiError("Email already registered", 409)
      }
    }

    return apiError("Registration failed", 500)
  }
}
