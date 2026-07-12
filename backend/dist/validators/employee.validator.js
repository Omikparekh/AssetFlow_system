"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEmployeeSchema = exports.createEmployeeSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createEmployeeSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    fullName: zod_1.z.string().min(2, "Full name must be at least 2 characters"),
    employeeCode: zod_1.z.string().min(3, "Employee code must be at least 3 characters"),
    phone: zod_1.z.string().optional().nullable(),
    profileImage: zod_1.z.string().url("Invalid image URL").optional().nullable(),
    status: zod_1.z.nativeEnum(client_1.UserStatus).default(client_1.UserStatus.ACTIVE),
    roleId: zod_1.z.string().uuid("Invalid Role ID format"),
    departmentId: zod_1.z.string().uuid("Invalid Department ID format").optional().nullable(),
});
exports.updateEmployeeSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format").optional(),
    fullName: zod_1.z.string().min(2, "Full name must be at least 2 characters").optional(),
    employeeCode: zod_1.z.string().min(3, "Employee code must be at least 3 characters").optional(),
    phone: zod_1.z.string().optional().nullable(),
    profileImage: zod_1.z.string().url("Invalid image URL").optional().nullable(),
    status: zod_1.z.nativeEnum(client_1.UserStatus).optional(),
    roleId: zod_1.z.string().uuid("Invalid Role ID format").optional(),
    departmentId: zod_1.z.string().uuid("Invalid Department ID format").optional().nullable(),
});
