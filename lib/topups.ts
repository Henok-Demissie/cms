import "server-only"
import { pool } from "@/lib/db"
import { placeOrder, type IdataNetwork } from "@/lib/idatagh"

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
       VALUES ($1, $2, 'topup', 'Wallet top-up · MoMo / Card')`,
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

/**
 * Fulfills a bundle order paid directly via Paystack (MoMo/Card)
 * without requiring the user to top up their wallet first.
 */
export async function fulfillDirectBundleOrder(reference: string, metadata: any) {
  // Check if order with this reference is already placed or processed
  const existingOrder = await pool.query(
    `SELECT id, status FROM orders WHERE reference = $1 LIMIT 1`,
    [reference]
  )
  if (existingOrder.rows[0]) {
    return { success: true, alreadyProcessed: true, orderId: existingOrder.rows[0].id }
  }

  const userId = String(metadata?.userId || "")
  const network = String(metadata?.network || "")
  const packageLabel = String(metadata?.packageLabel || "")
  const recipient = String(metadata?.recipient || "")
  const dataSize = String(metadata?.dataSize || "")
  const customerPrice = Number(metadata?.customerPrice || 0)
  const costPrice = Number(metadata?.costPrice || 0)

  if (!userId || !network || !recipient || !packageLabel) {
    throw new Error("Missing required metadata for direct bundle order")
  }

  // Insert order as processing
  const insertRes = await pool.query(
    `INSERT INTO orders ("userId", network, volume, recipient, reference, "customerPrice", "costPrice", status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'processing') RETURNING id`,
    [userId, network, `${dataSize}GB`, recipient, reference, customerPrice, costPrice]
  )
  const orderId = insertRes.rows[0].id

  // Record transaction
  await pool.query(
    `INSERT INTO wallet_transactions ("userId", amount, type, description, "orderId")
     VALUES ($1, $2, 'order', $3, $4)`,
    [userId, -customerPrice, `Direct payment · ${network.toUpperCase()} ${dataSize}GB · ${recipient}`, orderId]
  )

  // Call telecom fulfillment provider
  try {
    const result = await placeOrder({
      network: network as IdataNetwork,
      beneficiary: recipient,
      packageLabel,
    })

    const finalStatus = result.status === "failed" ? "failed" : "completed"
    await pool.query(
      `UPDATE orders SET "providerOrderId" = $1, "providerStatus" = $2, status = $3, "updatedAt" = now() WHERE id = $4`,
      [String(result.order_id), result.status, finalStatus, orderId]
    )

    return { success: true, orderId, status: finalStatus }
  } catch (err: any) {
    console.error("Direct bundle fulfillment error:", err.message)
    await pool.query(
      `UPDATE orders SET status = 'failed', "failureReason" = $1, "updatedAt" = now() WHERE id = $2`,
      [err.message || "Provider error", orderId]
    )
    // Credit wallet refund so user never loses money
    await pool.query(
      `INSERT INTO wallets ("userId", balance) VALUES ($1, $2)
       ON CONFLICT ("userId") DO UPDATE SET balance = wallets.balance + $2, "updatedAt" = now()`,
      [userId, customerPrice]
    )
    await pool.query(
      `INSERT INTO wallet_transactions ("userId", amount, type, description, "orderId")
       VALUES ($1, $2, 'refund', $3, $4)`,
      [userId, customerPrice, `Refund: delivery failed · ${network.toUpperCase()} ${dataSize}GB`, orderId]
    )
    return { success: false, orderId, error: err.message }
  }
}
