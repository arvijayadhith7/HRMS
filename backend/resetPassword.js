const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetPasswords() {
  const passwordHash = await bcrypt.hash('password123', 12);
  
  await prisma.user.updateMany({
    data: {
      passwordHash: passwordHash
    }
  });

  console.log('All passwords have been reset to: password123');
  process.exit(0);
}

resetPasswords().catch(e => {
  console.error(e);
  process.exit(1);
});
