import { Router } from "express";
import { notificationController } from "../controllers/notification.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate as any);
router.get("/", notificationController.list as any);
router.patch("/:id/read", notificationController.markRead as any);

export default router;
