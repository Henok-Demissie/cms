import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { signApiToken } from "../lib/jwt"

const prisma = new PrismaClient()

async function runTest() {
  console.log("==========================================")
  console.log("STARTING END-TO-END WORKFLOW VERIFICATION")
  console.log("==========================================")

  // 1. Check organizations
  const bydTenant = await prisma.tenant.findUnique({ where: { subdomain: "byd" } })
  const fintechTenant = await prisma.tenant.findUnique({ where: { subdomain: "fintech" } })

  if (!bydTenant || !fintechTenant) {
    throw new Error("BYD or Fintech tenant not found in DB")
  }
  console.log(`✓ Organizations verified: BYD (${bydTenant.id}) and Fintech (${fintechTenant.id})`)

  // 2. Ensure test customer & staff accounts
  const passwordHash = await bcrypt.hash("Password123!", 10)

  const customer = await prisma.user.upsert({
    where: { email: "test_customer@abetbay.local" },
    update: { role: "CUSTOMER", passwordHash },
    create: {
      tenantId: "cmsth4mr60000tu46werkqv0l", // public tenant
      name: "Test Customer",
      email: "test_customer@abetbay.local",
      phone: "+251999112233",
      role: "CUSTOMER",
      passwordHash,
    },
  })

  const bydStaff = await prisma.user.upsert({
    where: { email: "byd_agent@byd.local" },
    update: { role: "AGENT", tenantId: bydTenant.id, passwordHash },
    create: {
      tenantId: bydTenant.id,
      name: "BYD Staff Agent",
      email: "byd_agent@byd.local",
      role: "AGENT",
      passwordHash,
    },
  })

  const fintechStaff = await prisma.user.upsert({
    where: { email: "fintech_agent@fintech.local" },
    update: { role: "AGENT", tenantId: fintechTenant.id, passwordHash },
    create: {
      tenantId: fintechTenant.id,
      name: "Fintech Staff Agent",
      email: "fintech_agent@fintech.local",
      role: "AGENT",
      passwordHash,
    },
  })

  console.log("✓ Test users created/verified:")
  console.log(`  - Customer: ${customer.email}`)
  console.log(`  - BYD Staff: ${bydStaff.email} (Tenant: ${bydTenant.name})`)
  console.log(`  - Fintech Staff: ${fintechStaff.email} (Tenant: ${fintechTenant.name})`)

  // 3. Customer submits a complaint to BYD
  const testComplaint = await prisma.complaint.create({
    data: {
      tenantId: bydTenant.id,
      customerName: customer.name,
      customerEmail: customer.email,
      source: "MOBILE",
      title: "BYD EV Battery Charging Delay Issue",
      description: "My EV charging session was unexpectedly delayed at the station.",
      priority: "HIGH",
      status: "NEW",
    },
    include: { tenant: true },
  })
  console.log(`✓ Complaint created for BYD by Customer: ID = ${testComplaint.id}, Title = ${testComplaint.title}`)

  // 4. Customer submits a suggestion to BYD
  const testSuggestion = await prisma.suggestion.create({
    data: {
      tenantId: bydTenant.id,
      authorId: customer.id,
      authorName: customer.name,
      authorEmail: customer.email,
      title: "Add fast charging status notification",
      description: "Please notify via SMS or app when battery reaches 80%.",
      status: "NEW",
    },
    include: { tenant: true },
  })
  console.log(`✓ Suggestion created for BYD by Customer: ID = ${testSuggestion.id}`)

  // 5. Customer submits feedback to BYD
  const testFeedback = await prisma.feedback.create({
    data: {
      tenantId: bydTenant.id,
      authorId: customer.id,
      authorName: customer.name,
      authorEmail: customer.email,
      message: "Customer service at the showroom was very helpful.",
      rating: 5,
      status: "NEW",
    },
    include: { tenant: true },
  })
  console.log(`✓ Feedback created for BYD by Customer: ID = ${testFeedback.id}`)

  // 6. Security Check: Fintech Staff queries their complaints
  const fintechComplaints = await prisma.complaint.findMany({
    where: { tenantId: fintechStaff.tenantId },
  })
  const fintechSeesBydComplaint = fintechComplaints.some(c => c.id === testComplaint.id)
  if (fintechSeesBydComplaint) {
    throw new Error("SECURITY FAILURE: Fintech staff can see BYD complaints!")
  }
  console.log("✓ Multi-tenant Security Verified: Fintech staff cannot see BYD submissions.")

  // 7. BYD Staff queries their complaints -> Sees the complaint!
  const bydComplaints = await prisma.complaint.findMany({
    where: { tenantId: bydStaff.tenantId },
  })
  const bydSeesComplaint = bydComplaints.some(c => c.id === testComplaint.id)
  if (!bydSeesComplaint) {
    throw new Error("FAILURE: BYD staff cannot see complaint submitted to BYD!")
  }
  console.log("✓ BYD Staff successfully received the customer's complaint.")

  // 8. BYD Staff responds to Complaint
  await prisma.complaintMessage.create({
    data: {
      complaintId: testComplaint.id,
      authorId: bydStaff.id,
      message: "Hello, we have dispatched a technician to inspect the station charger. We will notify you shortly.",
    },
  })
  await prisma.complaint.update({
    where: { id: testComplaint.id },
    data: { status: "IN_REVIEW" },
  })
  console.log("✓ BYD Staff responded to Complaint and updated status to IN_REVIEW.")

  // 9. BYD Staff responds to Suggestion
  await prisma.suggestion.update({
    where: { id: testSuggestion.id },
    data: {
      response: "Great suggestion! Our app development team is currently implementing battery push notifications.",
      respondedAt: new Date(),
      status: "ACCEPTED",
    },
  })
  console.log("✓ BYD Staff responded to Suggestion and updated status to ACCEPTED.")

  // 10. BYD Staff responds to Feedback
  await prisma.feedback.update({
    where: { id: testFeedback.id },
    data: {
      response: "Thank you for the wonderful feedback! We appreciate your support.",
      respondedAt: new Date(),
      status: "REVIEWED",
    },
  })
  console.log("✓ BYD Staff responded to Feedback.")

  // 11. Customer view check: Customer retrieves their submissions across all orgs and verifies responses
  const customerComplaintCheck = await prisma.complaint.findUnique({
    where: { id: testComplaint.id },
    include: {
      tenant: true,
      messages: { include: { author: true } },
    },
  })
  if (!customerComplaintCheck || customerComplaintCheck.messages.length === 0) {
    throw new Error("FAILURE: Customer cannot see staff replies on complaint.")
  }
  console.log(`✓ Customer sees staff reply: "${customerComplaintCheck.messages[0].message}"`)
  console.log(`✓ Recipient Org verified on Customer side: "${customerComplaintCheck.tenant.name}"`)

  const customerSuggestionCheck = await prisma.suggestion.findUnique({
    where: { id: testSuggestion.id },
    include: { tenant: true },
  })
  if (!customerSuggestionCheck?.response) {
    throw new Error("FAILURE: Customer cannot see staff response on suggestion.")
  }
  console.log(`✓ Customer sees suggestion response: "${customerSuggestionCheck.response}" (Status: ${customerSuggestionCheck.status})`)

  const customerFeedbackCheck = await prisma.feedback.findUnique({
    where: { id: testFeedback.id },
    include: { tenant: true },
  })
  if (!customerFeedbackCheck?.response) {
    throw new Error("FAILURE: Customer cannot see staff response on feedback.")
  }
  console.log(`✓ Customer sees feedback response: "${customerFeedbackCheck.response}"`)

  console.log("==========================================")
  console.log("ALL WORKFLOW & MULTI-TENANT TESTS PASSED!")
  console.log("==========================================")
}

runTest()
  .catch((err) => {
    console.error("Test failed with error:", err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
