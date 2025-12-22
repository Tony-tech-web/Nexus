import type { Request, Response, NextFunction } from 'express';
import { InventoryService } from '../services/inventory.service';

export class InventoryController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await InventoryService.getAll();
      res.json(products);
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await InventoryService.create(req.body);
      res.status(201).json(product);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await InventoryService.update(req.params.id!, req.body);
      res.json(product);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await InventoryService.delete(req.params.id!);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

