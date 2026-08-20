// lib/auth-service.ts
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export type AuthenticatedIdentity = {
  id: string
  name: string
  email: string
  role: string
  tenantId: string
  accountType: "customer" | "staff"
}

export async function authenticateUser(identifier: string, password: string): Promise<AuthenticatedIdentity | null> {
  const normalized = identifier.trim()
  const isEmail = normalized.includes("@")
  const cleanPhone = normalized.replace(/\s+/g, "")

  // 1. Check Customer Table
  const customer = isEmail
    ? await prisma.customer.findFirst({ where: { email: normalized.toLowerCase() } })
    : await prisma.customer.findFirst({ where: { phone: cleanPhone } })

  if (customer) {
    const isValid = await bcrypt.compare(password, customer.passwordHash)
    if (isValid) {
      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        role: "CUSTOMER",
        tenantId: "public",
        accountType: "customer",
      }
    }
  }

  // 2. Check User Table (Staff)
  const staff = isEmail
    ? await prisma.user.findFirst({ where: { email: normalized.toLowerCase() } })
    : await prisma.user.findFirst({ where: { phone: cleanPhone } })

  if (staff) {
    const isValid = await bcrypt.compare(password, staff.passwordHash)
    if (isValid) {
      return {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        tenantId: staff.tenantId,
        accountType: "staff",
      }
    }
  }

  return null
}
