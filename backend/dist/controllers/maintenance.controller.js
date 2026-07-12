"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.maintenanceController = exports.MaintenanceController = void 0;
const database_1 = __importDefault(require("../config/database"));
const response_1 = require("../utils/response");
class MaintenanceController {
    async listRequests(req, res, next) {
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
            const requests = await database_1.default.maintenanceRequest.findMany({
                where,
                include: {
                    asset: {
                        include: { category: true, brand: true, model: true },
                    },
                    requestedBy: true,
                },
                orderBy: { createdAt: "desc" },
            });
            (0, response_1.sendSuccess)(res, "Maintenance requests list fetched successfully", requests);
        }
        catch (err) {
            next(err);
        }
    }
    async createRequest(req, res, next) {
        try {
            const actorId = req.user.id;
            const { assetId, priority, description, estimatedCost } = req.body;
            const asset = await database_1.default.asset.findUnique({
                where: { id: assetId },
            });
            if (!asset) {
                res.status(404).json({ success: false, message: "Asset not found" });
                return;
            }
            const request = await database_1.default.$transaction(async (tx) => {
                const reqRecord = await tx.maintenanceRequest.create({
                    data: {
                        assetId,
                        priority: priority || "MEDIUM",
                        description,
                        estimatedCost: estimatedCost ? Number(estimatedCost) : null,
                        requestedById: actorId,
                        status: "PENDING",
                    },
                });
                await tx.asset.update({
                    where: { id: assetId },
                    data: { currentStatus: "UNDER_MAINTENANCE" },
                });
                return reqRecord;
            });
            (0, response_1.sendSuccess)(res, "Maintenance request created successfully", request, 201);
        }
        catch (err) {
            next(err);
        }
    }
    async updateStatus(req, res, next) {
        try {
            const actorId = req.user.id;
            const { status, actualCost, notes } = req.body;
            const requestId = req.params.id;
            const request = await database_1.default.maintenanceRequest.findUnique({
                where: { id: requestId },
            });
            if (!request) {
                res.status(404).json({ success: false, message: "Maintenance request not found" });
                return;
            }
            const updated = await database_1.default.$transaction(async (tx) => {
                const updatedReq = await tx.maintenanceRequest.update({
                    where: { id: requestId },
                    data: {
                        status,
                        actualCost: actualCost ? Number(actualCost) : undefined,
                        approvedById: status === "APPROVED" ? actorId : undefined,
                        updatedBy: actorId,
                    },
                });
                // Create log entry if logs are linked
                await tx.maintenanceLog.create({
                    data: {
                        requestId,
                        actionTaken: `Status updated to ${status}`,
                        notes: notes || `Request status transition by actor.`,
                        performedBy: req.user.fullName,
                    },
                });
                // If status is resolved, release the asset back to AVAILABLE
                if (status === "RESOLVED") {
                    await tx.asset.update({
                        where: { id: request.assetId },
                        data: { currentStatus: "AVAILABLE" },
                    });
                }
                return updatedReq;
            });
            (0, response_1.sendSuccess)(res, "Maintenance request status updated successfully", updated);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.MaintenanceController = MaintenanceController;
exports.maintenanceController = new MaintenanceController();
