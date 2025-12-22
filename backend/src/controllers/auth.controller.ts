import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AppError } from '../middleware/errorHandler';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.register(req.body);
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-ignore - user is added by auth middleware
      const userId = req.user?.id;
      if (!userId) throw new AppError('Unauthorized', 401);
      const user = await AuthService.getMe(userId);
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    // For JWT, client simply discards the token. 
    // We can return a success message.
    res.json({ message: 'Logged out successfully' });
  }
}

