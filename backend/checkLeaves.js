const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const leaves = await prisma.leave.findMany();
  console.log('Leaves:', leaves);
}

check().finally(() => process.exit(0));
