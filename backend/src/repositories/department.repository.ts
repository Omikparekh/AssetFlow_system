import prisma from "../config/database";
import { Department, Prisma } from "@prisma/client";

export class DepartmentRepository {
  async findById(id: string): Promise<any | null> {
    return prisma.department.findFirst({
      where: { id, deletedAt: null },
      include: {
        parent: { select: { id: true, name: true, departmentCode: true } },
        head: { select: { id: true, fullName: true, email: true, employeeCode: true } },
        subDepartments: { where: { deletedAt: null }, select: { id: true, name: true, departmentCode: true } },
      },
    });
  }

  async findByCode(departmentCode: string): Promise<Department | null> {
    return prisma.department.findFirst({
      where: { departmentCode, deletedAt: null },
    });
  }

  async list(params: {
    status?: any;
    parentId?: string | null;
    search?: string;
    skip?: number;
    take?: number;
  }): Promise<[Department[], number]> {
    const whereClause: Prisma.DepartmentWhereInput = {
      deletedAt: null,
    };

    if (params.status) {
      whereClause.status = params.status;
    }

    if (params.parentId !== undefined) {
      whereClause.parentId = params.parentId;
    }

    if (params.search) {
      whereClause.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { departmentCode: { contains: params.search, mode: "insensitive" } },
      ];
    }

    const [records, total] = await prisma.$transaction([
      prisma.department.findMany({
        where: whereClause,
        include: {
          parent: { select: { id: true, name: true } },
          head: { select: { id: true, fullName: true } },
        },
        skip: params.skip,
        take: params.take,
        orderBy: { name: "asc" },
      }),
      prisma.department.count({ where: whereClause }),
    ]);

    return [records as any, total];
  }

  async create(data: Prisma.DepartmentUncheckedCreateInput): Promise<Department> {
    return prisma.department.create({
      data,
    });
  }

  async update(id: string, data: Prisma.DepartmentUncheckedUpdateInput): Promise<Department> {
    return prisma.department.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string, actorId: string): Promise<Department> {
    return prisma.department.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: actorId,
      },
    });
  }

  async hasActiveDependencies(id: string): Promise<boolean> {
    // Check if department has active users
    const userCount = await prisma.user.count({
      where: { departmentId: id, deletedAt: null },
    });
    if (userCount > 0) return true;

    // Check if department has sub-departments
    const subDeptCount = await prisma.department.count({
      where: { parentId: id, deletedAt: null },
    });
    if (subDeptCount > 0) return true;

    // Check if department has active asset allocations
    const allocationCount = await prisma.assetAllocation.count({
      where: { departmentId: id, status: "ACTIVE" },
    });
    if (allocationCount > 0) return true;

    return false;
  }
}

export const departmentRepository = new DepartmentRepository();
