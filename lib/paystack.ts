import "server-only"
import crypto from "crypto"

const PAYSTACK_BASE_URL = "https://api.paystack.co"

function getSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not set")
  return key
}

export interface InitializeTransactionParams {
  email: string
  amountInSubunit: number
  reference: string
  callbackUrl: string
  currency?: string
  metadata?: Record<string, unknown>
}

export interface InitializeTransactionResult {
  authorizationUrl: string
  accessCode: string
  reference: string
}

export async function initializeTransaction(
  params: InitializeTransactionParams,
): Promise<InitializeTransactionResult> {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amountInSubunit,
      reference: params.reference,
      callback_url: params.callbackUrl,
      currency: params.currency ?? "GHS",
      metadata: params.metadata,
    }),
    cache: "no-store",
  })

  const data = await res.json().catch(() => null)
  if (!res.ok || !data?.status) {
    throw new Error(data?.message || "Failed to initialize Paystack transaction")
  }

  return {
    authorizationUrl: data.data.authorization_url,
    accessCode: data.data.access_code,
    reference: data.data.reference,
  }
}

export interface VerifyTransactionResult {
  status: "success" | "failed" | "abandoned" | string
  reference: string
  amountInSubunit: number
  currency: string
  paidAt: string | null
  customerEmail: string | null
  metadata: Record<string, unknown> | null
}

export async function verifyTransaction(reference: string): Promise<VerifyTransactionResult> {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
    },
    cache: "no-store",
  })

  const data = await res.json().catch(() => null)
  if (!res.ok || !data?.status) {
    throw new Error(data?.message || "Failed to verify Paystack transaction")
  }

  return {
    status: data.data.status,
    reference: data.data.reference,
    amountInSubunit: data.data.amount,
    currency: data.data.currency,
    paidAt: data.data.paid_at ?? null,
    customerEmail: data.data.customer?.email ?? null,
    metadata: data.data.metadata ?? null,
  }
}

export function isValidPaystackSignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false
  const expected = crypto.createHmac("sha512", getSecretKey()).update(rawBody).digest("hex")
  return signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}
