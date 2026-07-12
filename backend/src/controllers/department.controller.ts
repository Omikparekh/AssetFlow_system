import { Request, Response, NextFunction } from "express";
import { departmentService } from "../services/department.service";
import { sendSuccess } from "../utils/response";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { logActivity } from "../utils/activity";

export class DepartmentController {
  async getDepartment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dept = await departmentService.getDepartment(req.params.id);
      sendSuccess(res, "Department fetched successfully", dept);
    } catch (err) {
      next(err);
    }
  }

  async listDepartments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, parentId, search, page, limit } = req.query;
      
      const filters = {
        status: status ? String(status) : undefined,
        parentId: parentId === "null" ? null : parentId ? String(parentId) : undefined,
        search: search ? String(search) : undefined,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      };

      const result = await departmentService.listDepartments(filters);
      sendSuccess(res, "Departments list fetched successfully", result.departments, 200, {
        total: result.total,
        page: filters.page || 1,
        limit: filters.limit || 20,
      });
    } catch (err) {
      next(err);
    }
  }

  async createDepartment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorId = req.user!.id;
      const dept = await departmentService.createDepartment(req.body, actorId);

      await logActivity({
        userId: actorId,
        role: req.user!.roleName,
        module: "DEPARTMENT",
        action: "CREATE_DEPARTMENT",
        entityName: "departments",
        entityId: dept.id,
        afterJson: dept,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });

      sendSuccess(res, "Department created successfully", dept, 201);
    } catch (err) {
      next(err);
    }
  }

  async updateDepartment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorId = req.user!.id;
      const beforeState = await departmentService.getDepartment(req.params.id);
      const dept = await departmentService.updateDepartment(req.params.id, req.body, actorId);

      await logActivity({
        userId: actorId,
        role: req.user!.roleName,
        module: "DEPARTMENT",
        action: "UPDATE_DEPARTMENT",
        entityName: "departments",
        entityId: dept.id,
        beforeJson: beforeState,
        afterJson: dept,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });

      sendSuccess(res, "Department updated successfully", dept);
    } catch (err) {
      next(err);
    }
  }

  async deleteDepartment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorId = req.user!.id;
      const beforeState = await departmentService.getDepartment(req.params.id);
      await departmentService.deleteDepartment(req.params.id, actorId);

      await logActivity({
        userId: actorId,
        role: req.user!.roleName,
        module: "DEPARTMENT",
        action: "DELETE_DEPARTMENT",
        entityName: "departments",
        entityId: req.params.id,
        beforeJson: beforeState,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });

      sendSuccess(res, "Department deleted successfully", null);
    } catch (err) {
      next(err);
    }
  }
}

export const departmentController = new DepartmentController();
