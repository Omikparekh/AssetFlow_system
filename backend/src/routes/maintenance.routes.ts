import { Router } from "express";
import { maintenanceController } from "../controllers/maintenance.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate as any);

router.get("/", maintenanceController.listRequests as any);
router.post("/", maintenanceController.createRequest as any);
router.put("/:id/status", maintenanceController.updateStatus as any);

export default router;
