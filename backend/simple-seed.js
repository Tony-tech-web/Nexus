const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
  console.log('Seeding data via plain JS...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@nexus.com' },
    update: {},
    create: {
      email: 'admin@nexus.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  console.log('Admin seeded:', admin.email);

  const products = [
    { name: 'Elite Laptop Pro', sku: 'LTP-001', price: 1499.99, stockLevel: 45, lowStockThreshold: 10, description: 'High performance laptop' },
    { name: 'UltraWide Monitor 34"', sku: 'MON-001', price: 599.99, stockLevel: 12, lowStockThreshold: 5, description: 'Curved 4K display' },
  ];

  for (const prod of products) {
    await prisma.product.upsert({
      where: { sku: prod.sku },
      update: { ...prod },
      create: { ...prod },
    });
  }
  console.log('Products seeded');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
