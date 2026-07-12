import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { validateRequest } from "../middlewares/validate.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "../validators/auth.validator";

const router = Router();

// Public routes
router.post(
  "/register",
  validateRequest({ body: registerSchema }),
  authController.register
);

router.post(
  "/login",
  validateRequest({ body: loginSchema }),
  authController.login
);

router.post(
  "/refresh",
  validateRequest({ body: refreshTokenSchema }),
  authController.refresh
);

router.post("/logout", authController.logout);

router.post(
  "/forgot-password",
  validateRequest({ body: forgotPasswordSchema }),
  authController.forgotPassword
);

router.post(
  "/reset-password",
  validateRequest({ body: resetPasswordSchema }),
  authController.resetPassword
);

// Protected routes
router.post(
  "/change-password",
  authenticate as any,
  validateRequest({ body: changePasswordSchema }),
  authController.changePassword as any
);

router.get("/me", authenticate as any, authController.getCurrentUser as any);

export default router;
