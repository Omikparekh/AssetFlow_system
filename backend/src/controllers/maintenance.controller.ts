import { Response, NextFunction } from "express";
import prisma from "../config/database";
import { sendSuccess } from "../utils/response";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class MaintenanceController {
  async listRequests(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorId = req.user!.id;
      const roleName = req.user!.roleName;
      const { status } = req.query;

      const where: any = { deletedAt: null };

      if (roleName === "Employee") {
        where.requestedById = actorId;
      }

      if (status) {
        where.status = status;
      }

      const requests = await prisma.maintenanceRequest.findMany({
        where,
        include: {
          asset: {
            include: { category: true, brand: true, model: true },
          },
          requestedBy: true,
        },
        orderBy: { createdAt: "desc" },
      });

      sendSuccess(res, "Maintenance requests list fetched successfully", requests);
    } catch (err) {
      next(err);
    }
  }

  async createRequest(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorId = req.user!.id;
      const { assetId, priority, description, estimatedCost } = req.body;

      const asset = await prisma.asset.findUnique({
        where: { id: assetId },
      });

      if (!asset) {
        res.status(404).json({ success: false, message: "Asset not found" });
        return;
      }

      const request = await prisma.$transaction(async (tx) => {
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

      sendSuccess(res, "Maintenance request created successfully", request, 201);
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorId = req.user!.id;
      const { status, actualCost, notes } = req.body;
      const requestId = req.params.id;

      const request = await prisma.maintenanceRequest.findUnique({
        where: { id: requestId },
      });

      if (!request) {
        res.status(404).json({ success: false, message: "Maintenance request not found" });
        return;
      }

      const updated = await prisma.$transaction(async (tx) => {
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
            performedBy: req.user!.fullName,
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

      sendSuccess(res, "Maintenance request status updated successfully", updated);
    } catch (err) {
      next(err);
    }
  }
}

export const maintenanceController = new MaintenanceController();
