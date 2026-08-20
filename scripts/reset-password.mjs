// Set a fresh password on one identity row, in one table only.
//
//   node scripts/reset-password.mjs customer user@example.com
//   node scripts/reset-password.mjs staff    demo@example.com
//
// Customer and User are separate tables that can hold the same address, so the
// table is a required argument rather than something guessed from the email.
// The new password is appended to .env.rotated-credentials (covered by
// .gitignore's ".env*" rule and by .vercelignore) and deliberately never printed
// to stdout.
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { randomInt } from "node:crypto"
import { appendFileSync } from "node:fs"

const [table, email] = process.argv.slice(2)
if (table !== "customer" && table !== "staff") {
  console.error("usage: node scripts/reset-password.mjs <customer|staff> <email>")
  process.exit(1)
}
if (!email) {
  console.error("usage: node scripts/reset-password.mjs <customer|staff> <email>")
  process.exit(1)
}

// Grouped, unambiguous characters: ~95 bits of entropy that can still be read
// off a screen and typed without guessing whether that is an l or a 1.
const ALPHABET = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789"
const group = () => Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("")
const password = [group(), group(), group(), group()].join("-")

const prisma = new PrismaClient()
const delegate = table === "customer" ? prisma.customer : prisma.user

const row = await delegate.findFirst({ where: { email: email.toLowerCase() } })
if (!row) {
  console.error(`no ${table} row for ${email}`)
  await prisma.$disconnect()
  process.exit(1)
}

await delegate.update({
  where: { id: row.id },
  data: { passwordHash: await bcrypt.hash(password, 10) },
})

appendFileSync(
  ".env.rotated-credentials",
  `\n# ${table} table / "${row.name}" / reset ${new Date().toISOString()}\n${row.email}  ->  ${password}\n`,
)

console.log(`reset ${table} "${row.name}" <${row.email}>`)
console.log("new password appended to .env.rotated-credentials (not printed here)")

await prisma.$disconnect()
