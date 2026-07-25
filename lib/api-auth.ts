import { auth } from "@/auth"
import { verifyApiToken } from "@/lib/jwt"
import type { UserRole } from "@/lib/constants"

export type RequestUser = {
  id: string
  email: string
  name: string
  role: UserRole
  tenantId: string
}

export async function getRequestUser(request: Request): Promise<RequestUser | null> {
  const authHeader = request.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7)
    const payload = await verifyApiToken(token)
    if (!payload) return null

    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role as UserRole,
      tenantId: payload.tenantId,
    }
  }

  const session = await auth()
  if (!session?.user?.id) return null

  return {
    id: session.user.id,
    email: session.user.email ?? "",
    name: session.user.name ?? "",
    role: session.user.role,
    tenantId: session.user.tenantId,
  }
}
