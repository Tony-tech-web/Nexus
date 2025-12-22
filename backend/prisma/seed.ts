import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@nexus.io' },
    update: {},
    create: {
      email: 'admin@nexus.io',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // Create some products
  const products = [
    { name: 'Elite Laptop Pro', sku: 'LTP-001', price: 1499.99, stockLevel: 45, lowStockThreshold: 10 },
    { name: 'UltraWide Monitor 34"', sku: 'MON-001', price: 599.99, stockLevel: 12, lowStockThreshold: 5 },
    { name: 'Mechanical Keyboard RGB', sku: 'KBD-001', price: 129.99, stockLevel: 85, lowStockThreshold: 20 },
    { name: 'Wireless Pro Mouse', sku: 'MSE-001', price: 79.99, stockLevel: 3, lowStockThreshold: 10 },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: p,
      create: p,
    });
  }

  console.log('✅ Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

