const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const emps = await prisma.employee.findMany();
  console.log('Employees:', emps.map(e => e.email));
}

check().finally(() => process.exit(0));
