import type { Request, Response, NextFunction } from 'express';
import { StatsService } from '../services/stats.service';

export class StatsController {
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await StatsService.getPublicStats();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  }
}
