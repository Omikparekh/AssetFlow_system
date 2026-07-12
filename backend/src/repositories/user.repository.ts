import prisma from "../config/database";
import { User, Prisma } from "@prisma/client";

export class UserRepository {
  async findById(id: string): Promise<
    (User & { role: { name: string }; department: { name: string } | null }) | null
  > {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: {
        role: { select: { name: true } },
        department: { select: { name: true } },
      },
    }) as any;
  }

  async findByEmail(email: string): Promise<
    (User & { role: { name: string } }) | null
  > {
    return prisma.user.findFirst({
      where: { email, deletedAt: null },
      include: {
        role: { select: { name: true } },
      },
    }) as any;
  }

  async findByEmployeeCode(employeeCode: string): Promise<
    (User & { role: { name: string } }) | null
  > {
    return prisma.user.findFirst({
      where: { employeeCode, deletedAt: null },
      include: {
        role: { select: { name: true } },
      },
    }) as any;
  }

  async create(data: Prisma.UserUncheckedCreateInput): Promise<User & { role: { name: string } }> {
    return prisma.user.create({
      data,
      include: {
        role: { select: { name: true } },
      },
    }) as any;
  }

  async update(id: string, data: Prisma.UserUncheckedUpdateInput): Promise<User & { role: { name: string } }> {
    return prisma.user.update({
      where: { id },
      data,
      include: {
        role: { select: { name: true } },
      },
    }) as any;
  }

  async softDelete(id: string, actorId: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: actorId,
      },
    });
  }

  async list(params: {
    status?: any;
    roleId?: string;
    departmentId?: string | null;
    search?: string;
    skip?: number;
    take?: number;
  }): Promise<[any[], number]> {
    const whereClause: Prisma.UserWhereInput = {
      deletedAt: null,
    };

    if (params.status) {
      whereClause.status = params.status;
    }

    if (params.roleId) {
      whereClause.roleId = params.roleId;
    }

    if (params.departmentId !== undefined) {
      whereClause.departmentId = params.departmentId;
    }

    if (params.search) {
      whereClause.OR = [
        { fullName: { contains: params.search, mode: "insensitive" } },
        { email: { contains: params.search, mode: "insensitive" } },
        { employeeCode: { contains: params.search, mode: "insensitive" } },
      ];
    }

    const [records, total] = await prisma.$transaction([
      prisma.user.findMany({
        where: whereClause,
        include: {
          role: { select: { id: true, name: true } },
          department: { select: { id: true, name: true } },
        },
        skip: params.skip,
        take: params.take,
        orderBy: { fullName: "asc" },
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    return [records, total];
  }

  async hasActiveAssignments(userId: string): Promise<boolean> {
    // Check active allocations
    const allocationCount = await prisma.assetAllocation.count({
      where: { employeeId: userId, status: "ACTIVE" },
    });
    if (allocationCount > 0) return true;

    // Check open maintenance requests assigned
    const maintenanceCount = await prisma.maintenanceRequest.count({
      where: { requestedById: userId, NOT: { status: "RESOLVED" } },
    });
    if (maintenanceCount > 0) return true;

    // Check pending bookings
    const bookingCount = await prisma.booking.count({
      where: { bookedById: userId, status: { in: ["UPCOMING", "ONGOING"] } },
    });
    if (bookingCount > 0) return true;

    return false;
  }
}

export const userRepository = new UserRepository();
