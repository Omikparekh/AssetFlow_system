import { NextFunction, Response } from "express";
import prisma from "../config/database";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { sendSuccess } from "../utils/response";

export class NotificationController {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const notifications = await prisma.notification.findMany({
        where: { recipientId: req.user!.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      sendSuccess(res, "Notifications fetched successfully", notifications);
    } catch (err) {
      next(err);
    }
  }

  async markRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const notification = await prisma.notification.updateMany({
        where: { id: req.params.id, recipientId: req.user!.id },
        data: { isRead: true },
      });

      if (notification.count === 0) {
        res.status(404).json({ success: false, message: "Notification not found" });
        return;
      }

      sendSuccess(res, "Notification marked as read", null);
    } catch (err) {
      next(err);
    }
  }
}

export const notificationController = new NotificationController();
