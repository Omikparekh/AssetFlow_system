"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = exports.UserRepository = void 0;
const database_1 = __importDefault(require("../config/database"));
class UserRepository {
    async findById(id) {
        return database_1.default.user.findFirst({
            where: { id, deletedAt: null },
            include: {
                role: { select: { name: true } },
                department: { select: { name: true } },
            },
        });
    }
    async findByEmail(email) {
        return database_1.default.user.findFirst({
            where: { email, deletedAt: null },
            include: {
                role: { select: { name: true } },
            },
        });
    }
    async findByEmployeeCode(employeeCode) {
        return database_1.default.user.findFirst({
            where: { employeeCode, deletedAt: null },
            include: {
                role: { select: { name: true } },
            },
        });
    }
    async create(data) {
        return database_1.default.user.create({
            data,
            include: {
                role: { select: { name: true } },
            },
        });
    }
    async update(id, data) {
        return database_1.default.user.update({
            where: { id },
            data,
            include: {
                role: { select: { name: true } },
            },
        });
    }
    async softDelete(id, actorId) {
        return database_1.default.user.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                updatedBy: actorId,
            },
        });
    }
    async list(params) {
        const whereClause = {
            deletedAt: null,
        };
        if (params.status) {
            whereClause.status = params.status;
        }
        if (params.roleId) {
            whereClause.roleId = params.roleId;
        }
        if (params.departmentId !== undefined) {
            whereClause.departmentId = params.departmentId;
        }
        if (params.search) {
            whereClause.OR = [
                { fullName: { contains: params.search, mode: "insensitive" } },
                { email: { contains: params.search, mode: "insensitive" } },
                { employeeCode: { contains: params.search, mode: "insensitive" } },
            ];
        }
        const [records, total] = await database_1.default.$transaction([
            database_1.default.user.findMany({
                where: whereClause,
                include: {
                    role: { select: { id: true, name: true } },
                    department: { select: { id: true, name: true } },
                },
                skip: params.skip,
                take: params.take,
                orderBy: { fullName: "asc" },
            }),
            database_1.default.user.count({ where: whereClause }),
        ]);
        return [records, total];
    }
    async hasActiveAssignments(userId) {
        // Check active allocations
        const allocationCount = await database_1.default.assetAllocation.count({
            where: { employeeId: userId, status: "ACTIVE" },
        });
        if (allocationCount > 0)
            return true;
        // Check open maintenance requests assigned
        const maintenanceCount = await database_1.default.maintenanceRequest.count({
            where: { requestedById: userId, NOT: { status: "RESOLVED" } },
        });
        if (maintenanceCount > 0)
            return true;
        // Check pending bookings
        const bookingCount = await database_1.default.booking.count({
            where: { bookedById: userId, status: { in: ["UPCOMING", "ONGOING"] } },
        });
        if (bookingCount > 0)
            return true;
        return false;
    }
}
exports.UserRepository = UserRepository;
exports.userRepository = new UserRepository();
