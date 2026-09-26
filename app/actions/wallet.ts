"use server"

import { auth } from "@/lib/auth"
import { pool } from "@/lib/db"
import { headers } from "next/headers"
import { getBaseUrl } from "@/lib/utils"
import { initializeTransaction } from "@/lib/paystack"
import crypto from "crypto"

async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user
}

/**
 * Starts a real Paystack payment for a wallet top-up. The wallet is only
 * ever credited once Paystack confirms the charge — via the webhook at
 * /api/paystack/webhook, backed up by the verify step on the redirect
 * callback at /dashboard/wallet/verify. Never trust the client for this.
 */
export async function initiateTopUp(amount: number) {
  const user = await getUser()
  const value = Math.round(Number(amount) * 100) / 100
  if (!Number.isFinite(value) || value <= 0 || value > 5000) {
    return { ok: false as const, message: "Enter an amount between GHS 1 and GHS 5000." }
  }

  const reference = `topup_${user.id}_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`

  try {
    await pool.query(
      `INSERT INTO topups ("userId", reference, amount, status) VALUES ($1, $2, $3, 'pending')`,
      [user.id, reference, value],
    )

    const { authorizationUrl } = await initializeTransaction({
      email: user.email,
      amountInSubunit: Math.round(value * 100),
      reference,
      callbackUrl: `${getBaseUrl()}/dashboard/wallet/verify`,
      metadata: { userId: user.id },
    })

    return { ok: true as const, authorizationUrl }
  } catch (err) {
    console.log("[v0] paystack initialize failed:", (err as Error).message)
    return { ok: false as const, message: "Couldn't start payment. Please try again." }
  }
}
