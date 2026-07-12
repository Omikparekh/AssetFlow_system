import { departmentRepository } from "../repositories/department.repository";
import { userRepository } from "../repositories/user.repository";
import { BadRequestError, ConflictError, NotFoundError } from "../errors/custom.error";
import logger from "../utils/logger";

export class DepartmentService {
  async getDepartment(id: string): Promise<any> {
    const dept = await departmentRepository.findById(id);
    if (!dept) {
      throw new NotFoundError("Department not found");
    }
    return dept;
  }

  async listDepartments(filters: {
    status?: any;
    parentId?: string | null;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ departments: any[]; total: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const [departments, total] = await departmentRepository.list({
      status: filters.status,
      parentId: filters.parentId,
      search: filters.search,
      skip,
      take: limit,
    });

    return { departments, total };
  }

  async createDepartment(data: any, actorId: string): Promise<any> {
    // 1. Validate department code uniqueness
    const existing = await departmentRepository.findByCode(data.departmentCode);
    if (existing) {
      throw new ConflictError(`Department code "${data.departmentCode}" is already in use`);
    }

    // 2. Validate Parent ID if provided
    if (data.parentId) {
      const parent = await departmentRepository.findById(data.parentId);
      if (!parent) {
        throw new NotFoundError("Parent department not found");
      }
    }

    // 3. Validate Head ID if provided
    if (data.headId) {
      const head = await userRepository.findById(data.headId);
      if (!head) {
        throw new NotFoundError("Assigned Department Head user not found");
      }
    }

    const dept = await departmentRepository.create({
      name: data.name,
      departmentCode: data.departmentCode,
      description: data.description,
      parentId: data.parentId,
      headId: data.headId,
      status: data.status,
      createdBy: actorId,
    });

    logger.info(`Department created: id=${dept.id}, code=${dept.departmentCode}`);
    return dept;
  }

  async updateDepartment(id: string, data: any, actorId: string): Promise<any> {
    const dept = await departmentRepository.findById(id);
    if (!dept) {
      throw new NotFoundError("Department not found");
    }

    // 1. Code uniqueness
    if (data.departmentCode && data.departmentCode !== dept.departmentCode) {
      const existing = await departmentRepository.findByCode(data.departmentCode);
      if (existing) {
        throw new ConflictError(`Department code "${data.departmentCode}" is already in use`);
      }
    }

    // 2. Hierarchy loop check
    if (data.parentId) {
      if (data.parentId === id) {
        throw new BadRequestError("A department cannot be its own parent");
      }
      
      const isCyclic = await this.wouldCreateCycle(id, data.parentId);
      if (isCyclic) {
        throw new BadRequestError("Cyclic department hierarchy is not allowed (parent cannot be a sub-department)");
      }
    }

    // 3. Head ID check
    if (data.headId && data.headId !== dept.headId) {
      const head = await userRepository.findById(data.headId);
      if (!head) {
        throw new NotFoundError("Assigned Department Head user not found");
      }
    }

    const updated = await departmentRepository.update(id, {
      name: data.name,
      departmentCode: data.departmentCode,
      description: data.description,
      parentId: data.parentId,
      headId: data.headId,
      status: data.status,
      updatedBy: actorId,
    });

    logger.info(`Department updated: id=${id}`);
    return updated;
  }

  async deleteDepartment(id: string, actorId: string): Promise<void> {
    const dept = await departmentRepository.findById(id);
    if (!dept) {
      throw new NotFoundError("Department not found");
    }

    // Check active dependencies
    const hasDeps = await departmentRepository.hasActiveDependencies(id);
    if (hasDeps) {
      throw new BadRequestError(
        "Cannot delete department: it has active employees, sub-departments, or active asset allocations."
      );
    }

    await departmentRepository.softDelete(id, actorId);
    logger.info(`Department soft-deleted: id=${id} by actor=${actorId}`);
  }

  private async wouldCreateCycle(deptId: string, parentId: string): Promise<boolean> {
    let currentParentId: string | null = parentId;
    while (currentParentId) {
      if (currentParentId === deptId) return true;
      const parent = await departmentRepository.findById(currentParentId);
      currentParentId = parent ? parent.parentId : null;
    }
    return false;
  }
}

export const departmentService = new DepartmentService();
