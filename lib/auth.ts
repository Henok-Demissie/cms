import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"
import { pool } from "@/lib/db"

function resolveBaseURL() {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return process.env.V0_RUNTIME_URL
}

function resolveTrustedOrigins() {
  const origins = new Set<string>()
  if (process.env.NODE_ENV === "development") {
    origins.add("http://localhost:3000")
    for (const key of [
      "V0_RUNTIME_URL",
      "V0_DEV_APP_URL",
      "V0_BUILD_URL",
      "V0_SANDBOX_URL",
    ]) {
      const value = process.env[key]
      if (value) origins.add(value)
    }
  } else {
    for (const key of ["VERCEL_URL", "VERCEL_PROJECT_PRODUCTION_URL"]) {
      const value = process.env[key]
      if (value) origins.add(`https://${value}`)
    }
  }
  return Array.from(origins)
}

export const auth = betterAuth({
  database: pool,
  baseURL: resolveBaseURL(),
  trustedOrigins: resolveTrustedOrigins(),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [nextCookies()],
  ...(process.env.NODE_ENV === "development"
    ? {
        advanced: {
          // Required by the cross-site v0 preview iframe. Without these
          // attributes, login succeeds but the next request appears signed out.
          defaultCookieAttributes: {
            sameSite: "none" as const,
            secure: true,
          },
        },
      }
    : {}),
})
