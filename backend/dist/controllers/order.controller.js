"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const order_service_1 = require("../services/order.service");
class OrderController {
    static async create(req, res, next) {
        try {
            const order = await order_service_1.OrderService.createOrder(req.body);
            res.status(201).json(order);
        }
        catch (err) {
            next(err);
        }
    }
    static async getAll(req, res, next) {
        try {
            const orders = await order_service_1.OrderService.getAll();
            res.json(orders);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.OrderController = OrderController;
