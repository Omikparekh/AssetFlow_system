import { Router } from "express";
import { departmentController } from "../controllers/department.controller";
import { authenticate, requirePermission } from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validate.middleware";
import { createDepartmentSchema, updateDepartmentSchema } from "../validators/department.validator";

const router = Router();

router.get(
  "/",
  authenticate as any,
  requirePermission("ViewDepartments") as any,
  departmentController.listDepartments as any
);

router.get(
  "/:id",
  authenticate as any,
  requirePermission("ViewDepartments") as any,
  departmentController.getDepartment as any
);

router.post(
  "/",
  authenticate as any,
  requirePermission("ManageDepartments") as any,
  validateRequest({ body: createDepartmentSchema }),
  departmentController.createDepartment as any
);

router.put(
  "/:id",
  authenticate as any,
  requirePermission("ManageDepartments") as any,
  validateRequest({ body: updateDepartmentSchema }),
  departmentController.updateDepartment as any
);

router.delete(
  "/:id",
  authenticate as any,
  requirePermission("ManageDepartments") as any,
  departmentController.deleteDepartment as any
);

export default router;
