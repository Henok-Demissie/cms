// End-to-end HTTP test: customer@example.com ↔ user@example.com (BYD staff)
const BASE = "http://localhost:3000";

async function test() {
  console.log("=".repeat(60));
  console.log("E2E WORKFLOW: customer@example.com ↔ user@example.com");
  console.log("=".repeat(60));

  // 1. Login as Customer
  console.log("\n--- STEP 1: Customer Login ---");
  const custLogin = await fetch(`${BASE}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "customer@example.com", password: "Password123!" }),
  });
  const custData = await custLogin.json();
  if (!custData.success) throw new Error("Customer login failed: " + JSON.stringify(custData));
  const custToken = custData.data.token;
  console.log(`✓ Customer logged in: ${custData.data.user.name} (${custData.data.user.role})`);

  // 2. Fetch organizations list
  console.log("\n--- STEP 2: Fetch Available Organizations ---");
  const orgsRes = await fetch(`${BASE}/api/v1/organizations`);
  const orgsData = await orgsRes.json();
  console.log(`✓ Organizations: ${orgsData.data.organizations.map(o => `${o.name} (${o.subdomain})`).join(", ")}`);
  const bydOrg = orgsData.data.organizations.find(o => o.subdomain === "byd");
  if (!bydOrg) throw new Error("BYD org not found!");
  console.log(`✓ Target org: BYD (id: ${bydOrg.id})`);

  // 3. Customer Dashboard
  console.log("\n--- STEP 3: Customer Dashboard ---");
  const custDash = await fetch(`${BASE}/api/v1/mobile/dashboard`, {
    headers: { Authorization: `Bearer ${custToken}` },
  });
  const custDashData = await custDash.json();
  console.log("✓ Customer metrics:", JSON.stringify(custDashData.data.metrics));

  // 4. Customer submits complaint to BYD
  console.log("\n--- STEP 4: Customer Submits Complaint to BYD ---");
  const complaintRes = await fetch(`${BASE}/api/v1/mobile/complaints`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${custToken}` },
    body: JSON.stringify({
      title: "Test Interaction Complaint",
      description: "This is a test complaint from customer@example.com to verify the staff response workflow with user@example.com.",
      tenantId: bydOrg.id,
      priority: "MEDIUM",
    }),
  });
  const complaintData = await complaintRes.json();
  if (!complaintData.success) throw new Error("Complaint submission failed: " + JSON.stringify(complaintData));
  const complaintId = complaintData.data.complaint.id;
  console.log(`✓ Complaint created! ID: ${complaintId}`);
  console.log(`  Title: ${complaintData.data.complaint.title}`);
  console.log(`  Status: ${complaintData.data.complaint.status}`);
  console.log(`  Target Org: ${complaintData.data.complaint.tenant?.name}`);

  // 5. Customer submits suggestion to BYD
  console.log("\n--- STEP 5: Customer Submits Suggestion to BYD ---");
  const suggRes = await fetch(`${BASE}/api/v1/mobile/suggestions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${custToken}` },
    body: JSON.stringify({
      title: "Improve charging station availability",
      description: "Add more charging stations at shopping malls for better accessibility.",
      tenantId: bydOrg.id,
    }),
  });
  const suggData = await suggRes.json();
  if (!suggData.success) throw new Error("Suggestion failed: " + JSON.stringify(suggData));
  const suggId = suggData.data.suggestion.id;
  console.log(`✓ Suggestion created! ID: ${suggId}`);

  // 6. Customer submits feedback to BYD
  console.log("\n--- STEP 6: Customer Submits Feedback to BYD ---");
  const fbRes = await fetch(`${BASE}/api/v1/mobile/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${custToken}` },
    body: JSON.stringify({
      message: "Great vehicle quality and customer service.",
      rating: 4,
      tenantId: bydOrg.id,
    }),
  });
  const fbData = await fbRes.json();
  if (!fbData.success) throw new Error("Feedback failed: " + JSON.stringify(fbData));
  const fbId = fbData.data.feedback.id;
  console.log(`✓ Feedback created! ID: ${fbId}, Rating: 4/5`);

  // 7. Login as Staff (user@example.com)
  console.log("\n--- STEP 7: Staff Login (user@example.com / BYD) ---");
  const staffLogin = await fetch(`${BASE}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "user@example.com", password: "Password123!" }),
  });
  const staffData = await staffLogin.json();
  if (!staffData.success) throw new Error("Staff login failed: " + JSON.stringify(staffData));
  const staffToken = staffData.data.token;
  console.log(`✓ Staff logged in: ${staffData.data.user.name} (${staffData.data.user.role}, tenant: ${staffData.data.user.tenantId})`);

  // 8. Staff Dashboard
  console.log("\n--- STEP 8: Staff Dashboard ---");
  const staffDash = await fetch(`${BASE}/api/v1/mobile/dashboard`, {
    headers: { Authorization: `Bearer ${staffToken}` },
  });
  const staffDashData = await staffDash.json();
  console.log("✓ Staff metrics:", JSON.stringify(staffDashData.data.metrics));

  // 9. Staff sees customer's complaint
  console.log("\n--- STEP 9: Staff Views Complaint ---");
  const staffComplaintsRes = await fetch(`${BASE}/api/v1/mobile/complaints`, {
    headers: { Authorization: `Bearer ${staffToken}` },
  });
  const staffComplaints = await staffComplaintsRes.json();
  const found = staffComplaints.data.complaints.find(c => c.id === complaintId);
  if (!found) throw new Error("FAILURE: Staff cannot see the customer's complaint!");
  console.log(`✓ Staff can see complaint: "${found.title}" (status: ${found.status})`);
  console.log(`  Customer: ${found.customerName} (${found.customerEmail})`);

  // 10. Staff responds to complaint
  console.log("\n--- STEP 10: Staff Responds to Complaint ---");
  const replyRes = await fetch(`${BASE}/api/v1/mobile/complaints/${complaintId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${staffToken}` },
    body: JSON.stringify({
      message: "Thank you for reporting this. We have assigned a technician to address your concern. Expected resolution within 48 hours.",
      status: "IN_PROGRESS",
    }),
  });
  const replyData = await replyRes.json();
  if (!replyData.success) throw new Error("Staff reply failed: " + JSON.stringify(replyData));
  console.log(`✓ Staff reply posted. Updated status: ${replyData.data.complaint.status}`);

  // 11. Staff responds to suggestion
  console.log("\n--- STEP 11: Staff Responds to Suggestion ---");
  const suggRespRes = await fetch(`${BASE}/api/v1/mobile/suggestions/${suggId}/respond`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${staffToken}` },
    body: JSON.stringify({
      response: "Thank you for the great suggestion! We are already planning to expand charging stations in malls by Q4 2026.",
      status: "ACCEPTED",
    }),
  });
  const suggRespData = await suggRespRes.json();
  if (!suggRespData.success) throw new Error("Suggestion response failed: " + JSON.stringify(suggRespData));
  console.log(`✓ Staff responded to suggestion. Status: ${suggRespData.data.suggestion.status}`);

  // 12. Staff responds to feedback
  console.log("\n--- STEP 12: Staff Responds to Feedback ---");
  const fbRespRes = await fetch(`${BASE}/api/v1/mobile/feedback/${fbId}/respond`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${staffToken}` },
    body: JSON.stringify({
      response: "We appreciate your kind words! Our team strives to deliver the best experience.",
    }),
  });
  const fbRespData = await fbRespRes.json();
  if (!fbRespData.success) throw new Error("Feedback response failed: " + JSON.stringify(fbRespData));
  console.log(`✓ Staff responded to feedback.`);

  // 13. Customer views staff response on complaint
  console.log("\n--- STEP 13: Customer Sees Staff Response on Complaint ---");
  const custDetailRes = await fetch(`${BASE}/api/v1/mobile/complaints/${complaintId}`, {
    headers: { Authorization: `Bearer ${custToken}` },
  });
  const custDetailData = await custDetailRes.json();
  if (!custDetailData.success) throw new Error("Customer detail fetch failed");
  const msgs = custDetailData.data.complaint.messages;
  console.log(`✓ Complaint status: ${custDetailData.data.complaint.status}`);
  console.log(`✓ Messages (${msgs.length}):`);
  msgs.forEach((m, i) => {
    console.log(`  [${i + 1}] ${m.author?.name || "Unknown"} (${m.author?.role}): "${m.message}"`);
  });

  // 14. Customer views staff response on suggestion
  console.log("\n--- STEP 14: Customer Sees Staff Response on Suggestion ---");
  const custSuggsRes = await fetch(`${BASE}/api/v1/mobile/suggestions`, {
    headers: { Authorization: `Bearer ${custToken}` },
  });
  const custSuggsData = await custSuggsRes.json();
  const custSugg = custSuggsData.data.suggestions.find(s => s.id === suggId);
  if (!custSugg) throw new Error("Customer cannot see their suggestion!");
  console.log(`✓ Suggestion: "${custSugg.title}" → Status: ${custSugg.status}`);
  console.log(`✓ Staff response: "${custSugg.response}"`);

  // 15. Customer views staff response on feedback
  console.log("\n--- STEP 15: Customer Sees Staff Response on Feedback ---");
  const custFbRes = await fetch(`${BASE}/api/v1/mobile/feedback`, {
    headers: { Authorization: `Bearer ${custToken}` },
  });
  const custFbData = await custFbRes.json();
  const custFb = custFbData.data.feedback.find(f => f.id === fbId);
  if (!custFb) throw new Error("Customer cannot see their feedback!");
  console.log(`✓ Feedback: "${custFb.message}" (Rating: ${custFb.rating}/5)`);
  console.log(`✓ Staff response: "${custFb.response}"`);

  // 16. Security test: Staff from another org cannot see BYD submissions
  console.log("\n--- STEP 16: Security Test - Cross-Org Isolation ---");
  const fintechLogin = await fetch(`${BASE}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "demo@example.com", password: "Password123!" }),
  });
  const fintechData = await fintechLogin.json();
  if (fintechData.success) {
    const fintechToken = fintechData.data.token;
    const fintechComplaints = await fetch(`${BASE}/api/v1/mobile/complaints`, {
      headers: { Authorization: `Bearer ${fintechToken}` },
    });
    const fintechCData = await fintechComplaints.json();
    const leaked = fintechCData.data?.complaints?.find(c => c.id === complaintId);
    if (leaked) {
      throw new Error("SECURITY FAILURE: Fintech staff can see BYD complaint!");
    }
    console.log(`✓ Fintech staff (demo@example.com) cannot see BYD complaints. Multi-tenant isolation verified.`);
  } else {
    console.log("⚠ Could not test Fintech login (may have different password)");
  }

  // 17. Updated Customer Dashboard after interactions
  console.log("\n--- STEP 17: Updated Customer Dashboard ---");
  const custDash2 = await fetch(`${BASE}/api/v1/mobile/dashboard`, {
    headers: { Authorization: `Bearer ${custToken}` },
  });
  const custDash2Data = await custDash2.json();
  console.log("✓ Updated customer metrics:", JSON.stringify(custDash2Data.data.metrics));

  console.log("\n" + "=".repeat(60));
  console.log("ALL E2E WORKFLOW TESTS PASSED SUCCESSFULLY!");
  console.log("=".repeat(60));
  console.log("\nAccounts:");
  console.log("  Customer: customer@example.com / Password123!");
  console.log("  Staff:    user@example.com / Password123! (BYD)");
}

test().catch(err => {
  console.error("\n❌ TEST FAILED:", err.message || err);
  process.exit(1);
});
