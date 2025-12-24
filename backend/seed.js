const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
  console.log('Starting seed...');

  try {
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
    console.log('User synced:', admin.email);

    // 2. Clear existing data to avoid duplicates if re-running without unique constraints collisions
    // (Optional, but safe for 'dev' environment)
    // await prisma.order.deleteMany({});
    // await prisma.product.deleteMany({});

    // 3. Create Products
    const productsData = [
      { name: 'Elite Laptop Pro', sku: 'LTP-001', price: 1499.99, stockLevel: 45, lowStockThreshold: 10, description: 'High performance laptop' },
      { name: 'UltraWide Monitor 34"', sku: 'MON-001', price: 599.99, stockLevel: 5, lowStockThreshold: 10, description: 'Curved 4K display - LOW STOCK' }, // Low stock example
      { name: 'Mechanical Keyboard RGB', sku: 'KBD-001', price: 129.99, stockLevel: 85, lowStockThreshold: 20, description: 'Tactile typing experience' },
      { name: 'Wireless Pro Mouse', sku: 'MSE-001', price: 79.99, stockLevel: 3, lowStockThreshold: 5, description: 'Precision gaming mouse - LOW STOCK' }, // Low stock example
    ];

    const filledProducts = [];
    for (const p of productsData) {
      const prod = await prisma.product.upsert({
        where: { sku: p.sku },
        update: p,
        create: p,
      });
      filledProducts.push(prod);
    }
    console.log(`Seeded ${filledProducts.length} products`);

    // 4. Create Orders
    // We need real product IDs for the relations (though schema might not strictly enforce foreign keys in SQLite depending on setup, Prisma does)
    // Since we just created them, we can use 'filledProducts'
    
    // Check if we have orders, if not create some
    const countOrders = await prisma.order.count();
    if (countOrders === 0) {
      await prisma.order.create({
        data: {
          customerName: 'Alice Johnson',
          status: 'SHIPPED',
          totalPrice: 1579.98,
          createdAt: new Date(Date.now() - 86400000), // Yesterday
          // In a real relation we would connect items, but for now we just want the Order entity for the stats
        }
      });
      await prisma.order.create({
        data: {
          customerName: 'Bob Smith',
          status: 'PENDING',
          totalPrice: 599.99,
          createdAt: new Date(),
        }
      });
      console.log('Seeded initial orders');
    }

    // 5. Create Notifications
    await prisma.notification.createMany({
      data: [
        { userId: admin.id, title: 'System Ready', message: 'Nexus dashboard is now live.', type: 'info', isRead: false },
        { userId: admin.id, title: 'Check Inventory', message: 'Some items are below threshold.', type: 'warning', isRead: false },
      ]
    });
    console.log('Seeded notifications');

  } catch (e) {
    console.error('Seed error:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
