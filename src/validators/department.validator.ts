import { z } from "zod";
import { UserStatus } from "@prisma/client";

export const createDepartmentSchema = z.object({
  name: z.string().min(2, "Department name must be at least 2 characters"),
  departmentCode: z.string().min(2, "Department code must be at least 2 characters"),
  description: z.string().optional().nullable(),
  parentId: z.string().uuid("Invalid Parent ID format").optional().nullable(),
  headId: z.string().uuid("Invalid Head ID format").optional().nullable(),
  status: z.nativeEnum(UserStatus).default(UserStatus.ACTIVE),
});

export const updateDepartmentSchema = z.object({
  name: z.string().min(2, "Department name must be at least 2 characters").optional(),
  departmentCode: z.string().min(2, "Department code must be at least 2 characters").optional(),
  description: z.string().optional().nullable(),
  parentId: z.string().uuid("Invalid Parent ID format").optional().nullable(),
  headId: z.string().uuid("Invalid Head ID format").optional().nullable(),
  status: z.nativeEnum(UserStatus).optional(),
});
