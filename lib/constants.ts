export const SECTORS = [
  "RESTAURANT",
  "HEALTHCARE",
  "RETAIL",
  "BANKING",
  "HOSPITALITY",
  "TELECOM",
  "GOVERNMENT",
  "MANUFACTURING",
] as const

export type Sector = (typeof SECTORS)[number]

export const USER_ROLES = ["ADMIN", "SUPERVISOR", "AGENT", "VIEWER", "CUSTOMER"] as const
export type UserRole = (typeof USER_ROLES)[number]

export const TENANT_PLANS = ["STARTER", "PROFESSIONAL", "ENTERPRISE"] as const
export type TenantPlan = (typeof TENANT_PLANS)[number]
