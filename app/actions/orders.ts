"use server"

import { auth } from "@/lib/auth"
import { db, pool } from "@/lib/db"
import { orders, wallets, walletTransactions } from "@/lib/db/schema"
import { findRetailPackage } from "@/lib/pricing"
import { mapProviderStatus } from "@/lib/status"
import { placeOrder, getOrderStatus, IdataError, type IdataNetwork } from "@/lib/idatagh"
import { and, desc, eq, or } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { randomUUID } from "crypto"
import { initializeTransaction } from "@/lib/paystack"
import { getBaseUrl } from "@/lib/utils"

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}

export async function getWalletBalance() {
  const userId = await getUserId()
  const rows = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1)
  return rows[0] ? Number(rows[0].balance) : 0
}

export async function getMyOrders() {
  const userId = await getUserId()
  return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt))
}

export async function getMyTransactions() {
  const userId = await getUserId()
  return db
    .select()
    .from(walletTransactions)
    .where(eq(walletTransactions.userId, userId))
    .orderBy(desc(walletTransactions.createdAt))
    .limit(50)
}

export type PlaceOrderState = {
  ok: boolean
  message: string
  orderId?: number
}

/**
 * Places a data order live through iDataGH:
 * 1. Validates the package + recipient
 * 2. Debits the customer wallet inside a DB transaction (with balance check)
 * 3. Calls iDataGH place-order
 * 4. On provider failure, refunds the wallet and marks the order failed
 */
export async function placeDataOrder(input: {
  network: IdataNetwork
  packageLabel: string
  recipient: string
}): Promise<PlaceOrderState> {
  const userId = await getUserId()

  const recipient = input.recipient.replace(/\D/g, "").replace(/^233/, "0")
  if (!/^0\d{9}$/.test(recipient)) {
    return { ok: false, message: "Enter a valid 10-digit Ghana number (e.g. 024xxxxxxx)." }
  }

  const pkg = await findRetailPackage(input.network, input.packageLabel)
  if (!pkg) {
    return { ok: false, message: "That package is no longer available. Please refresh and try again." }
  }

  const reference = `DS-${randomUUID().slice(0, 8).toUpperCase()}`
  const client = await pool.connect()
  let orderId: number

  try {
    await client.query("BEGIN")

    // Ensure a wallet row exists, then lock it for the balance check.
    await client.query(
      `INSERT INTO wallets ("userId", balance) VALUES ($1, 0) ON CONFLICT ("userId") DO NOTHING`,
      [userId],
    )
    const walletRes = await client.query(`SELECT balance FROM wallets WHERE "userId" = $1 FOR UPDATE`, [userId])
    const balance = Number(walletRes.rows[0].balance)

    if (balance < pkg.customerPrice) {
      await client.query("ROLLBACK")
      return { ok: false, message: "Insufficient wallet balance. Please top up and try again." }
    }

    await client.query(`UPDATE wallets SET balance = balance - $1, "updatedAt" = now() WHERE "userId" = $2`, [
      pkg.customerPrice,
      userId,
    ])

    const orderRes = await client.query(
      `INSERT INTO orders ("userId", network, volume, recipient, reference, "customerPrice", "costPrice", status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'processing') RETURNING id`,
      [userId, input.network, `${pkg.dataSize}GB`, recipient, reference, pkg.customerPrice, pkg.costPrice],
    )
    orderId = orderRes.rows[0].id

    await client.query(
      `INSERT INTO wallet_transactions ("userId", amount, type, description, "orderId")
       VALUES ($1, $2, 'order', $3, $4)`,
      [userId, -pkg.customerPrice, `${input.network.toUpperCase()} ${pkg.dataSize}GB · ${recipient}`, orderId],
    )

    await client.query("COMMIT")
  } catch (err) {
    await client.query("ROLLBACK")
    console.log("[v0] wallet/order transaction failed:", (err as Error).message)
    return { ok: false, message: "Could not start your order. Please try again." }
  } finally {
    client.release()
  }

  // Call the provider outside the DB transaction.
  try {
    const result = await placeOrder({
      network: input.network,
      beneficiary: recipient,
      packageLabel: pkg.label,
    })
    await db
      .update(orders)
      .set({ providerOrderId: String(result.order_id), providerStatus: result.status, updatedAt: new Date() })
      .where(eq(orders.id, orderId))

    revalidatePath("/")
    revalidatePath("/dashboard/orders")
    return {
      ok: true,
      orderId,
      message: "Order placed! Your data is being delivered — MTN can take a while during high demand.",
    }
  } catch (err) {
    // Provider rejected the order: refund and mark failed.
    const reason = err instanceof IdataError ? err.message : "Provider error"
    await refundOrder(userId, orderId, pkg.customerPrice, reason)
    revalidatePath("/")
    revalidatePath("/dashboard/orders")
    console.log("[v0] iDataGH place-order failed:", reason)
    const isLowProviderStock = reason.toLowerCase().includes("balance") || reason.toLowerCase().includes("insufficient")
    const friendlyMessage = isLowProviderStock
      ? "Telecom gateway is temporarily replenishing bundle inventory. Your payment was safely refunded to your wallet."
      : `Order could not be delivered: ${reason}. You were refunded.`
    return { ok: false, message: friendlyMessage }
  }
}

