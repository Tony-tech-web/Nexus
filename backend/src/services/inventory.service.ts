import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export class InventoryService {
  static async getAll() {
    return prisma.product.findMany();
  }

  static async getById(id: string) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new AppError('Product not found', 404);
    return product;
  }

  static async create(data: any) {
    return prisma.product.create({ data });
  }

  static async update(id: string, data: any) {
    return prisma.product.update({ where: { id }, data });
  }

  static async delete(id: string) {
    return prisma.product.delete({ where: { id } });
  }
}

