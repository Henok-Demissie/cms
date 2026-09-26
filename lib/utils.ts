import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Resolves the public base URL of the app, used for building redirect/callback
 * URLs (e.g. Paystack's callback_url). Mirrors the resolution order used for
 * Better Auth in lib/auth.ts.
 */
export function getBaseUrl(): string {
  if (process.env.APP_URL) return process.env.APP_URL
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return process.env.V0_RUNTIME_URL || "http://localhost:3000"
}
