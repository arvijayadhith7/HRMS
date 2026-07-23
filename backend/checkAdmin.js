const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@virtualnest.com' }
  });
  console.log('Admin user:', admin);
}

check().finally(() => process.exit(0));
