import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { topups, wallets, walletTransactions } from "@/lib/db/schema"
import { eq, sql } from "drizzle-orm"
import { verifyPaystackSignature } from "@/lib/paystack"

export async function POST(request: Request) {
  const payload = await request.text()
  if (!verifyPaystackSignature(payload, request.headers.get("x-paystack-signature"))) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 401 })
  }
  const event = JSON.parse(payload) as { event?: string; data?: { reference?: string; status?: string; amount?: number; channel?: string } }
  if (event.event !== "charge.success" || !event.data?.reference || event.data.status !== "success") {
    return NextResponse.json({ received: true })
  }
  const payment = event.data
  const reference = payment.reference
  if (!reference) return NextResponse.json({ received: true })
  const topup = await db.query.topups.findFirst({ where: eq(topups.reference, reference) })
  if (!topup || topup.status === "success") return NextResponse.json({ received: true })
  const amount = Number(topup.amount)
  if (!payment.amount || Math.round(payment.amount) !== Math.round(amount * 100)) return NextResponse.json({ message: "Amount mismatch" }, { status: 400 })
  await db.transaction(async (tx) => {
    await tx.update(topups).set({ status: "success", channel: payment.channel ?? null, updatedAt: new Date() }).where(eq(topups.reference, reference))
    await tx.insert(wallets).values({ userId: topup.userId, balance: amount.toFixed(2) }).onConflictDoUpdate({ target: wallets.userId, set: { balance: sql`${wallets.balance} + ${amount}`, updatedAt: new Date() } })
    await tx.insert(walletTransactions).values({ userId: topup.userId, amount: amount.toFixed(2), type: "deposit", description: "Paystack wallet top-up" })
  })
  return NextResponse.json({ received: true })
}
