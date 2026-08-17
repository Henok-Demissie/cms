// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma?: PrismaClient }

// During development Next.js can retain a Prisma client created before a schema
// change. Recreate it when the generated client gains a new delegate.
const hasCurrentSchema = Boolean(
  globalForPrisma.prisma &&
    "suggestion" in (globalForPrisma.prisma as unknown as Record<string, unknown>),
)

export const prisma =
  hasCurrentSchema ? globalForPrisma.prisma! : new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
