const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany();
  console.log('USERS:', users);
  const emps = await prisma.employee.findMany();
  console.log('EMPS:', emps);
}
main().finally(() => prisma.$disconnect());
