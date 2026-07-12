import { Response, NextFunction } from "express";
import prisma from "../config/database";
import { sendSuccess } from "../utils/response";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class AllocationController {
  async listAllocations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorId = req.user!.id;
      const roleName = req.user!.roleName;
      const { status, employeeId } = req.query;

      const where: any = { deletedAt: null };

      // Enforce Employee role restriction: Employees can only view their own allocations
      if (roleName === "Employee") {
        where.employeeId = actorId;
      } else if (employeeId) {
        where.employeeId = String(employeeId);
      }

      if (status) {
        where.status = status;
      }

      const allocations = await prisma.assetAllocation.findMany({
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

      sendSuccess(res, "Allocations list fetched successfully", allocations);
    } catch (err) {
      next(err);
    }
  }

  async createAllocation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorId = req.user!.id;
      const { assetId, employeeId, departmentId, expectedReturn, notes } = req.body;

      // 1. Verify asset is available
      const asset = await prisma.asset.findFirst({
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
      const allocation = await prisma.$transaction(async (tx) => {
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

      sendSuccess(res, "Asset allocated successfully", allocation, 201);
    } catch (err) {
      next(err);
    }
  }

  async returnAllocation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { allocationId, returnCondition, notes } = req.body;

      const allocation = await prisma.assetAllocation.findUnique({
        where: { id: allocationId },
      });

      if (!allocation || allocation.status !== "ACTIVE") {
        res.status(404).json({ success: false, message: "Active allocation record not found" });
        return;
      }

      const updated = await prisma.$transaction(async (tx) => {
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

      sendSuccess(res, "Asset returned successfully", updated);
    } catch (err) {
      next(err);
    }
  }

  // --- Return Requests (Employee Self-Service) ---

  async requestReturn(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorId = req.user!.id;
      const { assetId, notes, returnCondition } = req.body;

      // Ensure user actually has this asset allocated to them actively
      const activeAllocation = await prisma.assetAllocation.findFirst({
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

      const existingRequest = await prisma.returnRequest.findFirst({
        where: { assetId, requestedById: actorId, status: "PENDING", deletedAt: null },
      });

      if (existingRequest) {
        res.status(409).json({ success: false, message: "A return request for this asset is already pending" });
        return;
      }

      const asset = await prisma.asset.findUnique({
        where: { id: assetId },
        select: { assetTag: true, model: { select: { name: true } }, brand: { select: { name: true } } },
      });

      const returnRequest = await prisma.$transaction(async (tx) => {
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
              message: `${req.user!.fullName} requested to return ${assetName} (${asset?.assetTag || "Unknown tag"}).`,
              type: "RETURN_REQUEST",
            })),
          });
        }

        return request;
      });

      sendSuccess(res, "Asset return request submitted successfully", returnRequest, 201);
    } catch (err) {
      next(err);
    }
  }

  async listReturnRequests(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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

      const requests = await prisma.returnRequest.findMany({
        where,
        include: {
          asset: {
            include: { category: true, brand: true, model: true },
          },
          requestedBy: true,
        },
        orderBy: { createdAt: "desc" },
      });

      sendSuccess(res, "Return requests list fetched successfully", requests);
    } catch (err) {
      next(err);
    }
  }

  async actionReturnRequest(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorId = req.user!.id;
      const { requestId, status, notes } = req.body;

      const returnRequest = await prisma.returnRequest.findUnique({
        where: { id: requestId },
      });

      if (!returnRequest || returnRequest.status !== "PENDING") {
        res.status(404).json({ success: false, message: "Pending return request not found" });
        return;
      }

      const updated = await prisma.$transaction(async (tx) => {
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

      sendSuccess(res, `Return request ${status.toLowerCase()} successfully`, updated);
    } catch (err) {
      next(err);
    }
  }
}

export const allocationController = new AllocationController();
