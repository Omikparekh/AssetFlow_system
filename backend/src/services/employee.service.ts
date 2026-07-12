import bcrypt from "bcrypt";
import { userRepository } from "../repositories/user.repository";
import { departmentRepository } from "../repositories/department.repository";
import prisma from "../config/database";
import { BadRequestError, ConflictError, NotFoundError } from "../errors/custom.error";
import { cache } from "../config/redis";
import logger from "../utils/logger";

export class EmployeeService {
  async getEmployee(id: string): Promise<any> {
    const employee = await userRepository.findById(id);
    if (!employee) {
      throw new NotFoundError("Employee not found");
    }
    return this.sanitizeUser(employee);
  }

  async listEmployees(filters: {
    status?: any;
    roleId?: string;
    departmentId?: string | null;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ employees: any[]; total: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await userRepository.list({
      status: filters.status,
      roleId: filters.roleId,
      departmentId: filters.departmentId,
      search: filters.search,
      skip,
      take: limit,
    });

    const sanitized = users.map((u) => this.sanitizeUser(u));
    return { employees: sanitized, total };
  }

  async createEmployee(data: any, actorId: string): Promise<any> {
    // 1. Email uniqueness
    const existingEmail = await userRepository.findByEmail(data.email);
    if (existingEmail) {
      throw new ConflictError("Email address is already in use");
    }

    // 2. Employee code uniqueness
    const existingCode = await userRepository.findByEmployeeCode(data.employeeCode);
    if (existingCode) {
      throw new ConflictError("Employee code is already in use");
    }

    // 3. Validate Role exists
    const role = await prisma.role.findUnique({ where: { id: data.roleId } });
    if (!role) {
      throw new NotFoundError("Role not found");
    }

    // 4. Validate Department exists if provided
    if (data.departmentId) {
      const dept = await departmentRepository.findById(data.departmentId);
      if (!dept) {
        throw new NotFoundError("Department not found");
      }
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const employee = await userRepository.create({
      email: data.email,
      passwordHash,
      fullName: data.fullName,
      employeeCode: data.employeeCode,
      phone: data.phone,
      profileImage: data.profileImage,
      status: data.status,
      roleId: data.roleId,
      departmentId: data.departmentId,
      createdBy: actorId,
    });

    logger.info(`Employee profile provisioned: id=${employee.id}, email=${employee.email}`);
    return this.sanitizeUser(employee);
  }

  async updateEmployee(id: string, data: any, actorId: string): Promise<any> {
    const employee = await userRepository.findById(id);
    if (!employee) {
      throw new NotFoundError("Employee not found");
    }

    // 1. Unique email check
    if (data.email && data.email !== employee.email) {
      const existingEmail = await userRepository.findByEmail(data.email);
      if (existingEmail) {
        throw new ConflictError("Email address is already in use");
      }
    }

    // 2. Unique code check
    if (data.employeeCode && data.employeeCode !== employee.employeeCode) {
      const existingCode = await userRepository.findByEmployeeCode(data.employeeCode);
      if (existingCode) {
        throw new ConflictError("Employee code is already in use");
      }
    }

    // 3. Role check
    if (data.roleId && data.roleId !== employee.roleId) {
      const role = await prisma.role.findUnique({ where: { id: data.roleId } });
      if (!role) {
        throw new NotFoundError("Role not found");
      }
    }

    // 4. Department check
    if (data.departmentId && data.departmentId !== employee.departmentId) {
      const dept = await departmentRepository.findById(data.departmentId);
      if (!dept) {
        throw new NotFoundError("Department not found");
      }
    }

    const updated = await userRepository.update(id, {
      email: data.email,
      fullName: data.fullName,
      employeeCode: data.employeeCode,
      phone: data.phone,
      profileImage: data.profileImage,
      status: data.status,
      roleId: data.roleId,
      departmentId: data.departmentId,
      updatedBy: actorId,
    });

    // Invalidate cached user status and session permissions immediately
    await cache.del(`user:status:${id}`);
    await cache.del(`role:permissions:${employee.roleId}`);
    if (data.roleId) {
      await cache.del(`role:permissions:${data.roleId}`);
    }

    logger.info(`Employee profile updated: id=${id} by actor=${actorId}`);
    return this.sanitizeUser(updated);
  }

  async deleteEmployee(id: string, actorId: string): Promise<void> {
    const employee = await userRepository.findById(id);
    if (!employee) {
      throw new NotFoundError("Employee not found");
    }

    // Check if the user has active allocations/maintenance/bookings
    const hasAssignments = await userRepository.hasActiveAssignments(id);
    if (hasAssignments) {
      throw new BadRequestError(
        "Cannot delete employee profile: user currently has active asset allocations, open maintenance tickets, or active bookings."
      );
    }

    await userRepository.softDelete(id, actorId);

    // Invalidate caches
    await cache.del(`user:status:${id}`);

    logger.info(`Employee soft-deleted: id=${id} by actor=${actorId}`);
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}

export const employeeService = new EmployeeService();
