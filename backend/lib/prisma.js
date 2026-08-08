const { PrismaClient } = require('@prisma/client');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres.kysojwkojxwtdzeaejpl:Skandha2026_@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres';

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    datasources: { db: { url: DATABASE_URL } }
  });
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      datasources: { db: { url: DATABASE_URL } }
    });
  }
  prisma = global.__prisma;
}

module.exports = prisma;
