"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePermission = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../config/database"));
const custom_error_1 = require("../errors/custom.error");
const redis_1 = require("../config/redis");
const authenticate = async (req, res, next) => {
    try {
        // 1. Check for Developer/Service API Key support
        const apiKeyHeader = req.headers["x-api-key"];
        const systemApiKey = process.env.API_KEY;
        if (systemApiKey && apiKeyHeader === systemApiKey) {
            const adminRole = await database_1.default.role.findFirst({ where: { name: "Admin" } });
            const systemUser = await database_1.default.user.findFirst({
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
            throw new custom_error_1.UnauthorizedError("Authentication token required");
        }
        const token = authHeader.split(" ")[1];
        const jwtSecret = process.env.JWT_SECRET || "super-secret-key-change-in-production";
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        // Check account status in DB (or cache)
        const cacheKey = `user:status:${decoded.userId}`;
        let userState = await redis_1.cache.get(cacheKey);
        if (!userState) {
            const user = await database_1.default.user.findUnique({
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
                throw new custom_error_1.UnauthorizedError("User account no longer exists");
            }
            userState = {
                status: user.status,
                deletedAt: user.deletedAt ? user.deletedAt.toISOString() : null,
                email: user.email,
                fullName: user.fullName,
                departmentId: user.departmentId,
            };
            // Cache user status for 60 seconds
            await redis_1.cache.set(cacheKey, userState, 60);
        }
        if (userState.deletedAt) {
            throw new custom_error_1.UnauthorizedError("User account has been soft-deleted");
        }
        if (userState.status !== "ACTIVE") {
            throw new custom_error_1.UnauthorizedError(`User account is inactive or suspended: ${userState.status}`);
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
    }
    catch (err) {
        next(err);
    }
};
exports.authenticate = authenticate;
const requirePermission = (permissionName) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                throw new custom_error_1.UnauthorizedError("Authentication required before permission verification");
            }
            const roleId = req.user.roleId;
            // Check cache for role permissions
            const cacheKey = `role:permissions:${roleId}`;
            let permissions = await redis_1.cache.get(cacheKey);
            if (!permissions) {
                const rolePermissions = await database_1.default.rolePermission.findMany({
                    where: { roleId },
                    include: { permission: true },
                });
                permissions = rolePermissions
                    .map((rp) => rp.permission.name)
                    .filter(Boolean);
                // Cache role permissions for 300 seconds
                await redis_1.cache.set(cacheKey, permissions, 300);
            }
            // Admins bypass all permission checks
            if (req.user.roleName === "Admin" || permissions.includes(permissionName)) {
                next();
                return;
            }
            throw new custom_error_1.ForbiddenError(`Insufficient permissions: missing ${permissionName}`);
        }
        catch (err) {
            next(err);
        }
    };
};
exports.requirePermission = requirePermission;
