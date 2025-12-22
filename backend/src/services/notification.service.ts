import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';

export class NotificationService {
  static async getAllForUser(userId: string) {
    try {
      return await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (e) {
      // Fallback for now if DB isn't fully ready
      return [];
    }
  }

  static async markAsRead(id: string) {
    try {
      return await prisma.notification.update({
        where: { id },
        data: { isRead: true },
      });
    } catch (e) {
      return null;
    }
  }

  static async create(userId: string, title: string, message: string, type: string = 'info') {
    try {
      return await prisma.notification.create({
        data: { userId, title, message, type },
      });
    } catch (e) {
      return null;
    }
  }
}
