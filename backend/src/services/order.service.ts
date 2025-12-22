import { AppError } from '../middleware/errorHandler';
import prisma from '../utils/prisma';

export class OrderService {
  static async getAll() {
    return await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async createOrder(data: any) {
    // data should contain customerName and items[{productId, quantity}]
    const { customerName, items } = data;

    return await prisma.$transaction(async (tx: any) => {
      let totalPrice = 0;
      const orderItemsData = [];

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        });

        if (!product) throw new AppError(`Product ${item.productId} not found`, 404);
        if (product.stockLevel < item.quantity) {
          throw new AppError(`Insufficient stock for ${product.name}`, 400);
        }

        // Deduct stock
        await tx.product.update({
          where: { id: product.id },
          data: { stockLevel: product.stockLevel - item.quantity }
        });

        totalPrice += (product.price as any) * item.quantity;
        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice: product.price
        });
      }

      return await tx.order.create({
        data: {
          customerName,
          totalPrice,
          items: {
            create: orderItemsData
          }
        },
        include: { items: true }
      });
    });
  }
}
