import "server-only"
import { pool } from "@/lib/db"

export type CreditResult = { credited: true } | { credited: false; reason: "not_found" | "already_processed" }

export async function creditWalletForTopup(reference: string, channel?: string | null): Promise<CreditResult> {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")

    const { rows } = await client.query(
      `SELECT id, "userId", amount, status FROM topups WHERE reference = $1 FOR UPDATE`,
      [reference],
    )
    const topup = rows[0]
    if (!topup) {
      await client.query("ROLLBACK")
      return { credited: false, reason: "not_found" }
    }
    if (topup.status !== "pending") {
      await client.query("ROLLBACK")
      return { credited: false, reason: "already_processed" }
    }

    await client.query(
      `UPDATE topups SET status = 'success', channel = $2, "updatedAt" = now() WHERE id = $1`,
      [topup.id, channel ?? null],
    )
    await client.query(
      `INSERT INTO wallets ("userId", balance) VALUES ($1, $2)
       ON CONFLICT ("userId") DO UPDATE SET balance = wallets.balance + $2, "updatedAt" = now()`,
      [topup.userId, topup.amount],
    )
    await client.query(
      `INSERT INTO wallet_transactions ("userId", amount, type, description)
       VALUES ($1, $2, 'topup', 'Wallet top-up · Paystack')`,
      [topup.userId, topup.amount],
    )

    await client.query("COMMIT")
    return { credited: true }
  } catch (err) {
    await client.query("ROLLBACK")
    throw err
  } finally {
    client.release()
  }
}

export async function markTopupFailed(reference: string): Promise<void> {
  await pool.query(`UPDATE topups SET status = 'failed', "updatedAt" = now() WHERE reference = $1 AND status = 'pending'`, [
    reference,
  ])
}
