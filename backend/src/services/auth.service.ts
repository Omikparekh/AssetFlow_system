import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { userRepository } from "../repositories/user.repository";
import { tokenRepository } from "../repositories/token.repository";
import prisma from "../config/database";
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
} from "../errors/custom.error";
import { AuthResponseDto, UserResponseDto, RefreshTokenResponseDto } from "../dto/auth.dto";
import { cache } from "../config/redis";
import { mailer } from "../mail/mailer";
import logger from "../utils/logger";
import { User } from "@prisma/client";

const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || "15m";
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || "7d";
const JWT_REFRESH_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export class AuthService {
  private generateAccessToken(user: { id: string; roleId: string; roleName: string }): string {
    const secret = process.env.JWT_SECRET || "super-secret-key-change-in-production";
    return jwt.sign(
      {
        userId: user.id,
        roleId: user.roleId,
        roleName: user.roleName,
      },
      secret,
      { expiresIn: JWT_ACCESS_EXPIRY as any }
    );
  }

  private generateRefreshToken(user: { id: string; roleId: string; roleName: string }): string {
    const secret = process.env.JWT_REFRESH_SECRET || "super-secret-refresh-key-change-in-production";
    return jwt.sign(
      {
        userId: user.id,
        roleId: user.roleId,
        roleName: user.roleName,
      },
      secret,
      { expiresIn: JWT_REFRESH_EXPIRY as any }
    );
  }

  private toUserResponseDto(user: any): UserResponseDto {
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

  async register(data: any): Promise<UserResponseDto> {
    // Check for existing email
    const existingEmail = await userRepository.findByEmail(data.email);
    if (existingEmail) {
      throw new ConflictError("Email address is already in use");
    }

    // Check for existing employee code
    const existingCode = await userRepository.findByEmployeeCode(data.employeeCode);
    if (existingCode) {
      throw new ConflictError("Employee code is already in use");
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    // Resolve Role ID
    let roleId = data.roleId;
    if (!roleId) {
      const targetRoleName = data.roleName || "Employee";
      const dbRole = await prisma.role.findFirst({
        where: { name: { equals: targetRoleName, mode: "insensitive" } },
      });
      if (!dbRole) {
        throw new NotFoundError(`Role "${targetRoleName}" not found. Please seed the database first.`);
      }
      roleId = dbRole.id;
    }

    // Write to database
    const user = await userRepository.create({
      email: data.email,
      passwordHash,
      fullName: data.fullName,
      employeeCode: data.employeeCode,
      phone: data.phone,
      profileImage: data.profileImage,
      roleId,
      departmentId: data.departmentId,
    });

    logger.info(`New user registered: id=${user.id}, email=${user.email}, role=${user.role.name}`);

    return this.toUserResponseDto(user);
  }

  async login(
    credentials: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthResponseDto> {
    const user = await userRepository.findByEmail(credentials.email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Verify account status
    if (user.status !== "ACTIVE") {
      throw new UnauthorizedError(`Account is inactive or suspended: status=${user.status}`);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Update last login timestamp
    await userRepository.update(user.id, { lastLogin: new Date() });

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
    await tokenRepository.create(user.id, refreshToken, expiresAt);

    // Log Activity
    logger.info(`User logged in: id=${user.id}, email=${user.email}`);

    // Create activity logs (handled asynchronously by controllers)
    return {
      accessToken,
      refreshToken,
      user: this.toUserResponseDto(user),
    };
  }

  async refresh(oldRefreshToken: string): Promise<RefreshTokenResponseDto> {
    const jwtRefreshSecret =
      process.env.JWT_REFRESH_SECRET || "super-secret-refresh-key-change-in-production";

    // Verify JWT integrity
    let decoded: any;
    try {
      decoded = jwt.verify(oldRefreshToken, jwtRefreshSecret);
    } catch (err) {
      throw new UnauthorizedError("Invalid or expired refresh token signature");
    }

    // Check if token exists in database and is active
    const activeTokenRecord = await tokenRepository.findActive(oldRefreshToken);
    if (!activeTokenRecord) {
      // Security: if an expired/invalid token is reused, revoke all tokens for safety (token abuse protection)
      await tokenRepository.revokeAllForUser(decoded.userId);
      throw new UnauthorizedError("Refresh token has been revoked or reused. All sessions terminated.");
    }

    // Retrieve user
    const user = await userRepository.findById(decoded.userId);
    if (!user || user.status !== "ACTIVE") {
      throw new UnauthorizedError("User is no longer active");
    }

    // Perform Refresh Token Rotation (RTR)
    await tokenRepository.revoke(oldRefreshToken);

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
    
    await tokenRepository.create(user.id, newRefreshToken, expiresAt);

    logger.debug(`Token rotated for user: id=${user.id}`);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await tokenRepository.revoke(refreshToken);
    logger.info("Refresh token revoked. User logged out.");
  }

  async changePassword(userId: string, data: any): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const isPasswordValid = await bcrypt.compare(data.oldPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new BadRequestError("Invalid old password");
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(data.newPassword, salt);

    await userRepository.update(userId, { passwordHash: newPasswordHash });

    logger.info(`Password changed successfully for user: id=${userId}`);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Avoid revealing user existence in forgot password flow for security
      logger.info(`Forgot password request for non-existent email: ${email}`);
      return;
    }

    // Generate UUID token
    const resetToken = crypto.randomUUID();

    // Cache the reset token for 15 minutes (900 seconds)
    const cacheKey = `password-reset:${resetToken}`;
    await cache.set(cacheKey, user.id, 900);

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    await mailer.sendMail({
      to: user.email,
      subject: "AssetFlow Password Reset",
      text: `Hello ${user.fullName},\n\nYou requested a password reset for your AssetFlow account. Click the link below to reset your password within 15 minutes:\n\n${resetLink}\n\nIf you did not request this, please ignore this email.`,
      html: `<p>Hello ${user.fullName},</p><p>You requested a password reset for your AssetFlow account. Click the link below to reset your password within 15 minutes:</p><p><a href="${resetLink}">${resetLink}</a></p><p>If you did not request this, please ignore this email.</p>`,
    });

    logger.info(`Password reset token sent to: ${email}`);
  }

  async resetPassword(resetToken: string, data: any): Promise<void> {
    const cacheKey = `password-reset:${resetToken}`;
    const userId = await cache.get<string>(cacheKey);

    if (!userId) {
      throw new BadRequestError("Invalid or expired reset token");
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(data.newPassword, salt);

    await userRepository.update(userId, { passwordHash: newPasswordHash });

    // Revoke reset token from cache
    await cache.del(cacheKey);

    // Revoke all active refresh tokens to force re-login on all devices
    await tokenRepository.revokeAllForUser(userId);

    logger.info(`Password successfully reset for user: id=${userId}`);
  }
}

export const authService = new AuthService();
