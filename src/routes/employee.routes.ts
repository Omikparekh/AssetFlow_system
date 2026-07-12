import { Router } from "express";
import { employeeController } from "../controllers/employee.controller";
import { authenticate, requirePermission } from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validate.middleware";
import { createEmployeeSchema, updateEmployeeSchema } from "../validators/employee.validator";

const router = Router();

router.get(
  "/",
  authenticate as any,
  requirePermission("ViewEmployees") as any,
  employeeController.listEmployees as any
);

router.get(
  "/:id",
  authenticate as any,
  requirePermission("ViewEmployees") as any,
  employeeController.getEmployee as any
);

router.post(
  "/",
  authenticate as any,
  requirePermission("ManageEmployees") as any,
  validateRequest({ body: createEmployeeSchema }),
  employeeController.createEmployee as any
);

router.put(
  "/:id",
  authenticate as any,
  requirePermission("ManageEmployees") as any,
  validateRequest({ body: updateEmployeeSchema }),
  employeeController.updateEmployee as any
);

router.delete(
  "/:id",
  authenticate as any,
  requirePermission("ManageEmployees") as any,
  employeeController.deleteEmployee as any
);

export default router;
