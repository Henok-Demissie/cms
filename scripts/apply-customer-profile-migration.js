const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function main() {
  const columns = await prisma.$queryRawUnsafe('PRAGMA table_info("User")')
  const existing = new Set(columns.map((column) => column.name))
  const additions = [
    ["firstName", "TEXT"], ["gender", "TEXT"], ["language", "TEXT DEFAULT 'AM'"],
    ["lastName", "TEXT"], ["nationalId", "TEXT"], ["phone", "TEXT"],
  ]
  for (const [name, definition] of additions) {
    if (!existing.has(name)) await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN "${name}" ${definition}`)
  }
  const indexes = await prisma.$queryRawUnsafe('PRAGMA index_list("User")')
  if (!indexes.some((index) => index.name === "User_phone_key")) {
    await prisma.$executeRawUnsafe('CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone")')
  }
  console.log("CUSTOMER_PROFILE_SCHEMA_READY")
}

main().finally(() => prisma.$disconnect())
