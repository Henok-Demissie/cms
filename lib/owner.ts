import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { pool, db } from "@/lib/db"
import { user, orders, wallets, topups } from "@/lib/db/schema"
import { desc, sql, eq } from "drizzle-orm"

export const OWNER_EMAIL = "pboxtv9@gmail.com"

export function isOwnerEmail(email?: string | null): boolean {
  if (!email) return false
  return email.trim().toLowerCase() === OWNER_EMAIL.toLowerCase()
}

export async function getCurrentSession() {
  return auth.api.getSession({ headers: await headers() })
}

export async function requireOwner() {
  const session = await getCurrentSession()
  if (!session?.user) {
    redirect("/sign-in")
  }
  if (!isOwnerEmail(session.user.email)) {
    redirect("/dashboard")
  }
  return session
}

/**
 * Ensures the primary owner account exists in Better Auth.
 * If not already created, registers the owner account with the specified credentials.
 */
export async function ensureOwnerAccountExists() {
  try {
    const existing = await pool.query(
      `SELECT id FROM "user" WHERE LOWER(email) = LOWER($1) LIMIT 1`,
      [OWNER_EMAIL]
    )

    if (existing.rows.length === 0) {
      await auth.api.signUpEmail({
        body: {
          email: OWNER_EMAIL,
          password: "Datasell@2026",
          name: "DataSpots Owner",
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
  await requireOwner()

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

  // 4. Recent orders with customer info
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

  // 5. Recent registered users
  const recentUsersRes = await pool.query(`
    SELECT
      u.id,
      u.name,
      u.email,
      u."referralCode",
      u."createdAt",
      COALESCE(w.balance, 0)::numeric as balance,
      (SELECT COUNT(*)::int FROM orders WHERE orders."userId" = u.id) as order_count
    FROM "user" u
    LEFT JOIN wallets w ON u.id = w."userId"
    ORDER BY u."createdAt" DESC
    LIMIT 10
  `)

  return {
    totalUsers,
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
  await requireOwner()
  const res = await pool.query(`
    SELECT
      u.id,
      u.name,
      u.email,
      u."referralCode",
      u."createdAt",
      COALESCE(w.balance, 0)::numeric as balance,
      (SELECT COUNT(*)::int FROM orders WHERE orders."userId" = u.id) as order_count,
      (SELECT COALESCE(SUM("customerPrice"), 0)::numeric FROM orders WHERE orders."userId" = u.id AND orders.status = 'completed') as total_spend
    FROM "user" u
    LEFT JOIN wallets w ON u.id = w."userId"
    ORDER BY u."createdAt" DESC
  `)
  return res.rows
}

export async function getAllAdminOrders() {
  await requireOwner()
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
