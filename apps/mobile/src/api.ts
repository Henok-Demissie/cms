const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000"

export type Role = "CUSTOMER" | "ADMIN" | "SUPERVISOR" | "AGENT" | "VIEWER"

export type User = {
  id: string
  name: string
  email: string
  role: Role
  tenantId?: string
  accountType?: "customer" | "staff"
}

export type Organization = {
  id: string
  name: string
  subdomain: string
  sector?: string
}

export type ComplaintMessage = {
  id: string
  message: string
  createdAt: string
  author?: {
    id: string
    name: string
    role: string
  } | null
  customer?: {
    id: string
    name: string
    role: string
  } | null
  authorName?: string | null
  authorRole?: string | null
}

export type Complaint = {
  id: string
  title: string
  description: string
  status: string
  priority: string
  createdAt: string
  updatedAt: string
  customerId?: string | null
  customerName?: string | null
  customerEmail?: string | null
  tenant: Organization
  assignedTo?: { id: string; name: string; email: string } | null
  messages?: ComplaintMessage[]
}

export type Suggestion = {
  id: string
  title: string
  description: string
  status: string
  response?: string | null
  respondedAt?: string | null
  createdAt: string
  customerId?: string | null
  authorName?: string | null
  authorEmail?: string | null
  tenant: Organization
}

export type FeedbackItem = {
  id: string
  message: string
  rating: number
  status: string
  response?: string | null
  respondedAt?: string | null
  createdAt: string
  customerId?: string | null
  authorName?: string | null
  tenant: Organization
}

export type NotificationItem = {
  id: string
  customerId: string
  type: string
  title: string
  message: string
  refType?: string | null
  refId?: string | null
  read: boolean
  createdAt: string
}

export type Dashboard = {
  user: User
  tenant?: Organization | null
  metrics: {
    total: number
    active: number
    resolved: number
    new?: number
    ongoing?: number
    complaints?: number
    suggestions?: number
    feedback?: number
    pendingSuggestions?: number
    resolutionRate?: number
    unreadNotifications?: number
  }
  complaints?: Complaint[]
  suggestions?: Suggestion[]
  feedback?: FeedbackItem[]
}

/**
 * Carries the HTTP status alongside the message so callers can tell an expired
 * session (401) apart from a validation error or an outage. Without it every
 * failure looks the same and a dead token is indistinguishable from a hiccup.
 */
export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

/** True when the server has rejected our token and the app should sign out. */
export function isAuthError(error: unknown) {
  return error instanceof ApiError && error.status === 401
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
      `Cannot reach server at ${API_URL}. Ensure backend is running.`,
    )
  }

  let body: { success?: boolean; error?: string; data?: T }
  try {
    body = await response.json()
  } catch {
    throw new Error("The server returned an invalid response.")
  }

  if (!response.ok || !body.success) {
    throw new ApiError(body.error ?? "Something went wrong", response.status)
  }

  return body.data as T
}

export function getApiUrl() {
  return API_URL
}

/**
 * `portal` tells the server which door the login screen was opened at.
 *
 * Customers and staff are separate tables with separate passwords, and one
 * address can exist in both. Without this the server checks the customer table
 * first and falls through to staff when the password does not match, so a
 * customer's typo could return a staff token.
 */
export async function login(email: string, password: string, portal: "customer" | "staff") {
  return request<{ token: string; user: User }>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, portal }),
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

export async function fetchOrganizations() {
  const result = await request<{ organizations: Organization[] }>("/api/v1/organizations")
  return result.organizations
}

export async function fetchDashboard(token: string) {
  return request<Dashboard>("/api/v1/mobile/dashboard", {}, token)
}

export async function fetchComplaints(token: string) {
  const result = await request<{ complaints: Complaint[] }>("/api/v1/mobile/complaints", {}, token)
  return result.complaints
}

export async function createComplaint(
  token: string,
  payload: {
    title: string
    description: string
    tenantId: string
    priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  },
) {
  const result = await request<{ complaint: Complaint }>("/api/v1/mobile/complaints", {
    method: "POST",
    body: JSON.stringify(payload),
  }, token)
  return result.complaint
}

export async function fetchComplaintDetails(token: string, id: string) {
  const result = await request<{ complaint: Complaint }>(`/api/v1/mobile/complaints/${id}`, {}, token)
  return result.complaint
}

export async function replyComplaint(token: string, id: string, message: string, status?: string) {
  const result = await request<{ message: ComplaintMessage; complaint: Complaint }>(
    `/api/v1/mobile/complaints/${id}`,
    {
      method: "POST",
      body: JSON.stringify({ message, status }),
    },
    token,
  )
  return result
}

/**
 * Customer-only. The server rejects this once staff have engaged (status left
 * NEW, or any message on the thread), so a 403 here is expected — surface it.
 */
export async function updateComplaint(
  token: string,
  id: string,
  payload: { title: string; description: string },
) {
  const result = await request<{ complaint: Complaint }>(
    `/api/v1/mobile/complaints/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
    token,
  )
  return result.complaint
}

/** Customer-only soft delete: sets status to WITHDRAWN, keeps the row. */
export async function withdrawComplaint(token: string, id: string) {
  const result = await request<{ complaint: Complaint }>(
    `/api/v1/mobile/complaints/${id}`,
    { method: "DELETE" },
    token,
  )
  return result.complaint
}

export async function fetchSuggestions(token: string) {
  const result = await request<{ suggestions: Suggestion[] }>("/api/v1/mobile/suggestions", {}, token)
  return result.suggestions
}

export async function createSuggestion(
  token: string,
  payload: { title: string; description: string; tenantId: string },
) {
  const result = await request<{ suggestion: Suggestion }>("/api/v1/mobile/suggestions", {
    method: "POST",
    body: JSON.stringify(payload),
  }, token)
  return result.suggestion
}

export async function respondSuggestion(
  token: string,
  id: string,
  response: string,
  status: "ACCEPTED" | "IN_REVIEW" | "DECLINED" = "ACCEPTED",
) {
  const result = await request<{ suggestion: Suggestion }>(`/api/v1/mobile/suggestions/${id}/respond`, {
    method: "POST",
    body: JSON.stringify({ response, status }),
  }, token)
  return result.suggestion
}

export async function fetchFeedback(token: string) {
  const result = await request<{ feedback: FeedbackItem[] }>("/api/v1/mobile/feedback", {}, token)
  return result.feedback
}

export async function createFeedback(
  token: string,
  payload: { message: string; rating: number; tenantId: string },
) {
  const result = await request<{ feedback: FeedbackItem }>("/api/v1/mobile/feedback", {
    method: "POST",
    body: JSON.stringify(payload),
  }, token)
  return result.feedback
}

export async function respondFeedback(token: string, id: string, response: string) {
  const result = await request<{ feedback: FeedbackItem }>(`/api/v1/mobile/feedback/${id}/respond`, {
    method: "POST",
    body: JSON.stringify({ response }),
  }, token)
  return result.feedback
}

export async function fetchNotifications(token: string) {
  const result = await request<{ notifications: NotificationItem[]; unreadCount: number }>(
    "/api/v1/mobile/notifications",
    {},
    token,
  )
  return result
}

export async function markNotificationsRead(token: string, id?: string, all: boolean = true) {
  return request<{ success: boolean; unreadCount: number }>("/api/v1/mobile/notifications", {
    method: "PATCH",
    body: JSON.stringify({ id, all }),
  }, token)
}
