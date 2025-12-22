import type { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';

export class NotificationController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-ignore
      const userId = req.user.id;
      const notifications = await NotificationService.getAllForUser(userId);
      res.json(notifications);
    } catch (err) {
      next(err);
    }
  }

  static async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await NotificationService.markAsRead(id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}
