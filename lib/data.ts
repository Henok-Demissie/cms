export type NetworkId = "mtn" | "telecel" | "airteltigo"
export type ServiceTab = "mtn" | "telecel" | "airteltigo" | "airtime" | "checkers"

export interface Bundle {
  id: string
  network: NetworkId
  sizeGb: number
  price: number
  validityDays: number
  flexa?: boolean
  popular?: boolean
}

export interface Order {
  id: string
  type: "data" | "express" | "airtime" | "bills" | "checkers"
  network: NetworkId | "waec" | "bece"
  label: string
  phone: string
  amount: number
  status: "delivered" | "processing" | "pending" | "failed"
  createdAt: string
}

export interface Transaction {
  id: string
  kind: "order" | "topup" | "refund" | "referral"
  label: string
  amount: number
  status: "success" | "pending" | "failed"
  createdAt: string
  reference: string
}

export const user = {
  name: "ANTHONY",
  fullName: "Anthony Mensah",
  email: "anthony@datasell.app",
  phone: "024 555 0198",
  initials: "A",
  memberSince: "Feb 2025",
  referralCode: "XPB",
}

export const wallet = {
  balance: 142.5,
  totalDeposited: 620,
  walletPayments: 477.5,
  dataCredit: { earned: 12, used: 6, left: 6 },
}

export const networks: { id: NetworkId; name: string; short: string; color: string; fg: string }[] = [
  { id: "mtn", name: "MTN", short: "MTN", color: "#ffcc00", fg: "#1a1400" },
  { id: "telecel", name: "Telecel", short: "TEL", color: "#e60000", fg: "#ffffff" },
  { id: "airteltigo", name: "AirtelTigo", short: "AT", color: "#0a2a8a", fg: "#ffffff" },
]

// Ghana mobile number prefixes by network (used to catch wrong-network numbers before payment).
export const networkPrefixes: Record<NetworkId, string[]> = {
  mtn: ["024", "025", "053", "054", "055", "059"],
  telecel: ["020", "050"],
  airteltigo: ["026", "027", "056", "057"],
}

export const bundles: Bundle[] = [
  { id: "mtn-1", network: "mtn", sizeGb: 1, price: 4.1, validityDays: 90 },
  { id: "mtn-2", network: "mtn", sizeGb: 2, price: 9.13, validityDays: 90, popular: true },
  { id: "mtn-3", network: "mtn", sizeGb: 3, price: 13.7, validityDays: 90 },
  { id: "mtn-4", network: "mtn", sizeGb: 4, price: 18.2, validityDays: 90 },
  { id: "mtn-5", network: "mtn", sizeGb: 5, price: 22.5, validityDays: 90 },
  { id: "mtn-10", network: "mtn", sizeGb: 10, price: 43.0, validityDays: 90, popular: true },
  { id: "mtn-15", network: "mtn", sizeGb: 15, price: 63.5, validityDays: 90 },
  { id: "mtn-20", network: "mtn", sizeGb: 20, price: 82.0, validityDays: 90 },
  { id: "mtn-f-1", network: "mtn", sizeGb: 1, price: 4.6, validityDays: 30, flexa: true },
  { id: "mtn-f-2", network: "mtn", sizeGb: 2, price: 9.9, validityDays: 30, flexa: true },
  { id: "mtn-f-5", network: "mtn", sizeGb: 5, price: 24.0, validityDays: 30, flexa: true, popular: true },
  { id: "mtn-f-10", network: "mtn", sizeGb: 10, price: 46.0, validityDays: 30, flexa: true },
  { id: "tel-1", network: "telecel", sizeGb: 1, price: 4.5, validityDays: 60 },
  { id: "tel-2", network: "telecel", sizeGb: 2, price: 9.0, validityDays: 60 },
  { id: "tel-5", network: "telecel", sizeGb: 5, price: 21.5, validityDays: 60, popular: true },
  { id: "tel-10", network: "telecel", sizeGb: 10, price: 41.0, validityDays: 60 },
  { id: "tel-15", network: "telecel", sizeGb: 15, price: 60.0, validityDays: 60 },
  { id: "tel-20", network: "telecel", sizeGb: 20, price: 78.0, validityDays: 60 },
  { id: "at-1", network: "airteltigo", sizeGb: 1, price: 3.9, validityDays: 30 },
  { id: "at-2", network: "airteltigo", sizeGb: 2, price: 7.8, validityDays: 30 },
  { id: "at-5", network: "airteltigo", sizeGb: 5, price: 18.5, validityDays: 30, popular: true },
  { id: "at-10", network: "airteltigo", sizeGb: 10, price: 36.0, validityDays: 30 },
  { id: "at-15", network: "airteltigo", sizeGb: 15, price: 52.0, validityDays: 30 },
  { id: "at-25", network: "airteltigo", sizeGb: 25, price: 84.0, validityDays: 30 },
]

