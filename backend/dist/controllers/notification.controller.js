"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationController = exports.NotificationController = void 0;
const database_1 = __importDefault(require("../config/database"));
const response_1 = require("../utils/response");
class NotificationController {
    async list(req, res, next) {
        try {
            const notifications = await database_1.default.notification.findMany({
                where: { recipientId: req.user.id },
                orderBy: { createdAt: "desc" },
                take: 20,
            });
            (0, response_1.sendSuccess)(res, "Notifications fetched successfully", notifications);
        }
        catch (err) {
            next(err);
        }
    }
    async markRead(req, res, next) {
        try {
            const notification = await database_1.default.notification.updateMany({
                where: { id: req.params.id, recipientId: req.user.id },
                data: { isRead: true },
            });
            if (notification.count === 0) {
                res.status(404).json({ success: false, message: "Notification not found" });
                return;
            }
            (0, response_1.sendSuccess)(res, "Notification marked as read", null);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.NotificationController = NotificationController;
exports.notificationController = new NotificationController();
