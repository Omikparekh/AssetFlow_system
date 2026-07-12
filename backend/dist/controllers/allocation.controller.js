"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.allocationController = exports.AllocationController = void 0;
const database_1 = __importDefault(require("../config/database"));
const response_1 = require("../utils/response");
class AllocationController {
    async listAllocations(req, res, next) {
        try {
            const actorId = req.user.id;
            const roleName = req.user.roleName;
            const { status, employeeId } = req.query;
            const where = { deletedAt: null };
            // Enforce Employee role restriction: Employees can only view their own allocations
            if (roleName === "Employee") {
                where.employeeId = actorId;
            }
            else if (employeeId) {
                where.employeeId = String(employeeId);
            }
            if (status) {
                where.status = status;
            }
            const allocations = await database_1.default.assetAllocation.findMany({
                where,
                include: {
                    asset: {
                        include: { category: true, brand: true, model: true },
                    },
                    employee: true,
                    department: true,
                },
                orderBy: { allocatedAt: "desc" },
            });
            (0, response_1.sendSuccess)(res, "Allocations list fetched successfully", allocations);
        }
        catch (err) {
            next(err);
        }
    }
    async createAllocation(req, res, next) {
        try {
            const actorId = req.user.id;
            const { assetId, employeeId, departmentId, expectedReturn, notes } = req.body;
            // 1. Verify asset is available
            const asset = await database_1.default.asset.findFirst({
                where: { id: assetId, deletedAt: null },
            });
            if (!asset) {
                res.status(404).json({ success: false, message: "Asset not found" });
                return;
            }
            if (asset.currentStatus !== "AVAILABLE") {
                res.status(400).json({ success: false, message: `Asset is not available for allocation. Current status: ${asset.currentStatus}` });
                return;
            }
            // 2. Perform transaction to create allocation and mark asset allocated
            const allocation = await database_1.default.$transaction(async (tx) => {
                const alloc = await tx.assetAllocation.create({
                    data: {
                        assetId,
                        employeeId: employeeId || null,
                        departmentId: departmentId || null,
                        allocatedById: actorId,
                        expectedReturn: expectedReturn ? new Date(expectedReturn) : null,
                        notes,
                        status: "ACTIVE",
                    },
                });
                await tx.asset.update({
                    where: { id: assetId },
                    data: { currentStatus: "ALLOCATED" },
                });
                return alloc;
            });
            (0, response_1.sendSuccess)(res, "Asset allocated successfully", allocation, 201);
        }
        catch (err) {
            next(err);
        }
    }
    async returnAllocation(req, res, next) {
        try {
            const { allocationId, returnCondition, notes } = req.body;
            const allocation = await database_1.default.assetAllocation.findUnique({
                where: { id: allocationId },
            });
            if (!allocation || allocation.status !== "ACTIVE") {
                res.status(404).json({ success: false, message: "Active allocation record not found" });
                return;
            }
            const updated = await database_1.default.$transaction(async (tx) => {
                const updatedAlloc = await tx.assetAllocation.update({
                    where: { id: allocationId },
                    data: {
                        actualReturn: new Date(),
                        returnCondition,
                        status: "RETURNED",
                        notes: notes || allocation.notes,
                    },
                });
                await tx.asset.update({
                    where: { id: allocation.assetId },
                    data: { currentStatus: "AVAILABLE", condition: returnCondition || undefined },
                });
                return updatedAlloc;
            });
            (0, response_1.sendSuccess)(res, "Asset returned successfully", updated);
        }
        catch (err) {
            next(err);
        }
    }
    // --- Return Requests (Employee Self-Service) ---
    async requestReturn(req, res, next) {
        try {
            const actorId = req.user.id;
            const { assetId, notes, returnCondition } = req.body;
            // Ensure user actually has this asset allocated to them actively
            const activeAllocation = await database_1.default.assetAllocation.findFirst({
                where: {
                    assetId,
                    employeeId: actorId,
                    status: "ACTIVE",
                },
            });
            if (!activeAllocation) {
                res.status(400).json({ success: false, message: "You do not have this asset actively allocated to you" });
                return;
            }
            const existingRequest = await database_1.default.returnRequest.findFirst({
                where: { assetId, requestedById: actorId, status: "PENDING", deletedAt: null },
            });
            if (existingRequest) {
                res.status(409).json({ success: false, message: "A return request for this asset is already pending" });
                return;
            }
            const asset = await database_1.default.asset.findUnique({
                where: { id: assetId },
                select: { assetTag: true, model: { select: { name: true } }, brand: { select: { name: true } } },
            });
            const returnRequest = await database_1.default.$transaction(async (tx) => {
                const request = await tx.returnRequest.create({
                    data: {
                        assetId,
                        requestedById: actorId,
                        returnCondition: returnCondition || "GOOD",
                        notes,
                        status: "PENDING",
                    },
                });
                const admins = await tx.user.findMany({
                    where: { status: "ACTIVE", deletedAt: null, role: { name: "Admin" } },
                    select: { id: true },
                });
                const assetName = asset?.model?.name || asset?.brand?.name || "asset";
                if (admins.length > 0) {
                    await tx.notification.createMany({
                        data: admins.map((admin) => ({
                            recipientId: admin.id,
                            title: "New asset return request",
                            message: `${req.user.fullName} requested to return ${assetName} (${asset?.assetTag || "Unknown tag"}).`,
                            type: "RETURN_REQUEST",
                        })),
                    });
                }
                return request;
            });
            (0, response_1.sendSuccess)(res, "Asset return request submitted successfully", returnRequest, 201);
        }
        catch (err) {
            next(err);
        }
    }
    async listReturnRequests(req, res, next) {
        try {
            const actorId = req.user.id;
            const roleName = req.user.roleName;
            const { status } = req.query;
            const where = { deletedAt: null };
            if (roleName === "Employee") {
                where.requestedById = actorId;
            }
            if (status) {
                where.status = status;
            }
            const requests = await database_1.default.returnRequest.findMany({
                where,
                include: {
                    asset: {
                        include: { category: true, brand: true, model: true },
                    },
                    requestedBy: true,
                },
                orderBy: { createdAt: "desc" },
            });
            (0, response_1.sendSuccess)(res, "Return requests list fetched successfully", requests);
        }
        catch (err) {
            next(err);
        }
    }
    async actionReturnRequest(req, res, next) {
        try {
            const actorId = req.user.id;
            const { requestId, status, notes } = req.body;
            const returnRequest = await database_1.default.returnRequest.findUnique({
                where: { id: requestId },
            });
            if (!returnRequest || returnRequest.status !== "PENDING") {
                res.status(404).json({ success: false, message: "Pending return request not found" });
                return;
            }
            const updated = await database_1.default.$transaction(async (tx) => {
                const updatedRequest = await tx.returnRequest.update({
                    where: { id: requestId },
                    data: {
                        status,
                        approvedById: actorId,
                        actionedAt: new Date(),
                        notes: notes || returnRequest.notes,
                    },
                });
                if (status === "APPROVED") {
                    const activeAlloc = await tx.assetAllocation.findFirst({
                        where: {
                            assetId: returnRequest.assetId,
                            employeeId: returnRequest.requestedById,
                            status: "ACTIVE",
                        },
                    });
                    if (activeAlloc) {
                        await tx.assetAllocation.update({
                            where: { id: activeAlloc.id },
                            data: {
                                status: "RETURNED",
                                actualReturn: new Date(),
                                returnCondition: returnRequest.returnCondition,
                            },
                        });
                    }
                    await tx.asset.update({
                        where: { id: returnRequest.assetId },
                        data: {
                            currentStatus: "AVAILABLE",
                            condition: returnRequest.returnCondition,
                        },
                    });
                }
                return updatedRequest;
            });
            (0, response_1.sendSuccess)(res, `Return request ${status.toLowerCase()} successfully`, updated);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.AllocationController = AllocationController;
exports.allocationController = new AllocationController();
