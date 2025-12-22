import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export class OrderService {
  static async createOrder(data: any) {
    return prisma.$transaction(async (tx: any) => {
      // 1. Create Order
      const order = await tx.order.create({
        data: {
          customerName: data.customerName,
          totalPrice: data.totalPrice,
          items: {
            create: data.items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
        },
        include: { items: true },
      });

      // 2. Deduct inventory
      for (const item of data.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product || product.stockLevel < item.quantity) {
          throw new AppError(`Insufficient stock for product ${item.productId}`, 400);
        }
        await tx.product.update({
          where: { id: item.productId },
          data: { stockLevel: { decrement: item.quantity } },
        });
      }

      return order;
    });
  }

  static async getAll() {
    return prisma.order.findMany({ include: { items: true } });
  }
}

