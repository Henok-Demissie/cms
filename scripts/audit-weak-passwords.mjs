// Read-only audit: report accounts whose password is a well-known default.
// Run: node scripts/audit-weak-passwords.mjs
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const WEAK = ["Password123!", "password", "Password123", "12345678",
              "password123", "admin", "Admin123!", "test1234", "abetbay"]
const prisma = new PrismaClient()
const found = []

for (const model of ["user", "customer"]) {
  const rows = await prisma[model].findMany({
    select: { id: true, email: true, name: true, role: true, passwordHash: true },
  })
  for (const r of rows) {
    let hit = null
    for (const w of WEAK) {
      if (await bcrypt.compare(w, r.passwordHash)) { hit = w; break }
    }
    if (hit) found.push({ model, ...r, weak: hit })
    console.log(`${model.padEnd(9)} ${r.email.padEnd(30)} ${String(r.role).padEnd(9)} ${hit ? "WEAK <- " + hit : "ok"}`)
  }
}
console.log(`\n${found.length} account(s) using a known default password.`)
await prisma.$disconnect()
