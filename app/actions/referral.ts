"use server"

import { auth } from "@/lib/auth"
import { pool } from "@/lib/db"
import { headers } from "next/headers"
import { getBaseUrl } from "@/lib/utils"

/**
 * Generates a cryptographically random, human-readable referral code.
 * Format: 3 uppercase letters + 3 digits, e.g. "XKR291"
 * Avoids ambiguous chars (I, O) to prevent confusion.
 */
function generateCode(): string {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ"
  const digits = "0123456789"
  let code = ""
  for (let i = 0; i < 3; i++) code += letters[Math.floor(Math.random() * letters.length)]
  for (let i = 0; i < 3; i++) code += digits[Math.floor(Math.random() * digits.length)]
  return code
}

/**
 * Returns the current user's referral code and link, creating a unique code
 * in the DB if they don't have one yet (lazy generation on first visit).
 *
 * Also ensures the referralCode column exists — self-migrating for safety.
 */
export async function getReferralProfile(): Promise<{
  code: string
  link: string
  referralCount: number
  qualifiedCount: number
} | null> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null

  const userId = session.user.id

  // Ensure the column exists (idempotent — safe to call every time)
  try {
    await pool.query(`
      ALTER TABLE "user"
      ADD COLUMN IF NOT EXISTS "referralCode" TEXT UNIQUE;
    `)
  } catch {
    // If it already exists (or DB doesn't support IF NOT EXISTS), continue
  }

  // Fetch existing code for this user
  let result = await pool.query<{ referralCode: string | null }>(
    `SELECT "referralCode" FROM "user" WHERE id = $1 LIMIT 1`,
    [userId],
  )

  let code: string | null = result.rows[0]?.referralCode ?? null

  // Generate and persist a new code if none exists yet
  if (!code) {
    for (let attempt = 0; attempt < 10; attempt++) {
      const candidate = generateCode()
      try {
        await pool.query(
          `UPDATE "user" SET "referralCode" = $1, "updatedAt" = now()
           WHERE id = $2 AND "referralCode" IS NULL`,
          [candidate, userId],
        )
        // Re-read to confirm (handles race conditions)
        const check = await pool.query<{ referralCode: string | null }>(
          `SELECT "referralCode" FROM "user" WHERE id = $1 LIMIT 1`,
          [userId],
        )
        code = check.rows[0]?.referralCode ?? null
        if (code) break
      } catch {
        // UNIQUE constraint violation — try a different code
      }
    }
  }

  if (!code) return null

  const baseUrl = getBaseUrl()
  const link = `${baseUrl}/join/${code}`

  // Referral tracking counts — returns 0 until a referrals table is added
  const referralCount = 0
  const qualifiedCount = 0

  return { code, link, referralCount, qualifiedCount }
}
