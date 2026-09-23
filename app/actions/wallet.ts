"use server"

import { auth } from "@/lib/auth"
import { pool } from "@/lib/db"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}

/**
 * Demo top-up. In production this MUST be driven by a verified payment
 * webhook (Paystack / MoMo), never trusted directly from the client.
 */
export async function topUpWallet(amount: number) {
  const userId = await getUserId()
  const value = Math.round(Number(amount) * 100) / 100
  if (!Number.isFinite(value) || value <= 0 || value > 5000) {
    return { ok: false, message: "Enter an amount between GHS 1 and GHS 5000." }
  }

  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    await client.query(
      `INSERT INTO wallets ("userId", balance) VALUES ($1, $2)
       ON CONFLICT ("userId") DO UPDATE SET balance = wallets.balance + $2, "updatedAt" = now()`,
      [userId, value],
    )
    await client.query(
      `INSERT INTO wallet_transactions ("userId", amount, type, description)
       VALUES ($1, $2, 'topup', 'Wallet top-up')`,
      [userId, value],
    )
    await client.query("COMMIT")
  } catch (err) {
    await client.query("ROLLBACK")
    console.log("[v0] top-up failed:", (err as Error).message)
    return { ok: false, message: "Top-up failed. Please try again." }
  } finally {
    client.release()
  }

  revalidatePath("/")
  return { ok: true, message: `Added GHS ${value.toFixed(2)} to your wallet.` }
}
