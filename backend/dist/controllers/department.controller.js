"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.departmentController = exports.DepartmentController = void 0;
const department_service_1 = require("../services/department.service");
const response_1 = require("../utils/response");
const activity_1 = require("../utils/activity");
class DepartmentController {
    async getDepartment(req, res, next) {
        try {
            const dept = await department_service_1.departmentService.getDepartment(req.params.id);
            (0, response_1.sendSuccess)(res, "Department fetched successfully", dept);
        }
        catch (err) {
            next(err);
        }
    }
    async listDepartments(req, res, next) {
        try {
            const { status, parentId, search, page, limit } = req.query;
            const filters = {
                status: status ? String(status) : undefined,
                parentId: parentId === "null" ? null : parentId ? String(parentId) : undefined,
                search: search ? String(search) : undefined,
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
            };
            const result = await department_service_1.departmentService.listDepartments(filters);
            (0, response_1.sendSuccess)(res, "Departments list fetched successfully", result.departments, 200, {
                total: result.total,
                page: filters.page || 1,
                limit: filters.limit || 20,
            });
        }
        catch (err) {
            next(err);
        }
    }
    async createDepartment(req, res, next) {
        try {
            const actorId = req.user.id;
            const dept = await department_service_1.departmentService.createDepartment(req.body, actorId);
            await (0, activity_1.logActivity)({
                userId: actorId,
                role: req.user.roleName,
                module: "DEPARTMENT",
                action: "CREATE_DEPARTMENT",
                entityName: "departments",
                entityId: dept.id,
                afterJson: dept,
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
            });
            (0, response_1.sendSuccess)(res, "Department created successfully", dept, 201);
        }
        catch (err) {
            next(err);
        }
    }
    async updateDepartment(req, res, next) {
        try {
            const actorId = req.user.id;
            const beforeState = await department_service_1.departmentService.getDepartment(req.params.id);
            const dept = await department_service_1.departmentService.updateDepartment(req.params.id, req.body, actorId);
            await (0, activity_1.logActivity)({
                userId: actorId,
                role: req.user.roleName,
                module: "DEPARTMENT",
                action: "UPDATE_DEPARTMENT",
                entityName: "departments",
                entityId: dept.id,
                beforeJson: beforeState,
                afterJson: dept,
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
            });
            (0, response_1.sendSuccess)(res, "Department updated successfully", dept);
        }
        catch (err) {
            next(err);
        }
    }
    async deleteDepartment(req, res, next) {
        try {
            const actorId = req.user.id;
            const beforeState = await department_service_1.departmentService.getDepartment(req.params.id);
            await department_service_1.departmentService.deleteDepartment(req.params.id, actorId);
            await (0, activity_1.logActivity)({
                userId: actorId,
                role: req.user.roleName,
                module: "DEPARTMENT",
                action: "DELETE_DEPARTMENT",
                entityName: "departments",
                entityId: req.params.id,
                beforeJson: beforeState,
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
            });
            (0, response_1.sendSuccess)(res, "Department deleted successfully", null);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.DepartmentController = DepartmentController;
exports.departmentController = new DepartmentController();
