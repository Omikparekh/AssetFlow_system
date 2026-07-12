import { z } from "zod";
import { UserStatus } from "@prisma/client";

export const createEmployeeSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  employeeCode: z.string().min(3, "Employee code must be at least 3 characters"),
  phone: z.string().optional().nullable(),
  profileImage: z.string().url("Invalid image URL").optional().nullable(),
  status: z.nativeEnum(UserStatus).default(UserStatus.ACTIVE),
  roleId: z.string().uuid("Invalid Role ID format"),
  departmentId: z.string().uuid("Invalid Department ID format").optional().nullable(),
});

export const updateEmployeeSchema = z.object({
  email: z.string().email("Invalid email format").optional(),
  fullName: z.string().min(2, "Full name must be at least 2 characters").optional(),
  employeeCode: z.string().min(3, "Employee code must be at least 3 characters").optional(),
  phone: z.string().optional().nullable(),
  profileImage: z.string().url("Invalid image URL").optional().nullable(),
  status: z.nativeEnum(UserStatus).optional(),
  roleId: z.string().uuid("Invalid Role ID format").optional(),
  departmentId: z.string().uuid("Invalid Department ID format").optional().nullable(),
});
