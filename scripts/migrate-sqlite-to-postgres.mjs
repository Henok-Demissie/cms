// One-off data migration: SQLite (local dev.db) -> Supabase Postgres.
//
// Prisma Client is generated per-provider, so it can no longer read the SQLite
// file after the datasource switch. We read the old database directly with
// node:sqlite and write through Prisma.
//
// Two value conversions are required:
//   DateTime -> SQLite stores epoch milliseconds as INTEGER; Postgres wants a Date
//   Boolean  -> SQLite stores 0/1 as INTEGER; Postgres wants a real boolean
//
// Usage: node --experimental-sqlite scripts/migrate-sqlite-to-postgres.mjs <path-to-dev.db>

import { DatabaseSync } from "node:sqlite"
import { readFileSync } from "node:fs"
import { PrismaClient } from "@prisma/client"

const sqlitePath = process.argv[2]
if (!sqlitePath) {
  console.error("usage: node --experimental-sqlite scripts/migrate-sqlite-to-postgres.mjs <path-to-dev.db>")
  process.exit(1)
}

// Insert order matters: every model must land after the models it references.
//   User      -> Tenant
//   Complaint -> Tenant, Customer, User
//   messages/reactions -> Complaint, User, Customer
//   Notification/Suggestion/Feedback -> Customer, Tenant
const ORDER = [
  "Tenant",
  "Customer",
  "User",
  "Complaint",
  "ComplaintMessage",
  "ComplaintReaction",
  "Notification",
  "Suggestion",
  "Feedback",
]

/** Build { Model: { field: baseType } } from schema.prisma. */
function parseFieldTypes(schemaText) {
  const types = {}
  let model = null
  for (const raw of schemaText.split("\n")) {
    const line = raw.trim()
    const open = line.match(/^model\s+(\w+)\s*\{/)
    if (open) {
      model = open[1]
      types[model] = {}
      continue
    }
    if (line === "}") {
      model = null
      continue
    }
    if (!model || line.startsWith("//") || line.startsWith("@@")) continue
    const field = line.match(/^(\w+)\s+(\w+)/)
    if (field) types[model][field[1]] = field[2]
  }
  return types
}

function convertRow(row, fieldTypes) {
  const out = {}
  for (const [key, value] of Object.entries(row)) {
    const type = fieldTypes[key]
    if (value === null || value === undefined) {
      out[key] = null
    } else if (type === "DateTime") {
      out[key] = new Date(value)
    } else if (type === "Boolean") {
      out[key] = Boolean(value)
    } else {
      out[key] = value
    }
  }
  return out
}

const schema = parseFieldTypes(readFileSync("prisma/schema.prisma", "utf8"))
const db = new DatabaseSync(sqlitePath, { readOnly: true })
const prisma = new PrismaClient()

const summary = []
let failed = false

try {
  for (const model of ORDER) {
    const rows = db.prepare(`SELECT * FROM "${model}"`).all()
    const delegate = prisma[model[0].toLowerCase() + model.slice(1)]

    if (rows.length === 0) {
      summary.push({ model, read: 0, written: 0 })
      continue
    }

    const data = rows.map((r) => convertRow(r, schema[model] ?? {}))
    await delegate.createMany({ data, skipDuplicates: true })
    const written = await delegate.count()
    summary.push({ model, read: rows.length, written })
    console.log(`  ${model.padEnd(18)} read ${String(rows.length).padStart(3)}  ->  now in postgres: ${written}`)
  }
} catch (err) {
  failed = true
  console.error("\nMIGRATION FAILED:", err.message)
} finally {
  db.close()
  await prisma.$disconnect()
}

console.log("\n--- summary ---")
let mismatch = false
for (const s of summary) {
  const ok = s.read === s.written
  if (!ok) mismatch = true
  console.log(`  ${ok ? "OK  " : "DIFF"} ${s.model.padEnd(18)} sqlite=${s.read} postgres=${s.written}`)
}
console.log(mismatch || failed ? "\nRESULT: needs attention" : "\nRESULT: all counts match")
process.exit(failed || mismatch ? 1 : 0)
