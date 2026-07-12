"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const auth_validator_1 = require("../validators/auth.validator");
const router = (0, express_1.Router)();
// Public routes
router.post("/register", (0, validate_middleware_1.validateRequest)({ body: auth_validator_1.registerSchema }), auth_controller_1.authController.register);
router.post("/login", (0, validate_middleware_1.validateRequest)({ body: auth_validator_1.loginSchema }), auth_controller_1.authController.login);
router.post("/refresh", (0, validate_middleware_1.validateRequest)({ body: auth_validator_1.refreshTokenSchema }), auth_controller_1.authController.refresh);
router.post("/logout", auth_controller_1.authController.logout);
router.post("/forgot-password", (0, validate_middleware_1.validateRequest)({ body: auth_validator_1.forgotPasswordSchema }), auth_controller_1.authController.forgotPassword);
router.post("/reset-password", (0, validate_middleware_1.validateRequest)({ body: auth_validator_1.resetPasswordSchema }), auth_controller_1.authController.resetPassword);
// Protected routes
router.post("/change-password", auth_middleware_1.authenticate, (0, validate_middleware_1.validateRequest)({ body: auth_validator_1.changePasswordSchema }), auth_controller_1.authController.changePassword);
router.get("/me", auth_middleware_1.authenticate, auth_controller_1.authController.getCurrentUser);
exports.default = router;
