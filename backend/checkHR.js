const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const hr = await prisma.user.findUnique({
    where: { email: 'HR@vn.com' }
  });
  console.log('HR user:', hr);
}

check().finally(() => process.exit(0));
