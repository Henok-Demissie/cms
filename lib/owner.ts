import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { pool } from "@/lib/db"

export const OWNER_EMAIL = "pboxtv9@gmail.com"

export function isOwnerEmail(email?: string | null): boolean {
  if (!email) return false
  return email.trim().toLowerCase() === OWNER_EMAIL.toLowerCase()
}

export async function ensureAdminTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS system_admins (
      "userId" TEXT PRIMARY KEY,
      "assignedBy" TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `)
}

export async function isUserAdminOrOwner(userId?: string | null, email?: string | null): Promise<boolean> {
  if (isOwnerEmail(email)) return true
  if (!userId) return false
  await ensureAdminTables()
  const res = await pool.query(`SELECT 1 FROM system_admins WHERE "userId" = $1 LIMIT 1`, [userId])
  return (res.rowCount ?? 0) > 0
}

export async function getCurrentSession() {
  return auth.api.getSession({ headers: await headers() })
}

/**
 * Access control for /admin: Allows the primary owner OR any appointed admin.
 */
export async function requireAdminOrOwner() {
  const session = await getCurrentSession()
  if (!session?.user) {
    redirect("/sign-in")
  }
  const hasAccess = await isUserAdminOrOwner(session.user.id, session.user.email)
  if (!hasAccess) {
    redirect("/dashboard")
  }
  return {
    session,
    isOwner: isOwnerEmail(session.user.email),
  }
}

/**
 * Strict access control: Only Pboxtv9@gmail.com can perform actions like adding/removing admins.
 */
export async function requireOwner() {
  const session = await getCurrentSession()
  if (!session?.user) {
    redirect("/sign-in")
  }
  if (!isOwnerEmail(session.user.email)) {
    throw new Error("Unauthorized: Only the primary owner can manage administrators.")
  }
  return session
}

/**
 * Add an admin by user ID.
 * Only callable by the primary owner.
 * Strictly limited to maximum 1 admin.
 */
export async function grantAdminRole(targetUserId: string) {
  const session = await requireOwner()
  await ensureAdminTables()

  // Enforce single admin limit
  const adminCountRes = await pool.query(`SELECT COUNT(*)::int as count FROM system_admins`)
  const currentCount = adminCountRes.rows[0]?.count || 0
  if (currentCount >= 1) {
    throw new Error("Only one administrator is allowed at a time. Please remove the existing admin before adding a new one.")
  }

  const target = await pool.query(`SELECT id, email, name FROM "user" WHERE id = $1 LIMIT 1`, [targetUserId])
  if (!target.rows[0]) throw new Error("User account not found")

  if (isOwnerEmail(target.rows[0].email)) {
    throw new Error("This user is already the primary owner.")
  }

  await pool.query(
    `INSERT INTO system_admins ("userId", "assignedBy") VALUES ($1, $2) ON CONFLICT ("userId") DO NOTHING`,
    [targetUserId, session.user.id]
  )

  return { success: true, email: target.rows[0].email }
}

/**
 * Add an admin by email address.
 * Only callable by the primary owner.
 * Strictly limited to maximum 1 admin.
 */
export async function grantAdminByEmail(targetEmail: string) {
  const session = await requireOwner()
  await ensureAdminTables()

  // Enforce single admin limit
  const adminCountRes = await pool.query(`SELECT COUNT(*)::int as count FROM system_admins`)
  const currentCount = adminCountRes.rows[0]?.count || 0
  if (currentCount >= 1) {
    throw new Error("Only one administrator is allowed at a time. Please remove the existing admin before adding a new one.")
  }

  const cleanEmail = targetEmail.trim().toLowerCase()
  if (isOwnerEmail(cleanEmail)) {
    throw new Error("Pboxtv9@gmail.com is already the primary owner.")
  }

  const target = await pool.query(`SELECT id, email, name FROM "user" WHERE LOWER(email) = LOWER($1) LIMIT 1`, [cleanEmail])
  if (!target.rows[0]) {
    throw new Error(`No registered account found with email "${targetEmail}". The user must register first before being appointed as admin.`)
  }

  await pool.query(
    `INSERT INTO system_admins ("userId", "assignedBy") VALUES ($1, $2) ON CONFLICT ("userId") DO NOTHING`,
    [target.rows[0].id, session.user.id]
  )

  return { success: true, user: target.rows[0] }
}

export async function getOwnersAndAdminData() {
  await requireAdminOrOwner()
  await ensureAdminTables()

  const ownerRes = await pool.query(`
    SELECT u.id, u.name, u.email, u."createdAt", COALESCE(w.balance, 0)::numeric as balance
    FROM "user" u
    LEFT JOIN wallets w ON u.id = w."userId"
    WHERE LOWER(u.email) = LOWER($1)
    LIMIT 1
  `, [OWNER_EMAIL])

  const owner = ownerRes.rows[0] || {
    id: "primary-owner",
    name: "Ghdatastore Owner",
    email: OWNER_EMAIL,
    createdAt: new Date(),
    balance: 0,
  }

  const adminRes = await pool.query(`
    SELECT u.id, u.name, u.email, u."createdAt" as "joinedAt", sa."createdAt" as "appointedAt", COALESCE(w.balance, 0)::numeric as balance
    FROM system_admins sa
    JOIN "user" u ON sa."userId" = u.id
    LEFT JOIN wallets w ON u.id = w."userId"
    LIMIT 1
  `)

  return {
    owner,
    currentAdmin: adminRes.rows[0] || null,
  }
}

/**
 * Remove admin privileges from a user.
 * IMMUTABLE RULE: Pboxtv9@gmail.com can NEVER be revoked.
 */
export async function revokeAdminRole(targetUserId: string) {
  await requireOwner()
  await ensureAdminTables()

  const target = await pool.query(`SELECT id, email FROM "user" WHERE id = $1 LIMIT 1`, [targetUserId])
  if (!target.rows[0]) throw new Error("User account not found")

  // Permanent protection for primary owner
  if (isOwnerEmail(target.rows[0].email)) {
    throw new Error("Pboxtv9@gmail.com is the permanent primary owner and cannot be revoked.")
  }

  await pool.query(`DELETE FROM system_admins WHERE "userId" = $1`, [targetUserId])
  return { success: true }
}

/**
 * Ensures the primary owner account exists in Better Auth.
 * If not already created, registers the owner account with the specified credentials.
 */
export async function ensureOwnerAccountExists() {
  try {
    await ensureAdminTables()
    const existing = await pool.query(
      `SELECT id FROM "user" WHERE LOWER(email) = LOWER($1) LIMIT 1`,
      [OWNER_EMAIL]
    )

    if (existing.rows.length === 0) {
      await auth.api.signUpEmail({
        body: {
          email: OWNER_EMAIL,
          password: "Datasell@2026",
          name: "Ghdatastore Owner",
        },
      })
      // Ensure wallet row exists
      const created = await pool.query(
        `SELECT id FROM "user" WHERE LOWER(email) = LOWER($1) LIMIT 1`,
        [OWNER_EMAIL]
      )
      if (created.rows[0]?.id) {
        await pool.query(
          `INSERT INTO wallets ("userId", balance) VALUES ($1, 0) ON CONFLICT ("userId") DO NOTHING`,
          [created.rows[0].id]
        )
      }
    }
  } catch (err) {
    console.error("Error in ensureOwnerAccountExists:", err)
  }
}

export async function getAdminOverview() {
  await requireAdminOrOwner()
  await ensureAdminTables()

  // 1. Total users
  const usersCountRes = await pool.query(`SELECT COUNT(*)::int as count FROM "user"`)
  const totalUsers = usersCountRes.rows[0]?.count || 0

  // 2. Orders stats
  const orderStatsRes = await pool.query(`
    SELECT
      COUNT(*)::int as total_orders,
      COALESCE(SUM(CASE WHEN status = 'completed' THEN "customerPrice" ELSE 0 END), 0)::numeric as total_revenue,
      COALESCE(SUM(CASE WHEN status = 'completed' THEN "costPrice" ELSE 0 END), 0)::numeric as total_cost,
      COALESCE(SUM(CASE WHEN status = 'completed' THEN ("customerPrice" - "costPrice") ELSE 0 END), 0)::numeric as total_profit,
      COUNT(CASE WHEN status = 'pending' THEN 1 END)::int as pending_orders,
      COUNT(CASE WHEN status = 'completed' THEN 1 END)::int as completed_orders,
      COUNT(CASE WHEN status = 'failed' THEN 1 END)::int as failed_orders
    FROM orders
  `)
  const orderStats = orderStatsRes.rows[0] || {}

  // 3. Float in customer wallets
  const walletsRes = await pool.query(`SELECT COALESCE(SUM(balance), 0)::numeric as total_balance FROM wallets`)
  const totalWalletFloat = walletsRes.rows[0]?.total_balance || 0

  // 4. Total Admins count
  const adminsCountRes = await pool.query(`SELECT COUNT(*)::int as count FROM system_admins`)
  const totalAdmins = (adminsCountRes.rows[0]?.count || 0) + 1 // + 1 for primary owner

  // 5. Recent orders with customer info
  const recentOrdersRes = await pool.query(`
    SELECT
      o.id,
      o."userId",
      o.network,
      o.volume,
      o.recipient,
      o.reference,
      o."customerPrice",
      o."costPrice",
      o.status,
      o."createdAt",
      u.name as user_name,
      u.email as user_email
    FROM orders o
    LEFT JOIN "user" u ON o."userId" = u.id
    ORDER BY o."createdAt" DESC
    LIMIT 10
  `)

  // 6. Recent registered users
  const recentUsersRes = await pool.query(`
    SELECT
      u.id,
      u.name,
      u.email,
      u."referralCode",
      u."createdAt",
      COALESCE(w.balance, 0)::numeric as balance,
      (SELECT COUNT(*)::int FROM orders WHERE orders."userId" = u.id) as order_count,
      CASE
        WHEN LOWER(u.email) = LOWER($1) THEN 'owner'
        WHEN sa."userId" IS NOT NULL THEN 'admin'
        ELSE 'customer'
      END as role
    FROM "user" u
    LEFT JOIN wallets w ON u.id = w."userId"
    LEFT JOIN system_admins sa ON u.id = sa."userId"
    ORDER BY
      CASE
        WHEN LOWER(u.email) = LOWER($1) THEN 1
        WHEN sa."userId" IS NOT NULL THEN 2
        ELSE 3
      END,
      u."createdAt" DESC
    LIMIT 10
  `, [OWNER_EMAIL])

  return {
    totalUsers,
    totalAdmins,
    totalOrders: Number(orderStats.total_orders || 0),
    totalRevenue: Number(orderStats.total_revenue || 0),
    totalCost: Number(orderStats.total_cost || 0),
    totalProfit: Number(orderStats.total_profit || 0),
    pendingOrders: Number(orderStats.pending_orders || 0),
    completedOrders: Number(orderStats.completed_orders || 0),
    failedOrders: Number(orderStats.failed_orders || 0),
    totalWalletFloat: Number(totalWalletFloat),
    recentOrders: recentOrdersRes.rows,
    recentUsers: recentUsersRes.rows,
  }
}

export async function getAllAdminUsers() {
  await requireAdminOrOwner()
  await ensureAdminTables()

  const res = await pool.query(`
    SELECT
      u.id,
      u.name,
      u.email,
      u."referralCode",
      u."createdAt",
      COALESCE(w.balance, 0)::numeric as balance,
      (SELECT COUNT(*)::int FROM orders WHERE orders."userId" = u.id) as order_count,
      (SELECT COALESCE(SUM("customerPrice"), 0)::numeric FROM orders WHERE orders."userId" = u.id AND orders.status = 'completed') as total_spend,
      CASE
        WHEN LOWER(u.email) = LOWER($1) THEN 'owner'
        WHEN sa."userId" IS NOT NULL THEN 'admin'
        ELSE 'customer'
      END as role,
      sa."createdAt" as "adminSince"
    FROM "user" u
    LEFT JOIN wallets w ON u.id = w."userId"
    LEFT JOIN system_admins sa ON u.id = sa."userId"
    ORDER BY
      CASE
        WHEN LOWER(u.email) = LOWER($1) THEN 1
        WHEN sa."userId" IS NOT NULL THEN 2
        ELSE 3
      END,
      u."createdAt" DESC
  `, [OWNER_EMAIL])

  return res.rows
}

export async function getAllAdminOrders() {
  await requireAdminOrOwner()
  const res = await pool.query(`
    SELECT
      o.id,
      o."userId",
      o.network,
      o.volume,
      o.recipient,
      o.reference,
      o."customerPrice",
      o."costPrice",
      o.status,
      o."createdAt",
      u.name as user_name,
      u.email as user_email
    FROM orders o
    LEFT JOIN "user" u ON o."userId" = u.id
    ORDER BY o."createdAt" DESC
    LIMIT 200
  `)
  return res.rows
}
