"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const prisma_1 = __importDefault(require("../utils/prisma"));
class InventoryService {
    static async getAll() {
        return await prisma_1.default.product.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }
    static async getById(id) {
        const product = await prisma_1.default.product.findUnique({
            where: { id }
        });
        if (!product)
            throw new errorHandler_1.AppError('Product not found', 404);
        return product;
    }
    static async create(data) {
        return await prisma_1.default.product.create({
            data: {
                name: data.name,
                sku: data.sku,
                description: data.description,
                price: parseFloat(data.price),
                stockLevel: parseInt(data.stockLevel),
                lowStockThreshold: parseInt(data.lowStockThreshold || 10)
            }
        });
    }
    static async update(id, data) {
        const updateData = { ...data };
        if (data.price)
            updateData.price = parseFloat(data.price);
        if (data.stockLevel)
            updateData.stockLevel = parseInt(data.stockLevel);
        return await prisma_1.default.product.update({
            where: { id },
            data: updateData
        });
    }
    static async delete(id) {
        return await prisma_1.default.product.delete({
            where: { id }
        });
    }
}
exports.InventoryService = InventoryService;
