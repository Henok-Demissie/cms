import { SignJWT } from "jose"

export type ApiTokenPayload = {
  sub: string
  email: string
  name: string
  role: string
  tenantId: string
  accountType?: "customer" | "staff"
}

function getSigningKey() {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    throw new Error("AUTH_SECRET is required to sign API tokens")
  }

  return new TextEncoder().encode(secret)
}

export async function signApiToken(payload: ApiTokenPayload) {
  return new SignJWT({
    email: payload.email,
    name: payload.name,
    role: payload.role,
    tenantId: payload.tenantId,
    accountType: payload.accountType ?? (payload.role === "CUSTOMER" ? "customer" : "staff"),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSigningKey())
}
