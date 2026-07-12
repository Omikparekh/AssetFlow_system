"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asset_controller_1 = require("../controllers/asset.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Mounting authentication globally for all asset routes
router.use(auth_middleware_1.authenticate);
router.get("/", asset_controller_1.assetController.listAssets);
router.get("/categories", asset_controller_1.assetController.listCategories);
router.get("/brands", asset_controller_1.assetController.listBrands);
router.get("/models", asset_controller_1.assetController.listModels);
router.get("/:id", asset_controller_1.assetController.getAsset);
router.post("/", asset_controller_1.assetController.createAsset);
router.put("/:id", asset_controller_1.assetController.updateAsset);
router.delete("/:id", asset_controller_1.assetController.deleteAsset);
exports.default = router;