async function refundOrder(userId: string, orderId: number, amount: number, reason: string) {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    await client.query(`UPDATE wallets SET balance = balance + $1, "updatedAt" = now() WHERE "userId" = $2`, [
      amount,
      userId,
    ])
    await client.query(
      `UPDATE orders SET status = 'failed', "failureReason" = $1, "updatedAt" = now() WHERE id = $2`,
      [reason, orderId],
    )
    await client.query(
      `INSERT INTO wallet_transactions ("userId", amount, type, description, "orderId")
       VALUES ($1, $2, 'refund', $3, $4)`,
      [userId, amount, `Refund · ${reason}`, orderId],
    )
    await client.query("COMMIT")
  } catch (err) {
    await client.query("ROLLBACK")
    console.log("[v0] refund failed:", (err as Error).message)
  } finally {
    client.release()
  }
}

/** Manually re-sync an order's status from iDataGH (used by a "check status" button). */
export async function syncOrderStatus(orderId: number) {
  const userId = await getUserId()
  const rows = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
    .limit(1)
  const order = rows[0]
  if (!order) return { ok: false }

  // If the order has no providerOrderId it failed before iDataGH even accepted it.
  // The refundOrder path already set status = 'failed' in the DB.
  // Revalidate so the customer page shows the real status immediately.
  if (!order.providerOrderId) {
    revalidatePath("/")
    revalidatePath("/dashboard/orders")
    return { ok: true, status: order.status }
  }

  try {
    const status = await getOrderStatus(order.providerOrderId)
    const mappedStatus = mapProviderStatus(status.order_status)
    await db
      .update(orders)
      .set({ providerStatus: status.order_status, status: mappedStatus, updatedAt: new Date() })
      .where(eq(orders.id, orderId))
    revalidatePath("/")
    revalidatePath("/dashboard/orders")
    return { ok: true, status: mappedStatus }
  } catch {
    // Even if iDataGH is unreachable, revalidate so the page shows the real DB status.
    revalidatePath("/")
    revalidatePath("/dashboard/orders")
    return { ok: false }
  }
}

/**
 * Initiates direct Paystack checkout (MoMo / Card) for a specific data bundle.
 * The customer does NOT have to top up their wallet first.
 */
export async function initiateDirectBundleOrder(input: {
  network: IdataNetwork
  packageLabel: string
  recipient: string
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  const user = session.user

  const recipient = input.recipient.replace(/\D/g, "").replace(/^233/, "0")
  if (!/^0\d{9}$/.test(recipient)) {
    return { ok: false as const, message: "Enter a valid 10-digit Ghana phone number (e.g. 024xxxxxxx)." }
  }

  const pkg = await findRetailPackage(input.network, input.packageLabel)
  if (!pkg) {
    return { ok: false as const, message: "That package is no longer available. Please refresh and try again." }
  }

  const reference = `DS-${randomUUID().slice(0, 8).toUpperCase()}`

  try {
    const { authorizationUrl } = await initializeTransaction({
      email: user.email,
      amountInSubunit: Math.round(pkg.customerPrice * 100),
      reference,
      callbackUrl: `${getBaseUrl()}/dashboard/orders/verify`,
      metadata: {
        orderType: "direct_bundle",
        userId: user.id,
        network: input.network,
        packageLabel: pkg.label,
        recipient,
        dataSize: pkg.dataSize,
        customerPrice: pkg.customerPrice,
        costPrice: pkg.costPrice,
      },
    })

    return { ok: true as const, authorizationUrl }
  } catch (err: any) {
    console.error("Direct checkout initialize failed:", err.message)
    return { ok: false as const, message: "Could not start direct checkout. Please try again." }
  }
}

/**
 * Public-facing order tracker — looks up by DS-XXXXXXXX reference OR recipient
 * phone number. Auth is NOT required so customers can track without logging in.
 */
export async function trackOrder(query: string) {
  const key = query.trim().toUpperCase().replace(/\s/g, "")
  if (!key) return null

  // Try matching the `reference` column (e.g. DS-33FAA221) or the `recipient`
  // after stripping non-digits from both sides.
  const digits = key.replace(/\D/g, "")

  const rows = await db
    .select()
    .from(orders)
    .where(
      or(
        eq(orders.reference, key),
        // Also try with the raw lower-case input in case user typed lowercase
        eq(orders.reference, query.trim().replace(/\s/g, "").toUpperCase()),
        ...(digits.length >= 9 ? [eq(orders.recipient, digits.startsWith("0") ? digits : "0" + digits)] : []),
      ),
    )
    .limit(5)
    .orderBy(desc(orders.createdAt))

  return rows.length > 0 ? rows : null
}
