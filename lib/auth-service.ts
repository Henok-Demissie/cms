import type { Sector, UserRole } from "@/lib/constants"
import { prisma } from "@/lib/prisma"
import { hashPassword, verifyPassword } from "@/lib/password"

export type AuthUser = {
  id: string
  email: string
  name: string
  role: UserRole
  tenantId: string
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { tenant: true },
  })
}

export async function authenticateUser(email: string, password: string): Promise<AuthUser | null> {
  const user = await findUserByEmail(email)
  if (!user) return null

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) return null

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
    tenantId: user.tenantId,
  }
}

export async function createTenantWithAdmin(input: {
  name: string
  email: string
  password: string
  businessName: string
  sector: Sector
  subdomain: string
}) {
  const email = input.email.toLowerCase()
  const passwordHash = await hashPassword(input.password)

  return prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        name: input.businessName,
        sector: input.sector,
        subdomain: input.subdomain,
      },
    })

    const user = await tx.user.create({
      data: {
        tenantId: tenant.id,
        name: input.name,
        email,
        passwordHash,
        role: "ADMIN",
      },
    })

    return { tenant, user }
  })
}
