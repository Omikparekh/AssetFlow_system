"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assetController = exports.AssetController = void 0;
const database_1 = __importDefault(require("../config/database"));
const response_1 = require("../utils/response");
class AssetController {
    async listAssets(req, res, next) {
        try {
            const { status, categoryId, search } = req.query;
            const where = { deletedAt: null };
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
            const assets = await database_1.default.asset.findMany({
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
            (0, response_1.sendSuccess)(res, "Assets list fetched successfully", assets);
        }
        catch (err) {
            next(err);
        }
    }
    async getAsset(req, res, next) {
        try {
            const asset = await database_1.default.asset.findFirst({
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
            (0, response_1.sendSuccess)(res, "Asset fetched successfully", asset);
        }
        catch (err) {
            next(err);
        }
    }
    async createAsset(req, res, next) {
        try {
            const actorId = req.user.id;
            const { assetTag, serialNumber, purchaseDate, purchaseCost, warrantyExpiry, location, condition, description, categoryId, brandId, modelId, departmentId, } = req.body;
            const asset = await database_1.default.asset.create({
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
            (0, response_1.sendSuccess)(res, "Asset created successfully", asset, 201);
        }
        catch (err) {
            next(err);
        }
    }
    async updateAsset(req, res, next) {
        try {
            const actorId = req.user.id;
            const { assetTag, serialNumber, purchaseDate, purchaseCost, warrantyExpiry, location, condition, description, categoryId, brandId, modelId, departmentId, currentStatus, } = req.body;
            const asset = await database_1.default.asset.update({
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
            (0, response_1.sendSuccess)(res, "Asset updated successfully", asset);
        }
        catch (err) {
            next(err);
        }
    }
    async deleteAsset(req, res, next) {
        try {
            const actorId = req.user.id;
            await database_1.default.asset.update({
                where: { id: req.params.id },
                data: {
                    deletedAt: new Date(),
                    updatedBy: actorId,
                },
            });
            (0, response_1.sendSuccess)(res, "Asset deleted successfully", null);
        }
        catch (err) {
            next(err);
        }
    }
    // --- Lookups ---
    async listCategories(req, res, next) {
        try {
            const categories = await database_1.default.assetCategory.findMany({
                where: { deletedAt: null },
            });
            (0, response_1.sendSuccess)(res, "Categories fetched successfully", categories);
        }
        catch (err) {
            next(err);
        }
    }
    async listBrands(req, res, next) {
        try {
            const brands = await database_1.default.assetBrand.findMany({
                where: { deletedAt: null },
            });
            (0, response_1.sendSuccess)(res, "Brands fetched successfully", brands);
        }
        catch (err) {
            next(err);
        }
    }
    async listModels(req, res, next) {
        try {
            const models = await database_1.default.assetModel.findMany({
                where: { deletedAt: null },
                include: { brand: true, category: true },
            });
            (0, response_1.sendSuccess)(res, "Models fetched successfully", models);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.AssetController = AssetController;
exports.assetController = new AssetController();
