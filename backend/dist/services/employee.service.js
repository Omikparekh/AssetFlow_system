"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeService = exports.EmployeeService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_repository_1 = require("../repositories/user.repository");
const department_repository_1 = require("../repositories/department.repository");
const database_1 = __importDefault(require("../config/database"));
const custom_error_1 = require("../errors/custom.error");
const redis_1 = require("../config/redis");
const logger_1 = __importDefault(require("../utils/logger"));
class EmployeeService {
    async getEmployee(id) {
        const employee = await user_repository_1.userRepository.findById(id);
        if (!employee) {
            throw new custom_error_1.NotFoundError("Employee not found");
        }
        return this.sanitizeUser(employee);
    }
    async listEmployees(filters) {
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const skip = (page - 1) * limit;
        const [users, total] = await user_repository_1.userRepository.list({
            status: filters.status,
            roleId: filters.roleId,
            departmentId: filters.departmentId,
            search: filters.search,
            skip,
            take: limit,
        });
        const sanitized = users.map((u) => this.sanitizeUser(u));
        return { employees: sanitized, total };
    }
    async createEmployee(data, actorId) {
        // 1. Email uniqueness
        const existingEmail = await user_repository_1.userRepository.findByEmail(data.email);
        if (existingEmail) {
            throw new custom_error_1.ConflictError("Email address is already in use");
        }
        // 2. Employee code uniqueness
        const existingCode = await user_repository_1.userRepository.findByEmployeeCode(data.employeeCode);
        if (existingCode) {
            throw new custom_error_1.ConflictError("Employee code is already in use");
        }
        // 3. Validate Role exists
        const role = await database_1.default.role.findUnique({ where: { id: data.roleId } });
        if (!role) {
            throw new custom_error_1.NotFoundError("Role not found");
        }
        // 4. Validate Department exists if provided
        if (data.departmentId) {
            const dept = await department_repository_1.departmentRepository.findById(data.departmentId);
            if (!dept) {
                throw new custom_error_1.NotFoundError("Department not found");
            }
        }
        // Hash the password
        const salt = await bcrypt_1.default.genSalt(10);
        const passwordHash = await bcrypt_1.default.hash(data.password, salt);
        const employee = await user_repository_1.userRepository.create({
            email: data.email,
            passwordHash,
            fullName: data.fullName,
            employeeCode: data.employeeCode,
            phone: data.phone,
            profileImage: data.profileImage,
            status: data.status,
            roleId: data.roleId,
            departmentId: data.departmentId,
            createdBy: actorId,
        });
        logger_1.default.info(`Employee profile provisioned: id=${employee.id}, email=${employee.email}`);
        return this.sanitizeUser(employee);
    }
    async updateEmployee(id, data, actorId) {
        const employee = await user_repository_1.userRepository.findById(id);
        if (!employee) {
            throw new custom_error_1.NotFoundError("Employee not found");
        }
        // 1. Unique email check
        if (data.email && data.email !== employee.email) {
            const existingEmail = await user_repository_1.userRepository.findByEmail(data.email);
            if (existingEmail) {
                throw new custom_error_1.ConflictError("Email address is already in use");
            }
        }
        // 2. Unique code check
        if (data.employeeCode && data.employeeCode !== employee.employeeCode) {
            const existingCode = await user_repository_1.userRepository.findByEmployeeCode(data.employeeCode);
            if (existingCode) {
                throw new custom_error_1.ConflictError("Employee code is already in use");
            }
        }
        // 3. Role check
        if (data.roleId && data.roleId !== employee.roleId) {
            const role = await database_1.default.role.findUnique({ where: { id: data.roleId } });
            if (!role) {
                throw new custom_error_1.NotFoundError("Role not found");
            }
        }
        // 4. Department check
        if (data.departmentId && data.departmentId !== employee.departmentId) {
            const dept = await department_repository_1.departmentRepository.findById(data.departmentId);
            if (!dept) {
                throw new custom_error_1.NotFoundError("Department not found");
            }
        }
        const updated = await user_repository_1.userRepository.update(id, {
            email: data.email,
            fullName: data.fullName,
            employeeCode: data.employeeCode,
            phone: data.phone,
            profileImage: data.profileImage,
            status: data.status,
            roleId: data.roleId,
            departmentId: data.departmentId,
            updatedBy: actorId,
        });
        // Invalidate cached user status and session permissions immediately
        await redis_1.cache.del(`user:status:${id}`);
        await redis_1.cache.del(`role:permissions:${employee.roleId}`);
        if (data.roleId) {
            await redis_1.cache.del(`role:permissions:${data.roleId}`);
        }
        logger_1.default.info(`Employee profile updated: id=${id} by actor=${actorId}`);
        return this.sanitizeUser(updated);
    }
    async deleteEmployee(id, actorId) {
        const employee = await user_repository_1.userRepository.findById(id);
        if (!employee) {
            throw new custom_error_1.NotFoundError("Employee not found");
        }
        // Check if the user has active allocations/maintenance/bookings
        const hasAssignments = await user_repository_1.userRepository.hasActiveAssignments(id);
        if (hasAssignments) {
            throw new custom_error_1.BadRequestError("Cannot delete employee profile: user currently has active asset allocations, open maintenance tickets, or active bookings.");
        }
        await user_repository_1.userRepository.softDelete(id, actorId);
        // Invalidate caches
        await redis_1.cache.del(`user:status:${id}`);
        logger_1.default.info(`Employee soft-deleted: id=${id} by actor=${actorId}`);
    }
    async listRoles() {
        return database_1.default.role.findMany({
            orderBy: { name: "asc" },
        });
    }
    sanitizeUser(user) {
        const { passwordHash, ...rest } = user;
        return rest;
    }
}
exports.EmployeeService = EmployeeService;
exports.employeeService = new EmployeeService();
