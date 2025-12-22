import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Seeding data...');

  // 1. Create User
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
  console.log('Created admin user:', admin.email);

  // 2. Create Products
  const products = [
    { name: 'Elite Laptop Pro', sku: 'LTP-001', price: 1499.99, stockLevel: 45, lowStockThreshold: 10, description: 'High performance laptop' },
    { name: 'UltraWide Monitor 34"', sku: 'MON-001', price: 599.99, stockLevel: 12, lowStockThreshold: 5, description: 'Curved 4K display' },
    { name: 'Mechanical Keyboard RGB', sku: 'KBD-001', price: 129.99, stockLevel: 85, lowStockThreshold: 20, description: 'Tactile typing experience' },
    { name: 'Wireless Pro Mouse', sku: 'MSE-001', price: 79.99, stockLevel: 3, lowStockThreshold: 10, description: 'Precision gaming mouse' },
  ];

  for (const prod of products) {
    await prisma.product.upsert({
      where: { sku: prod.sku },
      update: prod,
      create: prod,
    });
  }
  console.log('Created initial products');

  // 3. Create Notifications
  await prisma.notification.createMany({
    data: [
      { userId: admin.id, title: 'Welcome to Nexus', message: 'Your enterprise dashboard is ready.', type: 'info' },
      { userId: admin.id, title: 'Low Stock Alert', message: 'Wireless Pro Mouse is below threshold.', type: 'warning' },
    ]
  });
  console.log('Created initial notifications');

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
