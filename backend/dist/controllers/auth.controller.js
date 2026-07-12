"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const response_1 = require("../utils/response");
const activity_1 = require("../utils/activity");
class AuthController {
    async register(req, res, next) {
        try {
            const user = await auth_service_1.authService.register(req.body);
            // Log registration activity (System/Guest actions can use default user role ID or reference)
            await (0, activity_1.logActivity)({
                userId: user.id,
                role: user.roleName,
                module: "AUTH",
                action: "USER_REGISTER",
                entityName: "users",
                entityId: user.id,
                afterJson: { email: user.email, fullName: user.fullName },
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
            });
            (0, response_1.sendSuccess)(res, "User registered successfully", user, 201);
        }
        catch (err) {
            next(err);
        }
    }
    async login(req, res, next) {
        try {
            const authData = await auth_service_1.authService.login(req.body, req.ip, req.headers["user-agent"]);
            // Set refresh token in secure HTTP-only cookie
            res.cookie("refreshToken", authData.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });
            // Log Login activity
            await (0, activity_1.logActivity)({
                userId: authData.user.id,
                role: authData.user.roleName,
                module: "AUTH",
                action: "USER_LOGIN",
                entityName: "users",
                entityId: authData.user.id,
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
            });
            (0, response_1.sendSuccess)(res, "Login successful", {
                accessToken: authData.accessToken,
                refreshToken: authData.refreshToken, // Still return it in body if clients prefer header storage
                user: authData.user,
            });
        }
        catch (err) {
            next(err);
        }
    }
    async refresh(req, res, next) {
        try {
            // Look for token in cookie first, then fall back to body
            const oldRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;
            const tokens = await auth_service_1.authService.refresh(oldRefreshToken);
            // Rotate cookie token
            res.cookie("refreshToken", tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });
            (0, response_1.sendSuccess)(res, "Tokens refreshed successfully", tokens);
        }
        catch (err) {
            next(err);
        }
    }
    async logout(req, res, next) {
        try {
            const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
            if (refreshToken) {
                await auth_service_1.authService.logout(refreshToken);
            }
            res.clearCookie("refreshToken");
            (0, response_1.sendSuccess)(res, "User logged out successfully", null);
        }
        catch (err) {
            next(err);
        }
    }
    async changePassword(req, res, next) {
        try {
            const userId = req.user.id;
            await auth_service_1.authService.changePassword(userId, req.body);
            await (0, activity_1.logActivity)({
                userId,
                role: req.user.roleName,
                module: "AUTH",
                action: "PASSWORD_CHANGE",
                entityName: "users",
                entityId: userId,
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
            });
            (0, response_1.sendSuccess)(res, "Password changed successfully", null);
        }
        catch (err) {
            next(err);
        }
    }
    async forgotPassword(req, res, next) {
        try {
            await auth_service_1.authService.forgotPassword(req.body.email);
            (0, response_1.sendSuccess)(res, "If the email address exists, a password reset link has been sent.", null);
        }
        catch (err) {
            next(err);
        }
    }
    async resetPassword(req, res, next) {
        try {
            await auth_service_1.authService.resetPassword(req.body.token, req.body);
            (0, response_1.sendSuccess)(res, "Password reset successfully", null);
        }
        catch (err) {
            next(err);
        }
    }
    async getCurrentUser(req, res, next) {
        try {
            // Profile data is already loaded in req.user by authentication middleware
            (0, response_1.sendSuccess)(res, "Current user profile fetched", req.user);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
