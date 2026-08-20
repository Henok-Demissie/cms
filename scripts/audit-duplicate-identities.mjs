// Read-only: report every identity that exists in both tables, plus what each
// side of a collision owns. Nothing here writes.
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

const customers = await prisma.customer.findMany({
  select: { id: true, name: true, email: true, phone: true, createdAt: true },
})
const staff = await prisma.user.findMany({
  select: { id: true, name: true, email: true, role: true, tenantId: true, createdAt: true },
})

const staffByEmail = new Map(staff.map((s) => [s.email.toLowerCase(), s]))
const collisions = customers.filter((c) => staffByEmail.has(c.email.toLowerCase()))

console.log(`customers: ${customers.length}   staff: ${staff.length}`)
console.log(`\n=== addresses present in BOTH tables: ${collisions.length} ===`)

for (const c of collisions) {
  const s = staffByEmail.get(c.email.toLowerCase())
  const [complaints, suggestions, feedback, notifications] = await Promise.all([
    prisma.complaint.count({
      where: { OR: [{ customerId: c.id }, { customerEmail: c.email }] },
    }),
    prisma.suggestion.count({ where: { customerId: c.id } }),
    prisma.feedback.count({ where: { customerId: c.id } }),
    prisma.notification.count({ where: { customerId: c.id } }),
  ])
  const [assigned, authored] = await Promise.all([
    prisma.complaint.count({ where: { assignedToId: s.id } }),
    prisma.complaintMessage.count({ where: { authorId: s.id } }),
  ])
  console.log(`\n${c.email}`)
  console.log(`  CUSTOMER  ${c.id}  "${c.name}"  created ${c.createdAt.toISOString().slice(0, 10)}`)
  console.log(`            owns ${complaints} complaints, ${suggestions} suggestions, ${feedback} feedback, ${notifications} notifications`)
  console.log(`  STAFF     ${s.id}  "${s.name}"  ${s.role}  tenant ${s.tenantId}  created ${s.createdAt.toISOString().slice(0, 10)}`)
  console.log(`            assigned ${assigned} complaints, wrote ${authored} messages`)
}

console.log(`\n=== all staff ===`)
for (const s of staff) {
  console.log(`  ${s.email.padEnd(28)} ${s.role.padEnd(12)} tenant=${s.tenantId}  "${s.name}"`)
}
console.log(`\n=== all customers ===`)
for (const c of customers) {
  console.log(`  ${c.email.padEnd(28)} phone=${c.phone ?? "-"}  "${c.name}"`)
}

await prisma.$disconnect()
