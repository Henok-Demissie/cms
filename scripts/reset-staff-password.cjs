const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const p = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 10);
  
  // Update user@example.com password
  const staff = await p.user.update({
    where: { email: 'user@example.com' },
    data: { passwordHash },
  });
  console.log(`✓ Updated password for ${staff.email} (${staff.name}, role: ${staff.role})`);
  
  // Verify the password works
  const user = await p.user.findUnique({ where: { email: 'user@example.com' } });
  const match = await bcrypt.compare("Password123!", user.passwordHash);
  console.log(`✓ Password verification: ${match ? 'PASS' : 'FAIL'}`);
  
  // Also check what minimum password length the auth system expects
  console.log(`\nPassword "Password123!" length: ${("Password123!").length} chars`);
}

main().catch(console.error).finally(() => p.$disconnect());
