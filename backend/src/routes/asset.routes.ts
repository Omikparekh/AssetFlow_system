import { Router } from "express";
import { assetController } from "../controllers/asset.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// Mounting authentication globally for all asset routes
router.use(authenticate as any);

router.get("/", assetController.listAssets as any);
router.get("/categories", assetController.listCategories as any);
router.get("/brands", assetController.listBrands as any);
router.get("/models", assetController.listModels as any);
router.get("/:id", assetController.getAsset as any);
router.post("/", assetController.createAsset as any);
router.put("/:id", assetController.updateAsset as any);
router.delete("/:id", assetController.deleteAsset as any);

export default router;
