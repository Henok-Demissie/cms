const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  // List all users
  const users = await p.user.findMany({
    select: { id: true, name: true, email: true, role: true, tenantId: true }
  });
  console.log("=== ALL USERS ===");
  console.log(JSON.stringify(users, null, 2));

  // List all tenants
  const tenants = await p.tenant.findMany({
    select: { id: true, name: true, subdomain: true, sector: true }
  });
  console.log("\n=== ALL TENANTS ===");
  console.log(JSON.stringify(tenants, null, 2));

  // Count complaints per tenant
  const complaints = await p.complaint.groupBy({
    by: ['tenantId', 'status'],
    _count: true,
  });
  console.log("\n=== COMPLAINTS BY TENANT & STATUS ===");
  console.log(JSON.stringify(complaints, null, 2));

  // Count suggestions
  const suggestions = await p.suggestion.findMany({
    select: { id: true, title: true, tenantId: true, authorEmail: true, status: true, response: true }
  });
  console.log("\n=== ALL SUGGESTIONS ===");
  console.log(JSON.stringify(suggestions, null, 2));

  // Count feedback
  const feedback = await p.feedback.findMany({
    select: { id: true, message: true, tenantId: true, authorEmail: true, rating: true, status: true, response: true }
  });
  console.log("\n=== ALL FEEDBACK ===");
  console.log(JSON.stringify(feedback, null, 2));
}

main().catch(console.error).finally(() => p.$disconnect());
