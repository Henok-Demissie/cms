type ApiEnvelope<T> = {
  success: boolean
  data: T | null
  error: string | null
}

function getBackendUrl() {
  return (
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:8000"
  ).replace(/\/$/, "")
}

export class BackendError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function backendFetch<T>(
  path: string,
  options: {
    method?: string
    body?: unknown
    token?: string | null
  } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  }

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json"
  }
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`
  }

  const response = await fetch(`${getBackendUrl()}${path}`, {
    method: options.method ?? (options.body !== undefined ? "POST" : "GET"),
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  })

  let payload: ApiEnvelope<T> | null = null
  try {
    payload = (await response.json()) as ApiEnvelope<T>
  } catch {
    throw new BackendError("Invalid response from backend", response.status)
  }

  if (!response.ok || !payload.success || payload.data === null) {
    const asAny = payload as unknown as {
      error?: string
      detail?: string | { error?: string }
    }
    const detail =
      (typeof asAny.error === "string" && asAny.error) ||
      (typeof asAny.detail === "string" && asAny.detail) ||
      (typeof asAny.detail === "object" && asAny.detail?.error) ||
      "Backend request failed"
    throw new BackendError(detail, response.status)
  }

  return payload.data
}

export type BackendUser = {
  id: string
  name: string
  email: string
  role: string
  tenantId: string
}

export type BackendTenant = {
  id: string
  name: string
  sector: string
  subdomain: string
  plan: string
}

export type BackendComplaint = {
  id: string
  tenantId: string
  assignedToId: string | null
  customerName: string | null
  customerPhone: string | null
  customerEmail: string | null
  source: string
  title: string
  description: string
  status: string
  priority: string
  assignedAt: string | null
  createdAt: string
  updatedAt: string
  assignedTo: { id: string; name: string; email: string } | null
}

export type DashboardSummary = {
  tenant: BackendTenant
  stats: { active: number; ongoing: number; solved: number }
  recentComplaints: Array<{
    id: string
    customerName: string | null
    title: string
    status: string
    priority: string
  }>
  chartData: Array<{ month: string; complaints: number }>
}
