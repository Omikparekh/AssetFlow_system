"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.refreshTokenSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    fullName: zod_1.z.string().min(2, "Full name must be at least 2 characters"),
    employeeCode: zod_1.z.string().min(3, "Employee code must be at least 3 characters"),
    phone: zod_1.z.string().optional(),
    profileImage: zod_1.z.string().url("Invalid image URL").optional().nullable(),
    roleId: zod_1.z.string().uuid("Invalid Role ID").optional().nullable(), // In standard registration, we will force default role to 'Employee' inside the service layer, but allow specific roles for initial setup/admin promotion.
    roleName: zod_1.z.string().optional(),
    departmentId: zod_1.z.string().uuid("Invalid Department ID").optional().nullable(),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z.string().min(1, "Password is required"),
});
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, "Refresh token is required"),
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format"),
});
exports.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().uuid("Invalid reset token format"),
    newPassword: zod_1.z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
});
exports.changePasswordSchema = zod_1.z.object({
    oldPassword: zod_1.z.string().min(1, "Old password is required"),
    newPassword: zod_1.z
        .string()
        .min(8, "New password must be at least 8 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
});
