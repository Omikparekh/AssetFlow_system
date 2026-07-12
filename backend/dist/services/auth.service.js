"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const user_repository_1 = require("../repositories/user.repository");
const token_repository_1 = require("../repositories/token.repository");
const database_1 = __importDefault(require("../config/database"));
const custom_error_1 = require("../errors/custom.error");
const redis_1 = require("../config/redis");
const mailer_1 = require("../mail/mailer");
const logger_1 = __importDefault(require("../utils/logger"));
const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || "15m";
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || "7d";
const JWT_REFRESH_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
class AuthService {
    generateAccessToken(user) {
        const secret = process.env.JWT_SECRET || "super-secret-key-change-in-production";
        return jsonwebtoken_1.default.sign({
            userId: user.id,
            roleId: user.roleId,
            roleName: user.roleName,
        }, secret, { expiresIn: JWT_ACCESS_EXPIRY });
    }
    generateRefreshToken(user) {
        const secret = process.env.JWT_REFRESH_SECRET || "super-secret-refresh-key-change-in-production";
        return jsonwebtoken_1.default.sign({
            userId: user.id,
            roleId: user.roleId,
            roleName: user.roleName,
        }, secret, { expiresIn: JWT_REFRESH_EXPIRY });
    }
    toUserResponseDto(user) {
        return {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            employeeCode: user.employeeCode,
            phone: user.phone,
            profileImage: user.profileImage,
            status: user.status,
            mfaReady: user.mfaReady,
            roleId: user.roleId,
            roleName: user.role.name,
            departmentId: user.departmentId,
            createdAt: user.createdAt,
        };
    }
    async register(data) {
        // Check for existing email
        const existingEmail = await user_repository_1.userRepository.findByEmail(data.email);
        if (existingEmail) {
            throw new custom_error_1.ConflictError("Email address is already in use");
        }
        // Check for existing employee code
        const existingCode = await user_repository_1.userRepository.findByEmployeeCode(data.employeeCode);
        if (existingCode) {
            throw new custom_error_1.ConflictError("Employee code is already in use");
        }
        // Hash the password
        const salt = await bcrypt_1.default.genSalt(10);
        const passwordHash = await bcrypt_1.default.hash(data.password, salt);
        // Resolve Role ID
        let roleId = data.roleId;
        if (!roleId) {
            const targetRoleName = data.roleName || "Employee";
            const dbRole = await database_1.default.role.findFirst({
                where: { name: { equals: targetRoleName, mode: "insensitive" } },
            });
            if (!dbRole) {
                throw new custom_error_1.NotFoundError(`Role "${targetRoleName}" not found. Please seed the database first.`);
            }
            roleId = dbRole.id;
        }
        // Write to database
        const user = await user_repository_1.userRepository.create({
            email: data.email,
            passwordHash,
            fullName: data.fullName,
            employeeCode: data.employeeCode,
            phone: data.phone,
            profileImage: data.profileImage,
            roleId,
            departmentId: data.departmentId,
        });
        logger_1.default.info(`New user registered: id=${user.id}, email=${user.email}, role=${user.role.name}`);
        return this.toUserResponseDto(user);
    }
    async login(credentials, ipAddress, userAgent) {
        const user = await user_repository_1.userRepository.findByEmail(credentials.email);
        if (!user) {
            throw new custom_error_1.UnauthorizedError("Invalid email or password");
        }
        // Verify account status
        if (user.status !== "ACTIVE") {
            throw new custom_error_1.UnauthorizedError(`Account is inactive or suspended: status=${user.status}`);
        }
        // Verify password
        const isPasswordValid = await bcrypt_1.default.compare(credentials.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new custom_error_1.UnauthorizedError("Invalid email or password");
        }
        // Update last login timestamp
        await user_repository_1.userRepository.update(user.id, { lastLogin: new Date() });
        // Generate tokens
        const accessToken = this.generateAccessToken({
            id: user.id,
            roleId: user.roleId,
            roleName: user.role.name,
        });
        const refreshToken = this.generateRefreshToken({
            id: user.id,
            roleId: user.roleId,
            roleName: user.role.name,
        });
        // Save refresh token to database
        const expiresAt = new Date(Date.now() + JWT_REFRESH_EXPIRY_MS);
        await token_repository_1.tokenRepository.create(user.id, refreshToken, expiresAt);
        // Log Activity
        logger_1.default.info(`User logged in: id=${user.id}, email=${user.email}`);
        // Create activity logs (handled asynchronously by controllers)
        return {
            accessToken,
            refreshToken,
            user: this.toUserResponseDto(user),
        };
    }
    async refresh(oldRefreshToken) {
        const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || "super-secret-refresh-key-change-in-production";
        // Verify JWT integrity
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(oldRefreshToken, jwtRefreshSecret);
        }
        catch (err) {
            throw new custom_error_1.UnauthorizedError("Invalid or expired refresh token signature");
        }
        // Check if token exists in database and is active
        const activeTokenRecord = await token_repository_1.tokenRepository.findActive(oldRefreshToken);
        if (!activeTokenRecord) {
            // Security: if an expired/invalid token is reused, revoke all tokens for safety (token abuse protection)
            await token_repository_1.tokenRepository.revokeAllForUser(decoded.userId);
            throw new custom_error_1.UnauthorizedError("Refresh token has been revoked or reused. All sessions terminated.");
        }
        // Retrieve user
        const user = await user_repository_1.userRepository.findById(decoded.userId);
        if (!user || user.status !== "ACTIVE") {
            throw new custom_error_1.UnauthorizedError("User is no longer active");
        }
        // Perform Refresh Token Rotation (RTR)
        await token_repository_1.tokenRepository.revoke(oldRefreshToken);
        const accessToken = this.generateAccessToken({
            id: user.id,
            roleId: user.roleId,
            roleName: user.role.name,
        });
        const newRefreshToken = this.generateRefreshToken({
            id: user.id,
            roleId: user.roleId,
            roleName: user.role.name,
        });
        const expiresAt = new Date(Date.now() + JWT_REFRESH_EXPIRY_MS);
        await token_repository_1.tokenRepository.create(user.id, newRefreshToken, expiresAt);
        logger_1.default.debug(`Token rotated for user: id=${user.id}`);
        return {
            accessToken,
            refreshToken: newRefreshToken,
        };
    }
    async logout(refreshToken) {
        await token_repository_1.tokenRepository.revoke(refreshToken);
        logger_1.default.info("Refresh token revoked. User logged out.");
    }
    async changePassword(userId, data) {
        const user = await user_repository_1.userRepository.findById(userId);
        if (!user) {
            throw new custom_error_1.NotFoundError("User not found");
        }
        const isPasswordValid = await bcrypt_1.default.compare(data.oldPassword, user.passwordHash);
        if (!isPasswordValid) {
            throw new custom_error_1.BadRequestError("Invalid old password");
        }
        const salt = await bcrypt_1.default.genSalt(10);
        const newPasswordHash = await bcrypt_1.default.hash(data.newPassword, salt);
        await user_repository_1.userRepository.update(userId, { passwordHash: newPasswordHash });
        logger_1.default.info(`Password changed successfully for user: id=${userId}`);
    }
    async forgotPassword(email) {
        const user = await user_repository_1.userRepository.findByEmail(email);
        if (!user) {
            // Avoid revealing user existence in forgot password flow for security
            logger_1.default.info(`Forgot password request for non-existent email: ${email}`);
            return;
        }
        // Generate UUID token
        const resetToken = crypto_1.default.randomUUID();
        // Cache the reset token for 15 minutes (900 seconds)
        const cacheKey = `password-reset:${resetToken}`;
        await redis_1.cache.set(cacheKey, user.id, 900);
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
        await mailer_1.mailer.sendMail({
            to: user.email,
            subject: "AssetFlow Password Reset",
            text: `Hello ${user.fullName},\n\nYou requested a password reset for your AssetFlow account. Click the link below to reset your password within 15 minutes:\n\n${resetLink}\n\nIf you did not request this, please ignore this email.`,
            html: `<p>Hello ${user.fullName},</p><p>You requested a password reset for your AssetFlow account. Click the link below to reset your password within 15 minutes:</p><p><a href="${resetLink}">${resetLink}</a></p><p>If you did not request this, please ignore this email.</p>`,
        });
        logger_1.default.info(`Password reset token sent to: ${email}`);
    }
    async resetPassword(resetToken, data) {
        const cacheKey = `password-reset:${resetToken}`;
        const userId = await redis_1.cache.get(cacheKey);
        if (!userId) {
            throw new custom_error_1.BadRequestError("Invalid or expired reset token");
        }
        const user = await user_repository_1.userRepository.findById(userId);
        if (!user) {
            throw new custom_error_1.NotFoundError("User not found");
        }
        const salt = await bcrypt_1.default.genSalt(10);
        const newPasswordHash = await bcrypt_1.default.hash(data.newPassword, salt);
        await user_repository_1.userRepository.update(userId, { passwordHash: newPasswordHash });
        // Revoke reset token from cache
        await redis_1.cache.del(cacheKey);
        // Revoke all active refresh tokens to force re-login on all devices
        await token_repository_1.tokenRepository.revokeAllForUser(userId);
        logger_1.default.info(`Password successfully reset for user: id=${userId}`);
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
