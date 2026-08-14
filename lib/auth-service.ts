// lib/auth-service.ts
import { prisma } from '@/lib/prisma'   // adjust if you have a Prisma client
import bcrypt from 'bcryptjs'

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return null
  const isValid = await bcrypt.compare(password, user.passwordHash)
  return isValid ? user : null
}