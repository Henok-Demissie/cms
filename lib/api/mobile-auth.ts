import { jwtVerify } from "jose"

import { prisma } from "@/lib/prisma"

type ApiIdentity = {
  id: string
  email: string
  name: string
  role: string
  tenantId: string
}

function signingKey() {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error("AUTH_SECRET is required")
  return new TextEncoder().encode(secret)
}

export async function requireApiUser(request: Request): Promise<ApiIdentity> {
  const header = request.headers.get("authorization")
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null
  if (!token) throw new Error("UNAUTHORIZED")

  try {
    const { payload } = await jwtVerify(token, signingKey())
    if (!payload.sub) throw new Error("Missing subject")

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
      },
    })

    if (!user) throw new Error("Unknown user")
    return user
  } catch {
    throw new Error("UNAUTHORIZED")
  }
}

export function customerComplaintFilter(user: Pick<ApiIdentity, "email">) {
  return { customerEmail: user.email }
}
