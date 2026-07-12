import { Router } from "express";
import { organizationController } from "../controllers/organization.controller";
import { authenticate, requirePermission } from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validate.middleware";
import { updateOrganizationSchema } from "../validators/organization.validator";

const router = Router();

router.get(
  "/",
  authenticate as any,
  organizationController.getOrganization as any
);

router.put(
  "/",
  authenticate as any,
  requirePermission("ManageOrganization") as any,
  validateRequest({ body: updateOrganizationSchema }),
  organizationController.updateOrganization as any
);

export default router;
