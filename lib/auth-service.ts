// lib/auth-service.ts
import { prisma } from '@/lib/prisma'   // adjust if you have a Prisma client
import bcrypt from 'bcryptjs'

export async function authenticateUser(identifier: string, password: string) {
  const normalized = identifier.trim()
  const user = normalized.includes("@")
    ? await prisma.user.findFirst({ where: { email: normalized.toLowerCase() } })
    : ((await prisma.$queryRaw<Array<{ id: string; tenantId: string; name: string; email: string; role: string; passwordHash: string }>>`
        SELECT id, tenantId, name, email, role, passwordHash FROM User WHERE phone = ${normalized.replace(/\s+/g, "")}
      `)[0] ?? null)
  if (!user) return null
  const isValid = await bcrypt.compare(password, user.passwordHash)
  return isValid ? user : null
}
