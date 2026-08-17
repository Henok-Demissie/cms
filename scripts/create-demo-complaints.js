import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const customer = await prisma.user.findUnique({ where: { email: "customer@example.com" } });
  if (!customer) return;

  const count = await prisma.complaint.count({ where: { customerEmail: customer.email } });
  if (count === 0) {
    await prisma.complaint.createMany({
      data: [
        {
          tenantId: customer.tenantId,
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone,
          source: "WEB",
          title: "Billing overcharge on monthly statement",
          description: "I noticed an unexpected $45 fee on my recent subscription invoice.",
          status: "NEW",
          priority: "HIGH",
        },
        {
          tenantId: customer.tenantId,
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone,
          source: "WEB",
          title: "Delayed delivery of product",
          description: "Package was scheduled for delivery 3 days ago but tracking shows no updates.",
          status: "IN_REVIEW",
          priority: "MEDIUM",
        },
        {
          tenantId: customer.tenantId,
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone,
          source: "WEB",
          title: "Account access issue resolved",
          description: "Could not reset password via SMS code. Agent assisted with reset.",
          status: "RESOLVED",
          priority: "LOW",
        },
      ]
    });
    console.log("Created 3 demo complaints for customer@example.com");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
