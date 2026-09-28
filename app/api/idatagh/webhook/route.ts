import { db, pool } from "@/lib/db"
import { orders } from "@/lib/db/schema"
import { mapProviderStatus } from "@/lib/status"
import { eq } from "drizzle-orm"
import crypto from "crypto"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

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

  const newStatus = mapProviderStatus(providerStatus)

  // Log unknown status strings so we can expand mapProviderStatus if needed
  if (newStatus === "processing" && providerStatus) {
    console.log(`[idatagh-webhook] Unrecognized status string: "${providerStatus}" for order ${providerOrderId}`)
  }

  // Case 1: provider says delivered — update regardless of current status.
  // This handles MTN/Telecel async delivery where we pre-marked the order "failed"
  // because the initial API call timed out, but iDataGH later delivered it.
  if (newStatus === "delivered") {
    await db
      .update(orders)
      .set({ status: "delivered", providerStatus, updatedAt: new Date() })
      .where(eq(orders.id, order.id))
    revalidatePath("/")
    revalidatePath("/dashboard/orders")
    revalidatePath("/admin")
    revalidatePath("/admin/orders")
    return NextResponse.json({ ok: true })
  }

  // Case 2: provider says failed and we haven't already refunded → refund now.
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
    revalidatePath("/")
    revalidatePath("/dashboard/orders")
    revalidatePath("/admin")
    revalidatePath("/admin/orders")
    return NextResponse.json({ ok: true })
  }

  // Case 3: processing or any other status — just update.
  await db
    .update(orders)
    .set({ status: newStatus, providerStatus, updatedAt: new Date() })
    .where(eq(orders.id, order.id))

  revalidatePath("/")
  revalidatePath("/dashboard/orders")
  revalidatePath("/admin")
  revalidatePath("/admin/orders")

  return NextResponse.json({ ok: true })
}
