const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  await prisma.attendance.deleteMany({});
  console.log('Deleted all attendance logs');
  await prisma.leave.deleteMany({});
  console.log('Deleted all leave logs');
}

run().catch(console.error).finally(() => prisma.$disconnect());
