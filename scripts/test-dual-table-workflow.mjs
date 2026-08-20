import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const BASE_URL = "http://localhost:3000"

async function testDualTableWorkflow() {
  console.log("================================================================")
  console.log("TESTING DUAL TABLE (CUSTOMER / STAFF) & NOTIFICATION WORKFLOW")
  console.log("================================================================")

  // 1. Verify DB Counts
  const customerCount = await prisma.customer.count()
  const staffCount = await prisma.user.count()
  console.log(`\n✓ Database verification:`)
  console.log(`  - Customer table count: ${customerCount} (Expected: 1)`)
  console.log(`  - Staff / User table count: ${staffCount} (Expected: 1)`)

  const singleCustomer = await prisma.customer.findUnique({ where: { email: "customer@example.com" } })
  const singleStaff = await prisma.user.findUnique({ where: { email: "user@example.com" } })

  if (!singleCustomer) throw new Error("customer@example.com not found in Customer table!")
  if (!singleStaff) throw new Error("user@example.com not found in User (Staff) table!")
  console.log(`  - Customer: ${singleCustomer.name} (${singleCustomer.email}, ID: ${singleCustomer.id})`)
  console.log(`  - Staff: ${singleStaff.name} (${singleStaff.email}, ID: ${singleStaff.id}, Tenant: BYD)`)

  // 2. Fetch Organizations
  const orgsRes = await fetch(`${BASE_URL}/api/v1/organizations`)
  const orgsData = await orgsRes.json()
  const bydOrg = orgsData.data.organizations.find(o => o.subdomain === "byd")
  if (!bydOrg) throw new Error("BYD organization not found!")
  console.log(`\n✓ Target organization found: ${bydOrg.name} (${bydOrg.id})`)

  // 3. Customer Login
  const custLoginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "customer@example.com", password: "Password123!" }),
  })
  const custLoginData = await custLoginRes.json()
  if (!custLoginData.success) throw new Error("Customer login failed: " + JSON.stringify(custLoginData))
  const custToken = custLoginData.data.token
  console.log(`\n✓ Customer login succeeded (AccountType: ${custLoginData.data.user.accountType})`)

  // 4. Customer Submits Complaint targeting BYD
  const complaintRes = await fetch(`${BASE_URL}/api/v1/mobile/complaints`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${custToken}` },
    body: JSON.stringify({
      title: "Dual-Table Notification Test Case",
      description: "Verifying that staff replies generate instant customer notifications.",
      tenantId: bydOrg.id,
      priority: "HIGH",
    }),
  })
  const complaintData = await complaintRes.json()
  if (!complaintData.success) throw new Error("Complaint submission failed: " + JSON.stringify(complaintData))
  const complaintId = complaintData.data.complaint.id
  console.log(`✓ Complaint created for BYD (ID: ${complaintId})`)

  // 5. Customer Submits Suggestion targeting BYD
  const suggRes = await fetch(`${BASE_URL}/api/v1/mobile/suggestions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${custToken}` },
    body: JSON.stringify({
      title: "Add EV mobile battery rescue service",
      description: "Offer emergency mobile charging van for stranded vehicles.",
      tenantId: bydOrg.id,
    }),
  })
  const suggData = await suggRes.json()
  if (!suggData.success) throw new Error("Suggestion failed: " + JSON.stringify(suggData))
  const suggId = suggData.data.suggestion.id
  console.log(`✓ Suggestion created for BYD (ID: ${suggId})`)

  // 6. Customer Submits Feedback targeting BYD
  const fbRes = await fetch(`${BASE_URL}/api/v1/mobile/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${custToken}` },
    body: JSON.stringify({
      message: "Showroom experience was fast and transparent.",
      rating: 5,
      tenantId: bydOrg.id,
    }),
  })
  const fbData = await fbRes.json()
  if (!fbData.success) throw new Error("Feedback failed: " + JSON.stringify(fbData))
  const fbId = fbData.data.feedback.id
  console.log(`✓ Feedback created for BYD (ID: ${fbId})`)

  // 7. Staff Login (user@example.com)
  const staffLoginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "user@example.com", password: "Password123!" }),
  })
  const staffLoginData = await staffLoginRes.json()
  if (!staffLoginData.success) throw new Error("Staff login failed: " + JSON.stringify(staffLoginData))
  const staffToken = staffLoginData.data.token
  console.log(`\n✓ Staff login succeeded (User: ${staffLoginData.data.user.name}, AccountType: ${staffLoginData.data.user.accountType})`)

  // 8. Staff Responds to Complaint
  const staffReplyRes = await fetch(`${BASE_URL}/api/v1/mobile/complaints/${complaintId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${staffToken}` },
    body: JSON.stringify({
      message: "Hello Demo Customer! We have received your case and assigned a technician to resolve it.",
      status: "IN_PROGRESS",
    }),
  })
  const staffReplyData = await staffReplyRes.json()
  if (!staffReplyData.success) throw new Error("Staff reply failed: " + JSON.stringify(staffReplyData))
  console.log(`✓ Staff replied to complaint and set status to IN_PROGRESS`)

  // 9. Staff Responds to Suggestion
  const staffSuggRes = await fetch(`${BASE_URL}/api/v1/mobile/suggestions/${suggId}/respond`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${staffToken}` },
    body: JSON.stringify({
      response: "Excellent idea! Our emergency roadside team is reviewing mobile charging van deployment.",
      status: "ACCEPTED",
    }),
  })
  const staffSuggData = await staffSuggRes.json()
  if (!staffSuggData.success) throw new Error("Staff suggestion response failed: " + JSON.stringify(staffSuggData))
  console.log(`✓ Staff responded to suggestion and accepted it`)

  // 10. Staff Responds to Feedback
  const staffFbRes = await fetch(`${BASE_URL}/api/v1/mobile/feedback/${fbId}/respond`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${staffToken}` },
    body: JSON.stringify({
      response: "Thank you for the 5-star review! We are glad you enjoyed the showroom experience.",
    }),
  })
  const staffFbData = await staffFbRes.json()
  if (!staffFbData.success) throw new Error("Staff feedback response failed: " + JSON.stringify(staffFbData))
  console.log(`✓ Staff responded to customer review`)

  // 11. Customer Checks Notifications
  console.log(`\n--- VERIFYING CUSTOMER NOTIFICATIONS ---`)
  const notifRes = await fetch(`${BASE_URL}/api/v1/mobile/notifications`, {
    headers: { Authorization: `Bearer ${custToken}` },
  })
  const notifData = await notifRes.json()
  if (!notifData.success) throw new Error("Notification fetch failed: " + JSON.stringify(notifData))

  const notifs = notifData.data.notifications
  console.log(`✓ Customer received ${notifs.length} total notifications (${notifData.data.unreadCount} unread):`)
  notifs.forEach((n, i) => {
    console.log(`  [${i + 1}] [${n.type}] "${n.title}": ${n.message} (Read: ${n.read})`)
  })

  if (notifs.length < 3) {
    throw new Error("FAILURE: Expected at least 3 notifications for complaint, suggestion, and feedback responses!")
  }

  // 12. Customer Marks Notifications As Read
  const markRes = await fetch(`${BASE_URL}/api/v1/mobile/notifications`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${custToken}` },
    body: JSON.stringify({ all: true }),
  })
  const markData = await markRes.json()
  if (!markData.success) throw new Error("Mark read failed")
  console.log(`✓ Customer marked notifications as read. Unread count now: ${markData.data.unreadCount}`)

  // 13. Customer checks dashboard metrics
  const custDashRes = await fetch(`${BASE_URL}/api/v1/mobile/dashboard`, {
    headers: { Authorization: `Bearer ${custToken}` },
  })
  const custDashData = await custDashRes.json()
  console.log(`✓ Customer dashboard metrics:`, custDashData.data.metrics)

  console.log("\n================================================================")
  console.log("ALL DUAL-TABLE & NOTIFICATION TESTS PASSED SUCCESSFULLY!")
  console.log("================================================================")
}

testDualTableWorkflow()
  .catch(err => {
    console.error("\n❌ TEST ERROR:", err.message || err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
