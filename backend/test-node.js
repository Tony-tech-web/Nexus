console.log('Node execution is working');
try {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  console.log('Prisma client loaded');
} catch (e) {
  console.error('Prisma load failed:', e);
}
