const fs = require('fs')
const bcrypt = require('bcryptjs')
// Load .env manually so this script doesn't require extra deps
if (fs.existsSync('.env')) {
  const env = fs.readFileSync('.env', 'utf8')
  env.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^([^=]+)=(.*)$/)
    if (m) {
      let v = m[2]
      // strip surrounding quotes
      v = v.replace(/^\"(.*)\"$/, "$1").replace(/^\'(.*)\'$/, "$1")
      process.env[m[1]] = v
    }
  })
}
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@example.com'
  const password = 'Password123!'
  const name = 'Admin User'
  const businessName = 'Example Co'
  const sector = 'TECH'
  const subdomain = 'example'

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log('Admin user already exists:', email)
    return
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const tenant = await prisma.tenant.create({
    data: {
      name: businessName,
      sector,
      subdomain,
    },
  })

  const user = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      name,
      email,
      passwordHash,
      role: 'ADMIN',
    },
  })

  console.log('Created admin user:', email, 'password:', password)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
