import { NextResponse } from "next/server"
import { pool } from "@/lib/db"

/**
 * One-time migration: adds the referralCode column to the user table.
 * Call GET /api/migrate once after deploying. Protected by MIGRATION_SECRET.
 * Safe to call multiple times — uses IF NOT EXISTS.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get("secret")

  if (!process.env.MIGRATION_SECRET || secret !== process.env.MIGRATION_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await pool.query(`
      ALTER TABLE "user"
      ADD COLUMN IF NOT EXISTS "referralCode" TEXT UNIQUE;
    `)
    return NextResponse.json({ ok: true, message: "Migration complete: referralCode column added." })
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 },
    )
  }
}
