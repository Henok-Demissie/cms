import { db, pool } from "@/lib/db"
import { orders } from "@/lib/db/schema"
import { mapStatus } from "@/app/actions/orders"
import { eq } from "drizzle-orm"
import crypto from "crypto"
import { NextResponse } from "next/server"

/**
 * Receives order status updates from iDataGH.
 * The provider signs the raw body with HMAC-SHA256 using the webhook secret
 * returned when registering the webhook. We verify X-Tera-Signature before trusting it.
 */
export async function POST(req: Request) {
  const raw = await req.text()
  const secret = process.env.IDATAGH_WEBHOOK_SECRET

  if (secret) {
    const signature = req.headers.get("x-tera-signature") || ""
    const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex")
    const valid =
      signature.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
    if (!valid) {
      console.log("[v0] iDataGH webhook: invalid signature")
      return NextResponse.json({ error: "invalid signature" }, { status: 401 })
    }
  }

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }

  const providerOrderId = String(payload.order_id ?? payload.orderId ?? "")
  const providerStatus = String(payload.status ?? payload.order_status ?? "")
  if (!providerOrderId || !providerStatus) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 })
  }

  const rows = await db.select().from(orders).where(eq(orders.providerOrderId, providerOrderId)).limit(1)
  const order = rows[0]
  if (!order) {
    // Unknown order — acknowledge so the provider stops retrying.
    return NextResponse.json({ ok: true, note: "unknown order" })
  }

  const newStatus = mapStatus(providerStatus)

  // If it failed and we haven't already refunded, refund the customer.
  if (newStatus === "failed" && order.status !== "failed") {
    const client = await pool.connect()
    try {
      await client.query("BEGIN")
      await client.query(`UPDATE wallets SET balance = balance + $1, "updatedAt" = now() WHERE "userId" = $2`, [
        order.customerPrice,
        order.userId,
      ])
      await client.query(
        `UPDATE orders SET status = 'failed', "providerStatus" = $1, "failureReason" = 'Provider reported failure', "updatedAt" = now() WHERE id = $2`,
        [providerStatus, order.id],
      )
      await client.query(
        `INSERT INTO wallet_transactions ("userId", amount, type, description, "orderId")
         VALUES ($1, $2, 'refund', 'Refund · delivery failed', $3)`,
        [order.userId, order.customerPrice, order.id],
      )
      await client.query("COMMIT")
    } catch (err) {
      await client.query("ROLLBACK")
      console.log("[v0] webhook refund failed:", (err as Error).message)
    } finally {
      client.release()
    }
  } else {
    await db
      .update(orders)
      .set({ status: newStatus, providerStatus, updatedAt: new Date() })
      .where(eq(orders.id, order.id))
  }

  return NextResponse.json({ ok: true })
}
