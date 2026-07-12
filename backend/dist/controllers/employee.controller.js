"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeController = exports.EmployeeController = void 0;
const employee_service_1 = require("../services/employee.service");
const response_1 = require("../utils/response");
const activity_1 = require("../utils/activity");
class EmployeeController {
    async getEmployee(req, res, next) {
        try {
            const emp = await employee_service_1.employeeService.getEmployee(req.params.id);
            (0, response_1.sendSuccess)(res, "Employee profile fetched successfully", emp);
        }
        catch (err) {
            next(err);
        }
    }
    async listEmployees(req, res, next) {
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
            const result = await employee_service_1.employeeService.listEmployees(filters);
            (0, response_1.sendSuccess)(res, "Employees list fetched successfully", result.employees, 200, {
                total: result.total,
                page: filters.page || 1,
                limit: filters.limit || 20,
            });
        }
        catch (err) {
            next(err);
        }
    }
    async createEmployee(req, res, next) {
        try {
            const actorId = req.user.id;
            const emp = await employee_service_1.employeeService.createEmployee(req.body, actorId);
            await (0, activity_1.logActivity)({
                userId: actorId,
                role: req.user.roleName,
                module: "EMPLOYEE",
                action: "PROVISION_EMPLOYEE",
                entityName: "users",
                entityId: emp.id,
                afterJson: emp,
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
            });
            (0, response_1.sendSuccess)(res, "Employee profile created successfully", emp, 201);
        }
        catch (err) {
            next(err);
        }
    }
    async updateEmployee(req, res, next) {
        try {
            const actorId = req.user.id;
            const beforeState = await employee_service_1.employeeService.getEmployee(req.params.id);
            const emp = await employee_service_1.employeeService.updateEmployee(req.params.id, req.body, actorId);
            await (0, activity_1.logActivity)({
                userId: actorId,
                role: req.user.roleName,
                module: "EMPLOYEE",
                action: "UPDATE_EMPLOYEE",
                entityName: "users",
                entityId: emp.id,
                beforeJson: beforeState,
                afterJson: emp,
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
            });
            (0, response_1.sendSuccess)(res, "Employee profile updated successfully", emp);
        }
        catch (err) {
            next(err);
        }
    }
    async deleteEmployee(req, res, next) {
        try {
            const actorId = req.user.id;
            const beforeState = await employee_service_1.employeeService.getEmployee(req.params.id);
            await employee_service_1.employeeService.deleteEmployee(req.params.id, actorId);
            await (0, activity_1.logActivity)({
                userId: actorId,
                role: req.user.roleName,
                module: "EMPLOYEE",
                action: "DELETE_EMPLOYEE",
                entityName: "users",
                entityId: req.params.id,
                beforeJson: beforeState,
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
            });
            (0, response_1.sendSuccess)(res, "Employee deleted successfully", null);
        }
        catch (err) {
            next(err);
        }
    }
    async listRoles(req, res, next) {
        try {
            const roles = await employee_service_1.employeeService.listRoles();
            (0, response_1.sendSuccess)(res, "Roles fetched successfully", roles);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.EmployeeController = EmployeeController;
exports.employeeController = new EmployeeController();
