import "server-only"

/**
 * Server-only client for the iDataGH ("Tera") reseller API.
 * Docs: https://idatagh.com/api-documentation
 * The API key is read from IDATAGH_API_KEY and never leaves the server.
 */

const BASE_URL = (process.env.IDATAGH_BASE_URL || "https://idatagh.com/wp-json/custom/v1").replace(/\/$/, "")

export type IdataNetwork = "mtn" | "telecel" | "airteltigo"

export interface IdataPackage {
  package_id: number
  label: string
  price: number
  data_size: number
}

export interface PlaceOrderResult {
  status: string
  order_id: number
  amount: number
  network: string
  beneficiary: string
}

export interface OrderStatusResult {
  status: string
  order_id: number
  order_status: string
  amount: number
}

export class IdataError extends Error {
  status: number
  body: unknown
  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.name = "IdataError"
    this.status = status
    this.body = body
  }
}

function apiKey(): string {
  const key = process.env.IDATAGH_API_KEY
  if (!key) throw new IdataError("IDATAGH_API_KEY is not configured", 500, null)
  return key
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  })

  const text = await res.text()
  let body: unknown = null
  try {
    body = text ? JSON.parse(text) : null
  } catch {
    body = text
  }

  if (!res.ok) {
    const msg =
      body && typeof body === "object" && "message" in body
        ? String((body as { message: unknown }).message)
        : `iDataGH request failed (${res.status})`
    throw new IdataError(msg, res.status, body)
  }
  return body as T
}

export function getPackages(network: IdataNetwork) {
  return request<{ status: string; network: string; packages: IdataPackage[] }>(
    `/packages?network=${encodeURIComponent(network)}`,
  )
}

export function getWalletBalance() {
  return request<{ status: string; balance: number }>(`/wallet-balance`)
}

export function getOrderStatus(orderId: number | string) {
  return request<OrderStatusResult>(`/order-status/${encodeURIComponent(String(orderId))}`)
}

/**
 * Place a data bundle order. `packageLabel` is the bundle label from getPackages
 * (e.g. "2" for the 2GB package), matching the API's `pa_data-bundle-packages` field.
 */
export function placeOrder(params: { network: IdataNetwork; beneficiary: string; packageLabel: string | number }) {
  return request<PlaceOrderResult>(`/place-order`, {
    method: "POST",
    body: JSON.stringify({
      network: params.network,
      beneficiary: params.beneficiary,
      "pa_data-bundle-packages": params.packageLabel,
    }),
  })
}

export function setWebhookUrl(webhookUrl: string) {
  return request<{ status: string; message: string; webhook_url: string; webhook_secret?: string }>(
    `/webhook-settings`,
    { method: "POST", body: JSON.stringify({ webhook_url: webhookUrl }) },
  )
}
