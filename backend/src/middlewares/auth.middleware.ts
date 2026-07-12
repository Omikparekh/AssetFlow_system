import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/database";
import { UnauthorizedError, ForbiddenError } from "../errors/custom.error";
import { cache } from "../config/redis";
import logger from "../utils/logger";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    fullName: string;
    roleId: string;
    roleName: string;
    departmentId: string | null;
  };
}

export interface TokenPayload {
  userId: string;
  roleId: string;
  roleName: string;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Check for Developer/Service API Key support
    const apiKeyHeader = req.headers["x-api-key"];
    const systemApiKey = process.env.API_KEY;

    if (systemApiKey && apiKeyHeader === systemApiKey) {
      const adminRole = await prisma.role.findFirst({ where: { name: "Admin" } });
      const systemUser = await prisma.user.findFirst({
        where: { roleId: adminRole?.id, deletedAt: null },
      });

      if (systemUser) {
        req.user = {
          id: systemUser.id,
          email: systemUser.email,
          fullName: systemUser.fullName,
          roleId: systemUser.roleId,
          roleName: "Admin",
          departmentId: systemUser.departmentId,
        };
        next();
        return;
      }
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Authentication token required");
    }

    const token = authHeader.split(" ")[1];
    const jwtSecret = process.env.JWT_SECRET || "super-secret-key-change-in-production";

    const decoded = jwt.verify(token, jwtSecret) as TokenPayload;

    // Check account status in DB (or cache)
    const cacheKey = `user:status:${decoded.userId}`;
    let userState = await cache.get<{
      status: string;
      deletedAt: string | null;
      email: string;
      fullName: string;
      departmentId: string | null;
    }>(cacheKey);

    if (!userState) {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          status: true,
          deletedAt: true,
          email: true,
          fullName: true,
          departmentId: true,
        },
      });

      if (!user) {
        throw new UnauthorizedError("User account no longer exists");
      }

      userState = {
        status: user.status,
        deletedAt: user.deletedAt ? user.deletedAt.toISOString() : null,
        email: user.email,
        fullName: user.fullName,
        departmentId: user.departmentId,
      };

      // Cache user status for 60 seconds
      await cache.set(cacheKey, userState, 60);
    }

    if (userState.deletedAt) {
      throw new UnauthorizedError("User account has been soft-deleted");
    }

    if (userState.status !== "ACTIVE") {
      throw new UnauthorizedError(`User account is inactive or suspended: ${userState.status}`);
    }

    // Attach user information to request object
    req.user = {
      id: decoded.userId,
      email: userState.email,
      fullName: userState.fullName,
      roleId: decoded.roleId,
      roleName: decoded.roleName,
      departmentId: userState.departmentId,
    };

    next();
  } catch (err) {
    next(err);
  }
};

export const requirePermission = (permissionName: string) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Authentication required before permission verification");
      }

      const roleId = req.user.roleId;

      // Check cache for role permissions
      const cacheKey = `role:permissions:${roleId}`;
      let permissions = await cache.get<string[]>(cacheKey);

      if (!permissions) {
        const rolePermissions = await prisma.rolePermission.findMany({
          where: { roleId },
          include: { permission: true },
        });

        permissions = rolePermissions
          .map((rp) => rp.permission.name)
          .filter(Boolean);

        // Cache role permissions for 300 seconds
        await cache.set(cacheKey, permissions, 300);
      }

      // Admins bypass all permission checks
      if (req.user.roleName === "Admin" || permissions.includes(permissionName)) {
        next();
        return;
      }

      throw new ForbiddenError(`Insufficient permissions: missing ${permissionName}`);
    } catch (err) {
      next(err);
    }
  };
};
