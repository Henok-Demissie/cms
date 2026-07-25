import { SignJWT, jwtVerify } from "jose"

export type ApiTokenPayload = {
  sub: string
  email: string
  name: string
  role: string
  tenantId: string
}

function getSecret() {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    throw new Error("AUTH_SECRET is not set")
  }
  return new TextEncoder().encode(secret)
}

export async function signApiToken(payload: ApiTokenPayload): Promise<string> {
  return new SignJWT({
    email: payload.email,
    name: payload.name,
    role: payload.role,
    tenantId: payload.tenantId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret())
}

export async function verifyApiToken(token: string): Promise<ApiTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    if (!payload.sub || typeof payload.email !== "string") {
      return null
    }

    return {
      sub: payload.sub,
      email: payload.email,
      name: typeof payload.name === "string" ? payload.name : "",
      role: typeof payload.role === "string" ? payload.role : "AGENT",
      tenantId: typeof payload.tenantId === "string" ? payload.tenantId : "",
    }
  } catch {
    return null
  }
}
