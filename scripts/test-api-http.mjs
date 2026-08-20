async function testHttpApis() {
  const BASE_URL = "http://localhost:3000"
  console.log("Testing HTTP APIs on " + BASE_URL)

  // 1. GET /api/v1/organizations
  const orgsRes = await fetch(`${BASE_URL}/api/v1/organizations`)
  const orgsData = await orgsRes.json()
  if (!orgsData.success || !Array.isArray(orgsData.data.organizations)) {
    throw new Error("Failed to get organizations: " + JSON.stringify(orgsData))
  }
  console.log(`✓ GET /api/v1/organizations returned ${orgsData.data.organizations.length} organizations:`, orgsData.data.organizations.map(o => o.name).join(", "))
  const bydOrg = orgsData.data.organizations.find(o => o.subdomain === "byd")

  // 2. Customer Login
  const custLoginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "test_customer@abetbay.local", password: "Password123!" }),
  })
  const custLoginData = await custLoginRes.json()
  if (!custLoginData.success) throw new Error("Customer login failed: " + JSON.stringify(custLoginData))
  const custToken = custLoginData.data.token
  console.log("✓ POST /api/v1/auth/login (Customer) succeeded. Token received.")

  // 3. Customer Dashboard
  const custDashRes = await fetch(`${BASE_URL}/api/v1/mobile/dashboard`, {
    headers: { Authorization: `Bearer ${custToken}` },
  })
  const custDashData = await custDashRes.json()
  if (!custDashData.success) throw new Error("Customer dashboard failed: " + JSON.stringify(custDashData))
  console.log("✓ GET /api/v1/mobile/dashboard (Customer) metrics:", custDashData.data.metrics)

  // 4. Customer submits a new complaint via API
  const newComplaintRes = await fetch(`${BASE_URL}/api/v1/mobile/complaints`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${custToken}`,
    },
    body: JSON.stringify({
      title: "App Test: Battery range calibration",
      description: "Range estimation calibration is required after recent software update.",
      tenantId: bydOrg.id,
      priority: "MEDIUM",
    }),
  })
  const newComplaintData = await newComplaintRes.json()
  if (!newComplaintData.success) throw new Error("Complaint submission failed: " + JSON.stringify(newComplaintData))
  const createdComplaintId = newComplaintData.data.complaint.id
  console.log(`✓ POST /api/v1/mobile/complaints succeeded. Complaint ID: ${createdComplaintId}`)

  // 5. Staff Login (BYD Staff)
  const staffLoginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "byd_agent@byd.local", password: "Password123!" }),
  })
  const staffLoginData = await staffLoginRes.json()
  if (!staffLoginData.success) throw new Error("Staff login failed: " + JSON.stringify(staffLoginData))
  const staffToken = staffLoginData.data.token
  console.log("✓ POST /api/v1/auth/login (BYD Staff) succeeded. Token received.")

  // 6. Staff Dashboard
  const staffDashRes = await fetch(`${BASE_URL}/api/v1/mobile/dashboard`, {
    headers: { Authorization: `Bearer ${staffToken}` },
  })
  const staffDashData = await staffDashRes.json()
  if (!staffDashData.success) throw new Error("Staff dashboard failed: " + JSON.stringify(staffDashData))
  console.log("✓ GET /api/v1/mobile/dashboard (Staff) metrics:", staffDashData.data.metrics)

  // 7. Staff replies to the complaint via API
  const replyRes = await fetch(`${BASE_URL}/api/v1/mobile/complaints/${createdComplaintId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${staffToken}`,
    },
    body: JSON.stringify({
      message: "We have scheduled your vehicle calibration for tomorrow morning at the service center.",
      status: "IN_PROGRESS",
    }),
  })
  const replyData = await replyRes.json()
  if (!replyData.success) throw new Error("Staff reply failed: " + JSON.stringify(replyData))
  console.log("✓ POST /api/v1/mobile/complaints/:id reply posted by Staff.")

  // 8. Customer fetches complaint details and verifies staff message
  const custFetchRes = await fetch(`${BASE_URL}/api/v1/mobile/complaints/${createdComplaintId}`, {
    headers: { Authorization: `Bearer ${custToken}` },
  })
  const custFetchData = await custFetchRes.json()
  if (!custFetchData.success) throw new Error("Customer fetch failed: " + JSON.stringify(custFetchData))
  const receivedMessages = custFetchData.data.complaint.messages
  if (receivedMessages.length === 0 || !receivedMessages[0].message.includes("scheduled your vehicle calibration")) {
    throw new Error("Customer did not receive the expected staff reply: " + JSON.stringify(receivedMessages))
  }
  console.log(`✓ Customer successfully retrieved Staff response: "${receivedMessages[0].message}"`)

  console.log("==========================================")
  console.log("ALL HTTP REST API INTEGRATION TESTS PASSED!")
  console.log("==========================================")
}

testHttpApis().catch(err => {
  console.error("HTTP test failed:", err)
  process.exit(1)
})
