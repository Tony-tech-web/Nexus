"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const prisma_1 = __importDefault(require("../utils/prisma"));
class OrderService {
    static async getAll() {
        return await prisma_1.default.order.findMany({
            include: { items: true },
            orderBy: { createdAt: 'desc' }
        });
    }
    static async createOrder(data) {
        // data should contain customerName and items[{productId, quantity}]
        const { customerName, items } = data;
        return await prisma_1.default.$transaction(async (tx) => {
            let totalPrice = 0;
            const orderItemsData = [];
            for (const item of items) {
                const product = await tx.product.findUnique({
                    where: { id: item.productId }
                });
                if (!product)
                    throw new errorHandler_1.AppError(`Product ${item.productId} not found`, 404);
                if (product.stockLevel < item.quantity) {
                    throw new errorHandler_1.AppError(`Insufficient stock for ${product.name}`, 400);
                }
                // Deduct stock
                await tx.product.update({
                    where: { id: product.id },
                    data: { stockLevel: product.stockLevel - item.quantity }
                });
                totalPrice += product.price * item.quantity;
                orderItemsData.push({
                    productId: product.id,
                    quantity: item.quantity,
                    unitPrice: product.price
                });
            }
            return await tx.order.create({
                data: {
                    customerName,
                    totalPrice,
                    items: {
                        create: orderItemsData
                    }
                },
                include: { items: true }
            });
        });
    }
}
exports.OrderService = OrderService;
