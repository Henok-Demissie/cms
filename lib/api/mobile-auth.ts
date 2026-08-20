import { jwtVerify } from "jose"

import { fingerprintPasswordHash } from "@/lib/auth-service"
import { prisma } from "@/lib/prisma"

export type ApiIdentity = {
  id: string
  email: string
  name: string
  role: string
  tenantId: string
  accountType: "customer" | "staff"
}

function signingKey() {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error("AUTH_SECRET is required")
  return new TextEncoder().encode(secret)
}

/**
 * The token's password fingerprint must still match the stored hash.
 *
 * API tokens are self-contained and live 8 hours, so without this a password
 * change leaves every issued token usable until it expires on its own. Tokens
 * minted before the claim existed have no fingerprint and are rejected too —
 * the app signs out and the next sign-in issues a current one.
 */
async function assertPasswordCurrent(claim: unknown, passwordHash: string) {
  if (typeof claim !== "string" || claim !== (await fingerprintPasswordHash(passwordHash))) {
    throw new Error("Stale token")
  }
}

export async function requireApiUser(request: Request): Promise<ApiIdentity> {
  const header = request.headers.get("authorization")
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null
  if (!token) throw new Error("UNAUTHORIZED")

  try {
    const { payload } = await jwtVerify(token, signingKey())
    if (!payload.sub) throw new Error("Missing subject")

    const role = (payload.role as string) || "CUSTOMER"
    const isCustomer = role === "CUSTOMER" || payload.accountType === "customer"

    if (isCustomer) {
      const customer = await prisma.customer.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          passwordHash: true,
        },
      })
      if (!customer) throw new Error("Unknown customer")
      await assertPasswordCurrent(payload.passwordFingerprint, customer.passwordHash)
      return {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        role: "CUSTOMER",
        tenantId: "public",
        accountType: "customer",
      }
    } else {
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          tenantId: true,
          passwordHash: true,
        },
      })
      if (!user) throw new Error("Unknown user")
      await assertPasswordCurrent(payload.passwordFingerprint, user.passwordHash)
      const { passwordHash: _passwordHash, ...identity } = user
      return {
        ...identity,
        accountType: "staff",
      }
    }
  } catch {
    throw new Error("UNAUTHORIZED")
  }
}

export function customerComplaintFilter(user: Pick<ApiIdentity, "id" | "email">) {
  return {
    OR: [
      { customerId: user.id },
      { customerEmail: user.email },
    ],
  }
}
