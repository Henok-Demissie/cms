import type { DefaultSession } from "next-auth"
import type { UserRole } from "@/lib/constants"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
      tenantId: string
      accountType?: "customer" | "staff"
      // Digest of the stored password hash at sign-in time. lib/session-guard.ts
      // compares it against the database so a password change ends the session
      // instead of leaving the JWT valid for the rest of its 7 days.
      passwordFingerprint?: string
    } & DefaultSession["user"]
  }

  interface User {
    role: UserRole
    tenantId: string
    accountType?: "customer" | "staff"
    passwordFingerprint?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
    tenantId: string
    accountType?: "customer" | "staff"
    passwordFingerprint?: string
  }
}
