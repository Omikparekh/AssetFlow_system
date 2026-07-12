"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDepartmentSchema = exports.createDepartmentSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createDepartmentSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Department name must be at least 2 characters"),
    departmentCode: zod_1.z.string().min(2, "Department code must be at least 2 characters"),
    description: zod_1.z.string().optional().nullable(),
    parentId: zod_1.z.string().uuid("Invalid Parent ID format").optional().nullable(),
    headId: zod_1.z.string().uuid("Invalid Head ID format").optional().nullable(),
    status: zod_1.z.nativeEnum(client_1.UserStatus).default(client_1.UserStatus.ACTIVE),
});
exports.updateDepartmentSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Department name must be at least 2 characters").optional(),
    departmentCode: zod_1.z.string().min(2, "Department code must be at least 2 characters").optional(),
    description: zod_1.z.string().optional().nullable(),
    parentId: zod_1.z.string().uuid("Invalid Parent ID format").optional().nullable(),
    headId: zod_1.z.string().uuid("Invalid Head ID format").optional().nullable(),
    status: zod_1.z.nativeEnum(client_1.UserStatus).optional(),
});
