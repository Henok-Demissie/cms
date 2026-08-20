const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log("==================================================");
  console.log("RESETTING DATABASE TO DEDICATED CUSTOMER & STAFF TABLES");
  console.log("==================================================");

  const passwordHash = await bcrypt.hash("Password123!", 10);

  // 1. Ensure BYD Tenant exists
  const bydTenant = await prisma.tenant.findUnique({ where: { subdomain: "byd" } });
  if (!bydTenant) throw new Error("BYD tenant not found!");
  console.log(`✓ BYD Tenant found: ${bydTenant.id}`);

  // 2. Ensure only ONE staff user: user@example.com
  // Delete all users except user@example.com
  const deletedUsers = await prisma.user.deleteMany({
    where: { email: { not: "user@example.com" } }
  });
  console.log(`✓ Deleted ${deletedUsers.count} other users from User (Staff) table.`);

  // Upsert user@example.com
  const staff = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {
      tenantId: bydTenant.id,
      name: "Henok Demissie",
      firstName: "Henok",
      lastName: "Demissie",
      role: "AGENT",
      passwordHash,
    },
    create: {
      tenantId: bydTenant.id,
      name: "Henok Demissie",
      firstName: "Henok",
      lastName: "Demissie",
      email: "user@example.com",
      role: "AGENT",
      passwordHash,
    },
  });
  console.log(`✓ Staff account ready in User table: ${staff.email} (${staff.name}, role: ${staff.role}, tenant: BYD)`);

  // 3. Clear all old customers and create ONE customer in Customer table: customer@example.com
  await prisma.customer.deleteMany({});

  const customer = await prisma.customer.create({
    data: {
      email: "customer@example.com",
      name: "Demo Customer",
      firstName: "Demo",
      lastName: "Customer",
      phone: "+251911223344",
      gender: "MALE",
      language: "EN",
      role: "CUSTOMER",
      passwordHash,
    },
  });
  console.log(`✓ Customer account ready in Customer table: ${customer.email} (${customer.name}, ID: ${customer.id})`);

  // 4. Update existing complaints to attach to customerId
  const complaints = await prisma.complaint.findMany({ where: { tenantId: bydTenant.id } });
  for (const c of complaints) {
    await prisma.complaint.update({
      where: { id: c.id },
      data: {
        customerId: customer.id,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
      }
    });
  }
  console.log(`✓ Re-linked ${complaints.length} complaints to customer ${customer.email}`);

  // 5. Update existing suggestions and feedback
  await prisma.suggestion.updateMany({
    where: { tenantId: bydTenant.id },
    data: {
      customerId: customer.id,
      authorName: customer.name,
      authorEmail: customer.email,
    }
  });

  await prisma.feedback.updateMany({
    where: { tenantId: bydTenant.id },
    data: {
      customerId: customer.id,
      authorName: customer.name,
      authorEmail: customer.email,
    }
  });

  // 6. Create sample welcome notification for Customer
  await prisma.notification.deleteMany({});
  const welcomeNotif = await prisma.notification.create({
    data: {
      customerId: customer.id,
      type: "SYSTEM",
      title: "Welcome to AbetBay",
      message: "Your customer account is active. You can submit complaints, suggestions, and feedback to any registered organization.",
      read: false,
    }
  });
  console.log(`✓ Initial notification created for customer (ID: ${welcomeNotif.id})`);

  console.log("==================================================");
  console.log("DATABASE SETUP COMPLETE!");
  console.log("Staff table (User):      user@example.com / Password123! (BYD)");
  console.log("Customer table (Customer): customer@example.com / Password123!");
  console.log("==================================================");
}

main().catch(console.error).finally(() => prisma.$disconnect());
