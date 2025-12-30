"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
class NotificationService {
    static async getAllForUser(userId) {
        try {
            return await prisma_1.default.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
            });
        }
        catch (e) {
            // Fallback for now if DB isn't fully ready
            return [];
        }
    }
    static async markAsRead(id) {
        try {
            return await prisma_1.default.notification.update({
                where: { id },
                data: { isRead: true },
            });
        }
        catch (e) {
            return null;
        }
    }
    static async create(userId, title, message, type = 'info') {
        try {
            return await prisma_1.default.notification.create({
                data: { userId, title, message, type },
            });
        }
        catch (e) {
            return null;
        }
    }
}
exports.NotificationService = NotificationService;
