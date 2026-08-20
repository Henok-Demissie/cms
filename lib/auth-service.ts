// lib/auth-service.ts
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export type AccountType = "customer" | "staff"

export type AuthenticatedIdentity = {
  id: string
  name: string
  email: string
  role: string
  tenantId: string
  accountType: AccountType
}

/**
 * Verify an email/phone + password against one or both identity tables.
 *
 * `portal` scopes the lookup to a single table. Customer and User are separate
 * tables with separate passwords, so one address can exist in both — and does
 * here. Without a portal we check Customer first and then fall through to staff
 * on a *password mismatch*, which means a customer who mistypes their password
 * silently lands in the staff dashboard whenever their address also has a staff
 * account. Passing the portal makes a customer's failed login fail as a
 * customer.
 *
 * The argument is optional so the mobile/API login route, which has no notion of
 * a portal, keeps its existing permissive behaviour.
 */
export async function authenticateUser(
  identifier: string,
  password: string,
  portal?: AccountType,
): Promise<AuthenticatedIdentity | null> {
  const normalized = identifier.trim()
  const isEmail = normalized.includes("@")
  const cleanPhone = normalized.replace(/\s+/g, "")

  // 1. Check Customer Table
  if (portal !== "staff") {
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
  }

  // 2. Check User Table (Staff)
  if (portal !== "customer") {
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
  }

  return null
}
