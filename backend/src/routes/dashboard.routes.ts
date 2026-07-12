import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate as any);

router.get("/stats", dashboardController.getOverviewStats as any);

export default router;