export const checkers = [
  { id: "waec-bece", name: "BECE Result Checker", org: "WAEC", price: 22.0, year: 2025 },
  { id: "waec-wassce", name: "WASSCE Result Checker", org: "WAEC", price: 26.0, year: 2025 },
  { id: "waec-nov", name: "Nov/Dec Result Checker", org: "WAEC", price: 26.0, year: 2025 },
  { id: "shs-placement", name: "SHS Placement Checker", org: "GES", price: 20.0, year: 2025 },
]

export const orders: Order[] = [
  {
    id: "DS-7F3K2Q",
    type: "data",
    network: "mtn",
    label: "MTN 5GB · 90 days",
    phone: "024 555 0198",
    amount: 22.5,
    status: "delivered",
    createdAt: "2026-09-03T08:42:00Z",
  },
  {
    id: "DS-7E9M1A",
    type: "express",
    network: "mtn",
    label: "MTN Flexa 2GB · 30 days",
    phone: "055 210 7743",
    amount: 9.9,
    status: "processing",
    createdAt: "2026-09-02T19:10:00Z",
  },
  {
    id: "DS-7D4R8Z",
    type: "data",
    network: "telecel",
    label: "Telecel 10GB · 60 days",
    phone: "020 118 9932",
    amount: 41.0,
    status: "delivered",
    createdAt: "2026-09-01T14:05:00Z",
  },
  {
    id: "DS-7C1T5V",
    type: "airtime",
    network: "airteltigo",
    label: "AirtelTigo Airtime",
    phone: "027 331 0025",
    amount: 10.0,
    status: "delivered",
    createdAt: "2026-08-30T11:20:00Z",
  },
  {
    id: "DS-7B8W3N",
    type: "checkers",
    network: "waec",
    label: "WASSCE Result Checker",
    phone: "024 555 0198",
    amount: 26.0,
    status: "delivered",
    createdAt: "2026-08-28T09:00:00Z",
  },
  {
    id: "DS-7A2X9L",
    type: "data",
    network: "airteltigo",
    label: "AirtelTigo 2GB · 30 days",
    phone: "027 331 0025",
    amount: 7.8,
    status: "failed",
    createdAt: "2026-08-26T16:48:00Z",
  },
]

export const transactions: Transaction[] = [
  {
    id: "TX-1",
    kind: "order",
    label: "MTN 5GB · 024 555 0198",
    amount: -22.5,
    status: "success",
    createdAt: "2026-09-03T08:42:00Z",
    reference: "DS-7F3K2Q",
  },
  {
    id: "TX-2",
    kind: "topup",
    label: "Wallet top-up · MTN MoMo",
    amount: 100,
    status: "success",
    createdAt: "2026-09-03T08:39:00Z",
    reference: "PAY-91A2C",
  },
  {
    id: "TX-3",
    kind: "order",
    label: "MTN Flexa 2GB · 055 210 7743",
    amount: -9.9,
    status: "pending",
    createdAt: "2026-09-02T19:10:00Z",
    reference: "DS-7E9M1A",
  },
  {
    id: "TX-4",
    kind: "referral",
    label: "Referral credit · Kwame joined",
    amount: 1,
    status: "success",
    createdAt: "2026-09-01T18:22:00Z",
    reference: "REF-XPB-01",
  },
  {
    id: "TX-5",
    kind: "order",
    label: "Telecel 10GB · 020 118 9932",
    amount: -41,
    status: "success",
    createdAt: "2026-09-01T14:05:00Z",
    reference: "DS-7D4R8Z",
  },
  {
    id: "TX-6",
    kind: "refund",
    label: "Refund · AirtelTigo 2GB failed",
    amount: 7.8,
    status: "success",
    createdAt: "2026-08-26T17:02:00Z",
    reference: "DS-7A2X9L",
  },
  {
    id: "TX-7",
    kind: "topup",
    label: "Wallet top-up · Telecel Cash",
    amount: 50,
    status: "success",
    createdAt: "2026-08-25T10:12:00Z",
    reference: "PAY-77Q0F",
  },
]

