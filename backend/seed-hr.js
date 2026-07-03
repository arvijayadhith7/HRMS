const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('HR@vn', 10);
  
  const hrUser = await prisma.user.upsert({
    where: { email: 'HR@vn.com' },
    update: {
      passwordHash,
      role: 'hr'
    },
    create: {
      username: 'HR_Admin',
      email: 'HR@vn.com',
      passwordHash,
      role: 'hr'
    }
  });

  console.log('HR user seeded successfully:', hrUser.email);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
