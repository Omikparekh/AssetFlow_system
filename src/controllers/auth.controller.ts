import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { sendSuccess } from "../utils/response";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { logActivity } from "../utils/activity";

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.register(req.body);
      
      // Log registration activity (System/Guest actions can use default user role ID or reference)
      await logActivity({
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

      sendSuccess(res, "User registered successfully", user, 201);
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authData = await authService.login(
        req.body,
        req.ip,
        req.headers["user-agent"]
      );

      // Set refresh token in secure HTTP-only cookie
      res.cookie("refreshToken", authData.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Log Login activity
      await logActivity({
        userId: authData.user.id,
        role: authData.user.roleName,
        module: "AUTH",
        action: "USER_LOGIN",
        entityName: "users",
        entityId: authData.user.id,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });

      sendSuccess(res, "Login successful", {
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken, // Still return it in body if clients prefer header storage
        user: authData.user,
      });
    } catch (err) {
      next(err);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Look for token in cookie first, then fall back to body
      const oldRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;
      
      const tokens = await authService.refresh(oldRefreshToken);

      // Rotate cookie token
      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      sendSuccess(res, "Tokens refreshed successfully", tokens);
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
      
      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      res.clearCookie("refreshToken");
      sendSuccess(res, "User logged out successfully", null);
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      await authService.changePassword(userId, req.body);

      await logActivity({
        userId,
        role: req.user!.roleName,
        module: "AUTH",
        action: "PASSWORD_CHANGE",
        entityName: "users",
        entityId: userId,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });

      sendSuccess(res, "Password changed successfully", null);
    } catch (err) {
      next(err);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.forgotPassword(req.body.email);
      sendSuccess(
        res,
        "If the email address exists, a password reset link has been sent.",
        null
      );
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.resetPassword(req.body.token, req.body);
      sendSuccess(res, "Password reset successfully", null);
    } catch (err) {
      next(err);
    }
  }

  async getCurrentUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Profile data is already loaded in req.user by authentication middleware
      sendSuccess(res, "Current user profile fetched", req.user);
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
