import type { UserRole } from "@/lib/constants"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import { authConfig } from "@/auth.config"

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  // Which sign-in page the form was served from. Optional so a caller that
  // omits it (older client bundle, curl, the mobile app) still authenticates
  // against both identity tables.
  portal: z.enum(["customer", "staff"]).optional(),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        portal: { label: "Portal", type: "text" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { authenticateUser } = await import("@/lib/auth-service")
        const user = await authenticateUser(parsed.data.email, parsed.data.password, parsed.data.portal)
        if (!user) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as UserRole,
          tenantId: user.tenantId,
          accountType: user.accountType,
          passwordFingerprint: user.passwordFingerprint,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = user.role as UserRole
        token.tenantId = user.tenantId as string
        token.accountType = (user as any).accountType
        token.passwordFingerprint = (user as any).passwordFingerprint
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
        session.user.tenantId = token.tenantId as string
        session.user.accountType = token.accountType as "customer" | "staff" | undefined
        session.user.passwordFingerprint = token.passwordFingerprint as string | undefined
      }
      return session
    },
  },
})
