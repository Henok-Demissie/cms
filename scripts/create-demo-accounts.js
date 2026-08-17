import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const tenants = await prisma.tenant.findMany();
  console.log("Tenants:", tenants.map(t => ({ id: t.id, name: t.name, subdomain: t.subdomain })));

  let tenant = tenants[0];
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: "Demo Organization",
        sector: "Finance & Banking",
        subdomain: "demo-org",
        plan: "STARTER",
      }
    });
    console.log("Created demo tenant:", tenant);
  }

  const passwordHash = await bcrypt.hash("Password123!", 10);

  // Check or create demo customer
  const demoEmail = "customer@example.com";
  let customer = await prisma.user.findUnique({ where: { email: demoEmail } });
  if (!customer) {
    customer = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        name: "Demo Customer",
        firstName: "Demo",
        lastName: "Customer",
        email: demoEmail,
        phone: "+251911223344",
        gender: "MALE",
        language: "EN",
        role: "CUSTOMER",
        passwordHash,
      }
    });
    console.log("Created demo customer:", customer.email);
  } else {
    await prisma.user.update({
      where: { id: customer.id },
      data: { passwordHash, role: "CUSTOMER" }
    });
    console.log("Updated demo customer password:", customer.email);
  }

  // Check or create demo staff
  const staffEmail = "staff@example.com";
  let staff = await prisma.user.findUnique({ where: { email: staffEmail } });
  if (!staff) {
    staff = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        name: "Demo Agent",
        firstName: "Demo",
        lastName: "Agent",
        email: staffEmail,
        phone: "+251911889900",
        role: "AGENT",
        passwordHash,
      }
    });
    console.log("Created demo staff:", staff.email);
  } else {
    await prisma.user.update({
      where: { id: staff.id },
      data: { passwordHash, role: "AGENT" }
    });
    console.log("Updated demo staff password:", staff.email);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
