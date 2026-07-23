const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const emp = await prisma.employee.findUnique({
    where: { email: 'Kishore@vn.com' }
  });
  console.log('Employee:', emp);
}

check().finally(() => process.exit(0));
