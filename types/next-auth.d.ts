import type { DefaultSession } from "next-auth"
import type { UserRole } from "@/lib/constants"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
      tenantId: string
      accountType?: "customer" | "staff"
    } & DefaultSession["user"]
  }

  interface User {
    role: UserRole
    tenantId: string
    accountType?: "customer" | "staff"
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
    tenantId: string
    accountType?: "customer" | "staff"
  }
}
