import { Router } from "express";
import { bookingController } from "../controllers/booking.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();
router.use(authenticate as any);
router.get("/availability", bookingController.availability as any);
router.get("/", bookingController.list as any);
router.post("/", bookingController.create as any);

export default router;
