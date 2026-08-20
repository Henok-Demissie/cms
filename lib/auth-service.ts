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
  passwordFingerprint: string
}

/**
 * A short digest of the stored bcrypt hash, carried in the session token so a
 * password change can be detected and the old session dropped.
 *
 * Sessions here are JWTs, which means nothing links a live session back to the
 * stored password: resetting a password leaves every existing token valid for
 * the rest of its 7 days. Comparing this value against the current row closes
 * that gap. It is a one-way truncated digest of an already-salted hash, so it
 * reveals nothing about the password itself.
 *
 * Web Crypto rather than node:crypto: this module is reachable from the Edge
 * middleware bundle through @/auth, and webpack refuses to bundle a "node:"
 * import for that runtime.
 */
export async function fingerprintPasswordHash(passwordHash: string): Promise<string> {
  const bytes = new TextEncoder().encode(passwordHash)
  const digest = await crypto.subtle.digest("SHA-256", bytes)
  return Array.from(new Uint8Array(digest).slice(0, 8))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

/** The stored fingerprint for one account, or null if the row is gone. */
export async function currentPasswordFingerprint(
  accountType: AccountType,
  id: string,
): Promise<string | null> {
  const row = accountType === "customer"
    ? await prisma.customer.findUnique({ where: { id }, select: { passwordHash: true } })
    : await prisma.user.findUnique({ where: { id }, select: { passwordHash: true } })
  return row ? await fingerprintPasswordHash(row.passwordHash) : null
}

/**
 * True when the identifier has an account in BOTH tables.
 *
 * Callers that cannot name a portal (the mobile login route serving an older app
 * build) use this to refuse rather than guess which account was meant.
 */
export async function isAmbiguousIdentifier(identifier: string): Promise<boolean> {
  const normalized = identifier.trim()
  const isEmail = normalized.includes("@")
  const email = normalized.toLowerCase()
  const cleanPhone = normalized.replace(/\s+/g, "")

  const [customer, staff] = await Promise.all([
    isEmail
      ? prisma.customer.findFirst({ where: { email }, select: { id: true } })
      : prisma.customer.findFirst({ where: { phone: cleanPhone }, select: { id: true } }),
    isEmail
      ? prisma.user.findFirst({ where: { email }, select: { id: true } })
      : prisma.user.findFirst({ where: { phone: cleanPhone }, select: { id: true } }),
  ])

  return Boolean(customer && staff)
}

/**
 * Verify an email/phone + password against one or both identity tables.
 *
 * `portal` scopes the lookup to a single table. Customer and User are separate
 * tables with separate passwords, so one address can exist in both — and does
 * here. Checking Customer first and then falling through to staff on a *password
 * mismatch* means a customer who mistypes their password silently lands in the
 * staff dashboard whenever their address also has a staff account. Passing the
 * portal makes a customer's failed login fail as a customer.
 *
 * The argument stays optional for the mobile login route, which has to keep
 * serving app builds that predate it. In that case the fall-through is still
 * used for addresses that exist in only one table, but an address present in
 * both is refused outright rather than resolved by guesswork.
 */
export async function authenticateUser(
  identifier: string,
  password: string,
  portal?: AccountType,
): Promise<AuthenticatedIdentity | null> {
  const normalized = identifier.trim()
  const isEmail = normalized.includes("@")
  const email = normalized.toLowerCase()
  const cleanPhone = normalized.replace(/\s+/g, "")

  const customer = portal !== "staff"
    ? isEmail
      ? await prisma.customer.findFirst({ where: { email } })
      : await prisma.customer.findFirst({ where: { phone: cleanPhone } })
    : null

  const staff = portal !== "customer"
    ? isEmail
      ? await prisma.user.findFirst({ where: { email } })
      : await prisma.user.findFirst({ where: { phone: cleanPhone } })
    : null

  // No portal to disambiguate with, and the address is in both tables: refuse
  // instead of letting a failed customer password promote to a staff session.
  if (!portal && customer && staff) return null

  if (customer && await bcrypt.compare(password, customer.passwordHash)) {
    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      role: "CUSTOMER",
      tenantId: "public",
      accountType: "customer",
      passwordFingerprint: await fingerprintPasswordHash(customer.passwordHash),
    }
  }

  if (staff && await bcrypt.compare(password, staff.passwordHash)) {
    return {
      id: staff.id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      tenantId: staff.tenantId,
      accountType: "staff",
      passwordFingerprint: await fingerprintPasswordHash(staff.passwordHash),
    }
  }

  return null
}
