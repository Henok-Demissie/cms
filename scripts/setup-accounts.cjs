const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const p = new PrismaClient();

async function main() {
  // Check customer@example.com
  const existing = await p.user.findUnique({ where: { email: 'customer@example.com' } });
  console.log("=== customer@example.com ===");
  console.log(JSON.stringify(existing, null, 2));

  // Check user@example.com (staff)
  const staff = await p.user.findUnique({ where: { email: 'user@example.com' } });
  console.log("\n=== user@example.com (STAFF) ===");
  console.log(JSON.stringify(staff, null, 2));

  // The customer@example.com exists but is assigned to BYD tenant (cmsipetwh0001tvs5bq8lr880).
  // It needs to be on the "public" tenant and with a known password.
  // Let's update/create it properly with tenantId = "public" tenant
  const publicTenantId = "cmsth4mr60000tu46werkqv0l";
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const customer = await p.user.upsert({
    where: { email: 'customer@example.com' },
    update: {
      name: 'Demo Customer',
      role: 'CUSTOMER',
      tenantId: publicTenantId,
      passwordHash: passwordHash,
    },
    create: {
      name: 'Demo Customer',
      email: 'customer@example.com',
      role: 'CUSTOMER',
      tenantId: publicTenantId,
      passwordHash: passwordHash,
    },
  });
  console.log("\n=== Updated customer@example.com ===");
  console.log(JSON.stringify(customer, null, 2));

  console.log("\n=== READY ===");
  console.log("Staff:    user@example.com / Password123! (role: AGENT, org: BYD)");
  console.log("Customer: customer@example.com / Password123! (role: CUSTOMER, org: Public)");
}

main().catch(console.error).finally(() => p.$disconnect());
