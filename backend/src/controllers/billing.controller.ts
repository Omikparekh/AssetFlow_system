import { Response, NextFunction } from "express";
import prisma from "../config/database";
import { sendSuccess } from "../utils/response";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class BillingController {
  async listCharges(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorId = req.user!.id;
      const roleName = req.user!.roleName;
      const { status, employeeId } = req.query;

      const where: any = {};

      if (roleName === "Employee") {
        where.employeeId = actorId;
      } else if (employeeId) {
        where.employeeId = String(employeeId);
      }

      if (status) {
        where.status = status;
      }

      const charges = await prisma.assetCharge.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });

      sendSuccess(res, "Charges list fetched successfully", charges);
    } catch (err) {
      next(err);
    }
  }

  async createCharge(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { employeeId, title, amount, assetTag, notes } = req.body;

      // 1. Fetch employee to verify they exist and cache their name
      const employee = await prisma.user.findUnique({
        where: { id: employeeId },
      });

      if (!employee) {
        res.status(404).json({ success: false, message: "Employee not found" });
        return;
      }

      const charge = await prisma.assetCharge.create({
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
      await prisma.activityLog.create({
        data: {
          userId: req.user!.id,
          role: req.user!.roleName,
          module: "BILLING",
          action: `Created charge of $${amount} for ${employee.fullName} (Asset: ${assetTag})`,
          entityName: "asset_charges",
          entityId: charge.id,
        },
      });

      sendSuccess(res, "Charge created successfully", charge, 201);
    } catch (err) {
      next(err);
    }
  }

  async collectPayment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { chargeId, status, notes } = req.body;

      const charge = await prisma.assetCharge.findUnique({
        where: { id: chargeId },
      });

      if (!charge) {
        res.status(404).json({ success: false, message: "Charge record not found" });
        return;
      }

      const updated = await prisma.assetCharge.update({
        where: { id: chargeId },
        data: {
          status,
          notes: notes || charge.notes,
        },
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: req.user!.id,
          role: req.user!.roleName,
          module: "BILLING",
          action: `Marked charge (${charge.title}) for ${charge.employeeName} as ${status}`,
          entityName: "asset_charges",
          entityId: charge.id,
        },
      });

      sendSuccess(res, `Payment status updated to ${status} successfully`, updated);
    } catch (err) {
      next(err);
    }
  }

  async getOutstandingBalance(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorId = req.user!.id;
      const roleName = req.user!.roleName;
      const { employeeId } = req.query;

      let targetId = actorId;
      if (roleName !== "Employee" && employeeId) {
        targetId = String(employeeId);
      }

      const pendingCharges = await prisma.assetCharge.findMany({
        where: {
          employeeId: targetId,
          status: "PENDING",
        },
      });

      const totalBalance = pendingCharges.reduce((acc, curr) => acc + curr.amount, 0);

      sendSuccess(res, "Outstanding balance fetched successfully", { totalBalance });
    } catch (err) {
      next(err);
    }
  }
}

export const billingController = new BillingController();
