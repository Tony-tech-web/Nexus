import { AppError } from '../middleware/errorHandler';
import prisma from '../utils/prisma';

export class InventoryService {
  static async getAll() {
    return await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id }
    });
    if (!product) throw new AppError('Product not found', 404);
    return product;
  }

  static async create(data: any) {
    return await prisma.product.create({
      data: {
        name: data.name,
        sku: data.sku,
        description: data.description,
        price: parseFloat(data.price),
        stockLevel: parseInt(data.stockLevel),
        lowStockThreshold: parseInt(data.lowStockThreshold || 10)
      }
    });
  }

  static async update(id: string, data: any) {
    const updateData: any = { ...data };
    if (data.price) updateData.price = parseFloat(data.price);
    if (data.stockLevel) updateData.stockLevel = parseInt(data.stockLevel);

    return await prisma.product.update({
      where: { id },
      data: updateData
    });
  }

  static async delete(id: string) {
    return await prisma.product.delete({
      where: { id }
    });
  }
}
