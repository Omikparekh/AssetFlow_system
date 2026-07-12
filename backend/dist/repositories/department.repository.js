"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.departmentRepository = exports.DepartmentRepository = void 0;
const database_1 = __importDefault(require("../config/database"));
class DepartmentRepository {
    async findById(id) {
        return database_1.default.department.findFirst({
            where: { id, deletedAt: null },
            include: {
                parent: { select: { id: true, name: true, departmentCode: true } },
                head: { select: { id: true, fullName: true, email: true, employeeCode: true } },
                subDepartments: { where: { deletedAt: null }, select: { id: true, name: true, departmentCode: true } },
            },
        });
    }
    async findByCode(departmentCode) {
        return database_1.default.department.findFirst({
            where: { departmentCode, deletedAt: null },
        });
    }
    async list(params) {
        const whereClause = {
            deletedAt: null,
        };
        if (params.status) {
            whereClause.status = params.status;
        }
        if (params.parentId !== undefined) {
            whereClause.parentId = params.parentId;
        }
        if (params.search) {
            whereClause.OR = [
                { name: { contains: params.search, mode: "insensitive" } },
                { departmentCode: { contains: params.search, mode: "insensitive" } },
            ];
        }
        const [records, total] = await database_1.default.$transaction([
            database_1.default.department.findMany({
                where: whereClause,
                include: {
                    parent: { select: { id: true, name: true } },
                    head: { select: { id: true, fullName: true } },
                },
                skip: params.skip,
                take: params.take,
                orderBy: { name: "asc" },
            }),
            database_1.default.department.count({ where: whereClause }),
        ]);
        return [records, total];
    }
    async create(data) {
        return database_1.default.department.create({
            data,
        });
    }
    async update(id, data) {
        return database_1.default.department.update({
            where: { id },
            data,
        });
    }
    async softDelete(id, actorId) {
        return database_1.default.department.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                updatedBy: actorId,
            },
        });
    }
    async hasActiveDependencies(id) {
        // Check if department has active users
        const userCount = await database_1.default.user.count({
            where: { departmentId: id, deletedAt: null },
        });
        if (userCount > 0)
            return true;
        // Check if department has sub-departments
        const subDeptCount = await database_1.default.department.count({
            where: { parentId: id, deletedAt: null },
        });
        if (subDeptCount > 0)
            return true;
        // Check if department has active asset allocations
        const allocationCount = await database_1.default.assetAllocation.count({
            where: { departmentId: id, status: "ACTIVE" },
        });
        if (allocationCount > 0)
            return true;
        return false;
    }
}
exports.DepartmentRepository = DepartmentRepository;
exports.departmentRepository = new DepartmentRepository();