export const referrals = [
  { name: "Kwame A.", joined: "2026-09-01", status: "qualified", earned: 1 },
  { name: "Ama S.", joined: "2026-08-29", status: "qualified", earned: 1 },
  { name: "Yaw B.", joined: "2026-08-27", status: "joined", earned: 0 },
]

export const agentTiers = [
  {
    id: "starter",
    name: "Starter Agent",
    price: 30,
    discount: "5%",
    perks: ["5% off every bundle", "Agent dashboard", "WhatsApp support"],
  },
  {
    id: "pro",
    name: "Pro Agent",
    price: 80,
    discount: "9%",
    perks: ["9% off every bundle", "Bulk order upload", "Priority delivery", "Custom storefront link"],
    featured: true,
  },
  {
    id: "elite",
    name: "Elite Agent",
    price: 200,
    discount: "14%",
    perks: ["14% off every bundle", "Dedicated account manager", "API access included", "Early network deals"],
  },
]

export const weeklySpend = [
  { day: "Mon", spend: 22.5, orders: 1 },
  { day: "Tue", spend: 0, orders: 0 },
  { day: "Wed", spend: 41, orders: 1 },
  { day: "Thu", spend: 10, orders: 1 },
  { day: "Fri", spend: 9.9, orders: 1 },
  { day: "Sat", spend: 33.8, orders: 2 },
  { day: "Sun", spend: 26, orders: 1 },
]

export const devMetrics = {
  balance: 142.5,
  activeKeys: 2,
  apiOrders30d: 318,
  delivered30d: 311,
  failed30d: 4,
  spend30d: 4127.4,
  requests30d: 2496,
  avgLatencyMs: 412,
}

export const apiKeys = [
  { id: "key_live_1", label: "Production", prefix: "ds_live_8f3k", created: "2026-07-12", lastUsed: "2 min ago", env: "live" },
  { id: "key_test_1", label: "Staging", prefix: "ds_test_2q9m", created: "2026-08-02", lastUsed: "3 days ago", env: "test" },
]

export const requestLogs = [
  { id: "req_01", method: "POST", path: "/v1/orders", status: 201, ms: 388, at: "08:42:11" },
  { id: "req_02", method: "GET", path: "/v1/orders/DS-7F3K2Q", status: 200, ms: 92, at: "08:42:14" },
  { id: "req_03", method: "POST", path: "/v1/orders", status: 201, ms: 421, at: "08:39:02" },
  { id: "req_04", method: "GET", path: "/v1/wallet", status: 200, ms: 64, at: "08:38:51" },
  { id: "req_05", method: "POST", path: "/v1/orders", status: 422, ms: 55, at: "08:31:40" },
  { id: "req_06", method: "GET", path: "/v1/pricing", status: 200, ms: 71, at: "08:30:12" },
]

export const formatGhs = (value: number) =>
  `GHS ${Math.abs(value).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })

export const networkOf = (id: string) => networks.find((n) => n.id === id)

// Reduce any entry (+233…, 233…, 0…) to a local 0XXXXXXXXX form.
export function normalizeGhPhone(input: string): string {
  let digits = input.replace(/\D/g, "")
  if (digits.startsWith("233")) digits = "0" + digits.slice(3)
  else if (digits.length === 9 && !digits.startsWith("0")) digits = "0" + digits
  return digits
}

export function isValidGhPhone(input: string): boolean {
  const d = normalizeGhPhone(input)
  return d.length === 10 && d.startsWith("0")
}

// Detect the network from the number's 3-digit prefix, or null if unrecognized.
export function detectNetwork(input: string): NetworkId | null {
  const d = normalizeGhPhone(input)
  if (d.length < 3) return null
  const prefix = d.slice(0, 3)
  for (const id of Object.keys(networkPrefixes) as NetworkId[]) {
    if (networkPrefixes[id].includes(prefix)) return id
  }
  return null
}
