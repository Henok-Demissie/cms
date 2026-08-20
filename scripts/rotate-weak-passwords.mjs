// Rotate accounts that use a known default password to strong random ones.
// New credentials are written to .env.rotated-credentials, which .gitignore's
// ".env*" rule already covers, so they never reach git. They are deliberately
// not printed to stdout.
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { randomBytes } from "node:crypto"
import { writeFileSync } from "node:fs"

const WEAK = ["Password123!", "password", "Password123", "12345678",
              "password123", "admin", "Admin123!", "test1234", "abetbay"]

// Base64url minus lookalike characters, so the password can be read aloud.
const strong = () =>
  randomBytes(24).toString("base64url").replace(/[-_lIO0]/g, "x").slice(0, 20) + "9!Aa"

const prisma = new PrismaClient()
const rotated = []

for (const model of ["user", "customer"]) {
  const rows = await prisma[model].findMany({
    select: { id: true, email: true, role: true, passwordHash: true },
  })
  for (const r of rows) {
    let weak = false
    for (const w of WEAK) {
      if (await bcrypt.compare(w, r.passwordHash)) { weak = true; break }
    }
    if (!weak) continue
    const pw = strong()
    await prisma[model].update({
      where: { id: r.id },
      data: { passwordHash: await bcrypt.hash(pw, 10) },
    })
    rotated.push({ table: model, email: r.email, role: r.role, password: pw })
    console.log(`rotated ${model}/${r.email} (${r.role})`)
  }
}

if (rotated.length) {
  const body =
    "# Rotated " + new Date().toISOString() + "\n" +
    "# These replaced known default passwords on the live site.\n" +
    "# This file is gitignored (.env* rule). Move these into a password manager\n" +
    "# and delete this file.\n\n" +
    rotated.map(r => `# ${r.table} / ${r.role}\n${r.email}  ->  ${r.password}`).join("\n\n") + "\n"
  writeFileSync(".env.rotated-credentials", body)
  console.log(`\n${rotated.length} rotated. Credentials in .env.rotated-credentials`)
} else {
  console.log("\nnothing to rotate")
}
await prisma.$disconnect()
