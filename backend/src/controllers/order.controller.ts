import type { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';

export class OrderController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await OrderService.createOrder(req.body);
      res.status(201).json(order);
    } catch (err) {
      next(err);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await OrderService.getAll();
      res.json(orders);
    } catch (err) {
      next(err);
    }
  }
}

