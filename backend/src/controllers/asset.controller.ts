import { Request, Response, NextFunction } from "express";
import prisma from "../config/database";
import { sendSuccess } from "../utils/response";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class AssetController {
  async listAssets(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, categoryId, search } = req.query;
      const where: any = { deletedAt: null };

      if (status) {
        where.currentStatus = status;
      }
      if (categoryId) {
        where.categoryId = categoryId;
      }
      if (search) {
        where.OR = [
          { assetTag: { contains: String(search), mode: "insensitive" } },
          { serialNumber: { contains: String(search), mode: "insensitive" } },
          { name: { contains: String(search), mode: "insensitive" } },
        ];
      }

      const assets = await prisma.asset.findMany({
        where,
        include: {
          category: true,
          brand: true,
          model: true,
          department: true,
          allocations: {
            where: { status: "ACTIVE" },
            include: { employee: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      sendSuccess(res, "Assets list fetched successfully", assets);
    } catch (err) {
      next(err);
    }
  }

  async getAsset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const asset = await prisma.asset.findFirst({
        where: { id: req.params.id, deletedAt: null },
        include: {
          category: true,
          brand: true,
          model: true,
          department: true,
          allocations: {
            include: { employee: true },
          },
        },
      });

      if (!asset) {
        res.status(404).json({ success: false, message: "Asset not found" });
        return;
      }

      sendSuccess(res, "Asset fetched successfully", asset);
    } catch (err) {
      next(err);
    }
  }

  async createAsset(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorId = req.user!.id;
      const {
        assetTag,
        serialNumber,
        purchaseDate,
        purchaseCost,
        warrantyExpiry,
        location,
        condition,
        description,
        categoryId,
        brandId,
        modelId,
        departmentId,
      } = req.body;

      const asset = await prisma.asset.create({
        data: {
          assetTag,
          serialNumber,
          purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
          purchaseCost: purchaseCost ? Number(purchaseCost) : null,
          warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
          location,
          condition,
          description,
          categoryId,
          brandId,
          modelId,
          departmentId: departmentId === "" ? null : departmentId,
          createdBy: actorId,
        },
      });

      sendSuccess(res, "Asset created successfully", asset, 201);
    } catch (err) {
      next(err);
    }
  }

  async updateAsset(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorId = req.user!.id;
      const {
        assetTag,
        serialNumber,
        purchaseDate,
        purchaseCost,
        warrantyExpiry,
        location,
        condition,
        description,
        categoryId,
        brandId,
        modelId,
        departmentId,
        currentStatus,
      } = req.body;

      const asset = await prisma.asset.update({
        where: { id: req.params.id },
        data: {
          assetTag,
          serialNumber,
          purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
          purchaseCost: purchaseCost ? Number(purchaseCost) : undefined,
          warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : undefined,
          location,
          condition,
          description,
          categoryId,
          brandId,
          modelId,
          departmentId: departmentId === "" ? null : departmentId,
          currentStatus,
          updatedBy: actorId,
        },
      });

      sendSuccess(res, "Asset updated successfully", asset);
    } catch (err) {
      next(err);
    }
  }

  async deleteAsset(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorId = req.user!.id;
      await prisma.asset.update({
        where: { id: req.params.id },
        data: {
          deletedAt: new Date(),
          updatedBy: actorId,
        },
      });

      sendSuccess(res, "Asset deleted successfully", null);
    } catch (err) {
      next(err);
    }
  }

  // --- Lookups ---

  async listCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await prisma.assetCategory.findMany({
        where: { deletedAt: null },
      });
      sendSuccess(res, "Categories fetched successfully", categories);
    } catch (err) {
      next(err);
    }
  }

  async listBrands(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const brands = await prisma.assetBrand.findMany({
        where: { deletedAt: null },
      });
      sendSuccess(res, "Brands fetched successfully", brands);
    } catch (err) {
      next(err);
    }
  }

  async listModels(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const models = await prisma.assetModel.findMany({
        where: { deletedAt: null },
        include: { brand: true, category: true },
      });
      sendSuccess(res, "Models fetched successfully", models);
    } catch (err) {
      next(err);
    }
  }
}

export const assetController = new AssetController();
