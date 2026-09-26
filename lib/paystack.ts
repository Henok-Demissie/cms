import "server-only"
import { createHmac, timingSafeEqual } from "node:crypto"

const PAYSTACK_API = "https://api.paystack.co"

function secretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not configured")
  return key
}

export async function initializePaystackTransaction(input: {
  email: string
  amountGhs: number
  reference: string
  callbackUrl: string
}) {
  const response = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secretKey()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      email: input.email,
      amount: Math.round(input.amountGhs * 100),
      reference: input.reference,
      callback_url: input.callbackUrl,
      currency: "GHS",
    }),
    cache: "no-store",
  })
  const data = (await response.json()) as { status: boolean; message: string; data?: { authorization_url: string } }
  if (!response.ok || !data.status || !data.data?.authorization_url) throw new Error(data.message || "Paystack initialization failed")
  return data.data.authorization_url
}

export async function verifyPaystackTransaction(reference: string) {
  const response = await fetch(`${PAYSTACK_API}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secretKey()}` },
    cache: "no-store",
  })
  const data = (await response.json()) as { status: boolean; data?: { status: string; amount: number; reference: string; channel?: string } }
  if (!response.ok || !data.status || !data.data) throw new Error("Paystack verification failed")
  return data.data
}

export function verifyPaystackSignature(payload: string, signature: string | null) {
  if (!signature) return false
  const expected = createHmac("sha512", secretKey()).update(payload).digest("hex")
  return signature.length === expected.length && timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}
