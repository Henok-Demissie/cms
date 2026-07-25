const fs = require("fs")

if (fs.existsSync(".env")) {
  const env = fs.readFileSync(".env", "utf8")
  env.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^([^=]+)=(.*)$/)
    if (m) {
      let v = m[2]
      v = v.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1")
      process.env[m[1]] = v
    }
  })
}

const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

const demoComplaints = [
  {
    customerName: "Alicia Brooks",
    customerPhone: "+1 202-555-0101",
    customerEmail: "alicia@example.com",
    source: "EMAIL",
    title: "Delayed delivery refund",
    description:
      "The customer reported a delayed delivery and requested a refund for the missing shipment window.",
    status: "IN_REVIEW",
    priority: "HIGH",
    daysAgo: 2,
  },
  {
    customerName: "Marcus Lee",
    customerPhone: "+1 202-555-0123",
    customerEmail: "marcus@example.com",
    source: "PHONE",
    title: "Billing mismatch",
    description:
      "The customer noticed an invoice amount that did not match the order confirmation.",
    status: "ASSIGNED",
    priority: "CRITICAL",
    daysAgo: 5,
  },
  {
    customerName: "Nina Patel",
    customerPhone: "+1 202-555-0144",
    customerEmail: "nina@example.com",
    source: "WEB",
    title: "Order not received",
    description:
      "The customer reported that the order had not arrived after the expected delivery date.",
    status: "RESOLVED",
    priority: "MEDIUM",
    daysAgo: 12,
  },
  {
    customerName: "Daniel Ortiz",
    customerPhone: "+1 202-555-0187",
    customerEmail: "daniel@example.com",
    source: "WHATSAPP",
    title: "Wrong item delivered",
    description:
      "The customer received the wrong product and requested a replacement or credit.",
    status: "NEW",
    priority: "HIGH",
    daysAgo: 1,
  },
  {
    customerName: "Sarah Chen",
    customerPhone: "+1 202-555-0199",
    customerEmail: "sarah@example.com",
    source: "EMAIL",
    title: "Subscription cancellation issue",
    description:
      "Customer was charged after cancelling their subscription and wants an immediate refund.",
    status: "NEW",
    priority: "MEDIUM",
    daysAgo: 0,
  },
  {
    customerName: "James Wilson",
    customerPhone: "+1 202-555-0210",
    customerEmail: "james@example.com",
    source: "PHONE",
    title: "Damaged package on arrival",
    description:
      "Product arrived with visible damage to the packaging and the item inside was broken.",
    status: "CLOSED",
    priority: "LOW",
    daysAgo: 30,
  },
  {
    customerName: "Emily Rodriguez",
    customerPhone: "+1 202-555-0222",
    customerEmail: "emily@example.com",
    source: "WEB",
    title: "Account access locked",
    description:
      "Customer cannot log in after multiple failed attempts and needs account recovery support.",
    status: "IN_REVIEW",
    priority: "MEDIUM",
    daysAgo: 3,
  },
  {
    customerName: "Tom Baker",
    customerPhone: "+1 202-555-0233",
    customerEmail: "tom@example.com",
    source: "OTHER",
    title: "Promo code not applied",
    description:
      "A valid promotional code was rejected at checkout and the customer wants the discount applied.",
    status: "RESOLVED",
    priority: "LOW",
    daysAgo: 18,
  },
]

function daysAgoDate(daysAgo) {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date
}

async function seedTenantComplaints(tenant) {
  const existing = await prisma.complaint.count({ where: { tenantId: tenant.id } })
  if (existing > 0) {
    console.log(`Skipping ${tenant.name} — already has ${existing} complaint(s)`)
    return 0
  }

  await prisma.complaint.createMany({
    data: demoComplaints.map((complaint) => {
      const createdAt = daysAgoDate(complaint.daysAgo)
      return {
        tenantId: tenant.id,
        customerName: complaint.customerName,
        customerPhone: complaint.customerPhone,
        customerEmail: complaint.customerEmail,
        source: complaint.source,
        title: complaint.title,
        description: complaint.description,
        status: complaint.status,
        priority: complaint.priority,
        createdAt,
        updatedAt: createdAt,
      }
    }),
  })

  console.log(`Seeded ${demoComplaints.length} demo complaints for ${tenant.name}`)
  return demoComplaints.length
}

async function main() {
  const tenants = await prisma.tenant.findMany()
  if (tenants.length === 0) {
    console.log("No tenants found. Run seed-admin.js first.")
    return
  }

  let total = 0
  for (const tenant of tenants) {
    total += await seedTenantComplaints(tenant)
  }

  console.log(total > 0 ? `Done. Added ${total} demo complaint(s).` : "No new demo complaints added.")
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
