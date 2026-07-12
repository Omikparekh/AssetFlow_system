"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.billingController = exports.BillingController = void 0;
const database_1 = __importDefault(require("../config/database"));
const response_1 = require("../utils/response");
class BillingController {
    async listCharges(req, res, next) {
        try {
            const actorId = req.user.id;
            const roleName = req.user.roleName;
            const { status, employeeId } = req.query;
            const where = {};
            if (roleName === "Employee") {
                where.employeeId = actorId;
            }
            else if (employeeId) {
                where.employeeId = String(employeeId);
            }
            if (status) {
                where.status = status;
            }
            const charges = await database_1.default.assetCharge.findMany({
                where,
                orderBy: { createdAt: "desc" },
            });
            (0, response_1.sendSuccess)(res, "Charges list fetched successfully", charges);
        }
        catch (err) {
            next(err);
        }
    }
    async createCharge(req, res, next) {
        try {
            const { employeeId, title, amount, assetTag, notes } = req.body;
            // 1. Fetch employee to verify they exist and cache their name
            const employee = await database_1.default.user.findUnique({
                where: { id: employeeId },
            });
            if (!employee) {
                res.status(404).json({ success: false, message: "Employee not found" });
                return;
            }
            const charge = await database_1.default.assetCharge.create({
                data: {
                    title,
                    amount: Number(amount),
                    status: "PENDING",
                    notes: notes || "",
                    employeeId,
                    employeeName: employee.fullName,
                    assetTag: assetTag || "N/A",
                },
            });
            // Log activity
            await database_1.default.activityLog.create({
                data: {
                    userId: req.user.id,
                    role: req.user.roleName,
                    module: "BILLING",
                    action: `Created charge of $${amount} for ${employee.fullName} (Asset: ${assetTag})`,
                    entityName: "asset_charges",
                    entityId: charge.id,
                },
            });
            (0, response_1.sendSuccess)(res, "Charge created successfully", charge, 201);
        }
        catch (err) {
            next(err);
        }
    }
    async collectPayment(req, res, next) {
        try {
            const { chargeId, status, notes } = req.body;
            const charge = await database_1.default.assetCharge.findUnique({
                where: { id: chargeId },
            });
            if (!charge) {
                res.status(404).json({ success: false, message: "Charge record not found" });
                return;
            }
            const updated = await database_1.default.assetCharge.update({
                where: { id: chargeId },
                data: {
                    status,
                    notes: notes || charge.notes,
                },
            });
            // Log activity
            await database_1.default.activityLog.create({
                data: {
                    userId: req.user.id,
                    role: req.user.roleName,
                    module: "BILLING",
                    action: `Marked charge (${charge.title}) for ${charge.employeeName} as ${status}`,
                    entityName: "asset_charges",
                    entityId: charge.id,
                },
            });
            (0, response_1.sendSuccess)(res, `Payment status updated to ${status} successfully`, updated);
        }
        catch (err) {
            next(err);
        }
    }
    async getOutstandingBalance(req, res, next) {
        try {
            const actorId = req.user.id;
            const roleName = req.user.roleName;
            const { employeeId } = req.query;
            let targetId = actorId;
            if (roleName !== "Employee" && employeeId) {
                targetId = String(employeeId);
            }
            const pendingCharges = await database_1.default.assetCharge.findMany({
                where: {
                    employeeId: targetId,
                    status: "PENDING",
                },
            });
            const totalBalance = pendingCharges.reduce((acc, curr) => acc + curr.amount, 0);
            (0, response_1.sendSuccess)(res, "Outstanding balance fetched successfully", { totalBalance });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.BillingController = BillingController;
exports.billingController = new BillingController();
