import { Router } from "express";
import { allocationController } from "../controllers/allocation.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate as any);

router.get("/", allocationController.listAllocations as any);
router.post("/", allocationController.createAllocation as any);
router.post("/return", allocationController.returnAllocation as any);
router.post("/request-return", allocationController.requestReturn as any);
router.get("/requests", allocationController.listReturnRequests as any);
router.post("/requests/action", allocationController.actionReturnRequest as any);

export default router;
