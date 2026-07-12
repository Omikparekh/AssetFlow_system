"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.departmentService = exports.DepartmentService = void 0;
const department_repository_1 = require("../repositories/department.repository");
const user_repository_1 = require("../repositories/user.repository");
const custom_error_1 = require("../errors/custom.error");
const logger_1 = __importDefault(require("../utils/logger"));
class DepartmentService {
    async getDepartment(id) {
        const dept = await department_repository_1.departmentRepository.findById(id);
        if (!dept) {
            throw new custom_error_1.NotFoundError("Department not found");
        }
        return dept;
    }
    async listDepartments(filters) {
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const skip = (page - 1) * limit;
        const [departments, total] = await department_repository_1.departmentRepository.list({
            status: filters.status,
            parentId: filters.parentId,
            search: filters.search,
            skip,
            take: limit,
        });
        return { departments, total };
    }
    async createDepartment(data, actorId) {
        // 1. Validate department code uniqueness
        const existing = await department_repository_1.departmentRepository.findByCode(data.departmentCode);
        if (existing) {
            throw new custom_error_1.ConflictError(`Department code "${data.departmentCode}" is already in use`);
        }
        // 2. Validate Parent ID if provided
        if (data.parentId) {
            const parent = await department_repository_1.departmentRepository.findById(data.parentId);
            if (!parent) {
                throw new custom_error_1.NotFoundError("Parent department not found");
            }
        }
        // 3. Validate Head ID if provided
        if (data.headId) {
            const head = await user_repository_1.userRepository.findById(data.headId);
            if (!head) {
                throw new custom_error_1.NotFoundError("Assigned Department Head user not found");
            }
        }
        const dept = await department_repository_1.departmentRepository.create({
            name: data.name,
            departmentCode: data.departmentCode,
            description: data.description,
            parentId: data.parentId,
            headId: data.headId,
            status: data.status,
            createdBy: actorId,
        });
        logger_1.default.info(`Department created: id=${dept.id}, code=${dept.departmentCode}`);
        return dept;
    }
    async updateDepartment(id, data, actorId) {
        const dept = await department_repository_1.departmentRepository.findById(id);
        if (!dept) {
            throw new custom_error_1.NotFoundError("Department not found");
        }
        // 1. Code uniqueness
        if (data.departmentCode && data.departmentCode !== dept.departmentCode) {
            const existing = await department_repository_1.departmentRepository.findByCode(data.departmentCode);
            if (existing) {
                throw new custom_error_1.ConflictError(`Department code "${data.departmentCode}" is already in use`);
            }
        }
        // 2. Hierarchy loop check
        if (data.parentId) {
            if (data.parentId === id) {
                throw new custom_error_1.BadRequestError("A department cannot be its own parent");
            }
            const isCyclic = await this.wouldCreateCycle(id, data.parentId);
            if (isCyclic) {
                throw new custom_error_1.BadRequestError("Cyclic department hierarchy is not allowed (parent cannot be a sub-department)");
            }
        }
        // 3. Head ID check
        if (data.headId && data.headId !== dept.headId) {
            const head = await user_repository_1.userRepository.findById(data.headId);
            if (!head) {
                throw new custom_error_1.NotFoundError("Assigned Department Head user not found");
            }
        }
        const updated = await department_repository_1.departmentRepository.update(id, {
            name: data.name,
            departmentCode: data.departmentCode,
            description: data.description,
            parentId: data.parentId,
            headId: data.headId,
            status: data.status,
            updatedBy: actorId,
        });
        logger_1.default.info(`Department updated: id=${id}`);
        return updated;
    }
    async deleteDepartment(id, actorId) {
        const dept = await department_repository_1.departmentRepository.findById(id);
        if (!dept) {
            throw new custom_error_1.NotFoundError("Department not found");
        }
        // Check active dependencies
        const hasDeps = await department_repository_1.departmentRepository.hasActiveDependencies(id);
        if (hasDeps) {
            throw new custom_error_1.BadRequestError("Cannot delete department: it has active employees, sub-departments, or active asset allocations.");
        }
        await department_repository_1.departmentRepository.softDelete(id, actorId);
        logger_1.default.info(`Department soft-deleted: id=${id} by actor=${actorId}`);
    }
    async wouldCreateCycle(deptId, parentId) {
        let currentParentId = parentId;
        while (currentParentId) {
            if (currentParentId === deptId)
                return true;
            const parent = await department_repository_1.departmentRepository.findById(currentParentId);
            currentParentId = parent ? parent.parentId : null;
        }
        return false;
    }
}
exports.DepartmentService = DepartmentService;
exports.departmentService = new DepartmentService();
