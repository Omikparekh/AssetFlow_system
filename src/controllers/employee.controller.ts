import { Request, Response, NextFunction } from "express";
import { employeeService } from "../services/employee.service";
import { sendSuccess } from "../utils/response";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { logActivity } from "../utils/activity";

export class EmployeeController {
  async getEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const emp = await employeeService.getEmployee(req.params.id);
      sendSuccess(res, "Employee profile fetched successfully", emp);
    } catch (err) {
      next(err);
    }
  }

  async listEmployees(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, roleId, departmentId, search, page, limit } = req.query;

      const filters = {
        status: status ? String(status) : undefined,
        roleId: roleId ? String(roleId) : undefined,
        departmentId: departmentId === "null" ? null : departmentId ? String(departmentId) : undefined,
        search: search ? String(search) : undefined,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      };

      const result = await employeeService.listEmployees(filters);
      sendSuccess(res, "Employees list fetched successfully", result.employees, 200, {
        total: result.total,
        page: filters.page || 1,
        limit: filters.limit || 20,
      });
    } catch (err) {
      next(err);
    }
  }

  async createEmployee(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorId = req.user!.id;
      const emp = await employeeService.createEmployee(req.body, actorId);

      await logActivity({
        userId: actorId,
        role: req.user!.roleName,
        module: "EMPLOYEE",
        action: "PROVISION_EMPLOYEE",
        entityName: "users",
        entityId: emp.id,
        afterJson: emp,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });

      sendSuccess(res, "Employee profile created successfully", emp, 201);
    } catch (err) {
      next(err);
    }
  }

  async updateEmployee(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorId = req.user!.id;
      const beforeState = await employeeService.getEmployee(req.params.id);
      const emp = await employeeService.updateEmployee(req.params.id, req.body, actorId);

      await logActivity({
        userId: actorId,
        role: req.user!.roleName,
        module: "EMPLOYEE",
        action: "UPDATE_EMPLOYEE",
        entityName: "users",
        entityId: emp.id,
        beforeJson: beforeState,
        afterJson: emp,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });

      sendSuccess(res, "Employee profile updated successfully", emp);
    } catch (err) {
      next(err);
    }
  }

  async deleteEmployee(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorId = req.user!.id;
      const beforeState = await employeeService.getEmployee(req.params.id);
      await employeeService.deleteEmployee(req.params.id, actorId);

      await logActivity({
        userId: actorId,
        role: req.user!.roleName,
        module: "EMPLOYEE",
        action: "DELETE_EMPLOYEE",
        entityName: "users",
        entityId: req.params.id,
        beforeJson: beforeState,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });

      sendSuccess(res, "Employee deleted successfully", null);
    } catch (err) {
      next(err);
    }
  }
}

export const employeeController = new EmployeeController();
