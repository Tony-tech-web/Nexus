"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryController = void 0;
const inventory_service_1 = require("../services/inventory.service");
class InventoryController {
    static async getAll(req, res, next) {
        try {
            const products = await inventory_service_1.InventoryService.getAll();
            res.json(products);
        }
        catch (err) {
            next(err);
        }
    }
    static async create(req, res, next) {
        try {
            const product = await inventory_service_1.InventoryService.create(req.body);
            res.status(201).json(product);
        }
        catch (err) {
            next(err);
        }
    }
    static async update(req, res, next) {
        try {
            const product = await inventory_service_1.InventoryService.update(req.params.id, req.body);
            res.json(product);
        }
        catch (err) {
            next(err);
        }
    }
    static async delete(req, res, next) {
        try {
            await inventory_service_1.InventoryService.delete(req.params.id);
            res.status(204).send();
        }
        catch (err) {
            next(err);
        }
    }
}
exports.InventoryController = InventoryController;
