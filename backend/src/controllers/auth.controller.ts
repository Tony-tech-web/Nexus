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
    try {
      const { refreshToken } = req.body;
      await AuthService.logout(refreshToken);
      res.json({ message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  }

  static async googleLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { idToken } = req.body;
      if (!idToken) throw new AppError('Google ID token is required', 400);
      const result = await AuthService.googleLogin(idToken);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async googleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.query;
      console.log('Google OAuth callback reached with code:', code);
      res.send("Google OAuth callback reached");
    } catch (err) {
      next(err);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await AuthService.forgotPassword(email);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.resetPassword(req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-ignore
      const userId = req.user?.id;
      const user = await AuthService.updateMe(userId, req.body);
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  static async updatePassword(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-ignore
      const userId = req.user?.id;
      const result = await AuthService.updatePassword(userId, req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await AuthService.getAllUsers();
      res.json(users);
    } catch (err) {
      next(err);
    }
  }
}

