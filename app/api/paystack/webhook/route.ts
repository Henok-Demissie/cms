import { NextResponse } from "next/server"
import { isValidPaystackSignature } from "@/lib/paystack"
import { creditWalletForTopup, markTopupFailed } from "@/lib/topups"

/**
 * Receives payment events from Paystack. Paystack signs the raw body with
 * HMAC-SHA512 using your secret key — we verify x-paystack-signature before
 * trusting anything in the payload.
 * https://paystack.com/docs/payments/webhooks/
 */
export async function POST(req: Request) {
  const raw = await req.text()
  const signature = req.headers.get("x-paystack-signature")

  if (!isValidPaystackSignature(raw, signature)) {
    console.log("[v0] Paystack webhook: invalid signature")
    return NextResponse.json({ error: "invalid signature" }, { status: 401 })
  }

  let event: { event?: string; data?: Record<string, unknown> }
  try {
    event = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }

  const reference = String(event.data?.reference ?? "")
  if (!reference) {
    return NextResponse.json({ error: "missing reference" }, { status: 400 })
  }

  try {
    if (event.event === "charge.success") {
      const channel = typeof event.data?.channel === "string" ? event.data.channel : null
      await creditWalletForTopup(reference, channel)
    } else if (event.event === "charge.failed") {
      await markTopupFailed(reference)
    }
  } catch (err) {
    console.log("[v0] Paystack webhook processing failed:", (err as Error).message)
    return NextResponse.json({ error: "processing failed" }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
