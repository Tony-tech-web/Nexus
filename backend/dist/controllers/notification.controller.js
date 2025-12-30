"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notification_service_1 = require("../services/notification.service");
class NotificationController {
    static async getAll(req, res, next) {
        try {
            // @ts-ignore
            const userId = req.user.id;
            const notifications = await notification_service_1.NotificationService.getAllForUser(userId);
            res.json(notifications);
        }
        catch (err) {
            next(err);
        }
    }
    static async markRead(req, res, next) {
        try {
            const { id } = req.params;
            const result = await notification_service_1.NotificationService.markAsRead(id);
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.NotificationController = NotificationController;
