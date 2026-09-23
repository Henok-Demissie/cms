import { auth } from "@/lib/auth"
import { pool } from "@/lib/db"
import { headers } from "next/headers"

export const OWNER_EMAIL = "pboxtv9@gmail.com"

export async function getCurrentSession() {
  return auth.api.getSession({ headers: await headers() })
}

export async function requireOwner() {
  const session = await getCurrentSession()
  if (!session?.user || session.user.email.toLowerCase() !== OWNER_EMAIL) {
    throw new Error("Owner access required")
  }
  return session
}

export async function listAccounts() {
  await requireOwner()
  const result = await pool.query(`
    SELECT id, name, email, "createdAt"
    FROM "user"
    ORDER BY "createdAt" DESC
  `)
  return result.rows.map((row) => ({
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    createdAt: row.createdAt as Date,
    isOwner: String(row.email).toLowerCase() === OWNER_EMAIL,
  }))
}

export async function revokeAccount(userId: string) {
  await requireOwner()
  const target = await pool.query(`SELECT email FROM "user" WHERE id = $1 LIMIT 1`, [userId])
  if (!target.rows[0]) throw new Error("Account not found")
  if (String(target.rows[0].email).toLowerCase() === OWNER_EMAIL) {
    throw new Error("The primary owner account cannot be revoked")
  }
  await pool.query(`DELETE FROM "user" WHERE id = $1`, [userId])
}
