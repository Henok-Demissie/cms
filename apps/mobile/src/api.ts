const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000"

export type Role = "CUSTOMER" | "ADMIN" | "SUPERVISOR" | "AGENT" | "VIEWER"
export type User = { id: string; name: string; email: string; role: Role }
export type Dashboard = {
  user: User
  metrics: { total: number; active: number; resolved: number }
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers ?? {}),
      },
    })
  } catch {
    throw new Error(
      `Cannot reach the server at ${API_URL}. Start the backend with "pnpm dev" on your computer.`,
    )
  }

  let body: { success?: boolean; error?: string; data?: T }
  try {
    body = await response.json()
  } catch {
    throw new Error("The server returned an invalid response.")
  }

  if (!response.ok || !body.success) {
    throw new Error(body.error ?? "Something went wrong")
  }

  return body.data as T
}

export function getApiUrl() {
  return API_URL
}

export async function login(email: string, password: string) {
  return request<{ token: string; user: User }>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
}

export async function registerCustomer(payload: {
  firstName: string
  lastName: string
  phone: string
  gender: "MALE" | "FEMALE"
  language: "AM" | "EN"
  email?: string
  nationalId?: string
  password: string
  confirmPassword: string
}) {
  return request("/api/v1/auth/register-customer", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function registerBusiness(payload: {
  name: string
  email: string
  password: string
  businessName: string
  sector: string
}) {
  return request("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function fetchDashboard(token: string) {
  return request<Dashboard>("/api/v1/mobile/dashboard", {}, token)
}
