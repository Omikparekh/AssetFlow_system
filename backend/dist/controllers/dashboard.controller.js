"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardController = exports.DashboardController = void 0;
const database_1 = __importDefault(require("../config/database"));
const response_1 = require("../utils/response");
class DashboardController {
    async getOverviewStats(req, res, next) {
        try {
            const actorId = req.user.id;
            const roleName = req.user.roleName;
            if (roleName === "Employee") {
                // ==========================================
                // EMPLOYEE DASHBOARD STATS
                // ==========================================
                // 1. Fetch employee-specific counts
                const myAllocatedAssets = await database_1.default.assetAllocation.count({
                    where: { employeeId: actorId, status: "ACTIVE", deletedAt: null },
                });
                const myPendingReturns = await database_1.default.returnRequest.count({
                    where: { requestedById: actorId, status: "PENDING", deletedAt: null },
                });
                const myOpenRepairs = await database_1.default.maintenanceRequest.count({
                    where: {
                        requestedById: actorId,
                        status: { in: ["PENDING", "APPROVED", "IN_PROGRESS"] },
                        deletedAt: null,
                    },
                });
                const myAmountDue = await database_1.default.assetCharge.aggregate({
                    where: { employeeId: actorId, status: "PENDING" },
                    _sum: { amount: true },
                });
                // Pending audits
                const myPendingAudits = await database_1.default.auditItem.count({
                    where: {
                        condition: "MISSING",
                        auditCycle: { status: "ACTIVE" },
                        asset: {
                            allocations: {
                                some: { employeeId: actorId, status: "ACTIVE" }
                            }
                        }
                    }
                });
                // 2. Fetch employee asset status distribution
                const myAssets = await database_1.default.asset.findMany({
                    where: {
                        allocations: {
                            some: { employeeId: actorId, status: "ACTIVE" }
                        },
                        deletedAt: null,
                    }
                });
                const statusDistribution = [
                    { status: "ALLOCATED", count: myAssets.filter(a => a.currentStatus === "ALLOCATED").length },
                    { status: "UNDER_MAINTENANCE", count: myAssets.filter(a => a.currentStatus === "UNDER_MAINTENANCE").length },
                    { status: "AVAILABLE", count: 0 },
                    { status: "RETIRED", count: 0 }
                ];
                // 3. Fetch employee recent activity logs
                const activities = await database_1.default.activityLog.findMany({
                    where: { userId: actorId },
                    take: 5,
                    orderBy: { createdAt: "desc" },
                    include: {
                        user: { select: { fullName: true } }
                    }
                });
                const recentActivity = activities.map((act) => ({
                    id: act.id,
                    user: act.user.fullName,
                    role: act.role,
                    module: act.module,
                    action: act.action,
                    createdAt: act.createdAt,
                }));
                // 4. Fetch upcoming tasks
                const myUpcomingReturns = await database_1.default.assetAllocation.findMany({
                    where: {
                        employeeId: actorId,
                        status: "ACTIVE",
                        expectedReturn: {
                            gte: new Date(),
                            lte: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                        },
                        deletedAt: null,
                    },
                    include: {
                        asset: { include: { model: true, brand: true } }
                    },
                    take: 3,
                });
                const upcomingTasks = myUpcomingReturns.map((ret) => {
                    const diffDays = Math.ceil((new Date(ret.expectedReturn).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    const itemText = ret.asset.model?.name || ret.asset.brand?.name || "Generic Asset";
                    return {
                        id: `return-${ret.id}`,
                        type: "RETURN",
                        item: `${itemText} (${ret.asset.assetTag})`,
                        due: diffDays === 0 ? "Today" : diffDays === 1 ? "Tomorrow" : `In ${diffDays} days`,
                        status: "warning",
                    };
                });
                (0, response_1.sendSuccess)(res, "Employee stats fetched successfully", {
                    kpis: {
                        totalAssets: myAllocatedAssets,
                        activeEmployees: myPendingReturns,
                        pendingMaintenance: myOpenRepairs,
                        criticalAlerts: myPendingAudits,
                        amountDue: myAmountDue._sum.amount || 0,
                    },
                    statusDistribution,
                    recentActivity,
                    upcomingTasks,
                });
            }
            else {
                // ==========================================
                // ADMIN / OPERATIONAL DASHBOARD STATS
                // ==========================================
                const isDepartmentHead = roleName === "Department Head";
                const departmentId = req.user.departmentId;
                const assetScope = isDepartmentHead && departmentId ? { departmentId } : {};
                const departmentEmployeeIds = isDepartmentHead && departmentId
                    ? (await database_1.default.user.findMany({ where: { departmentId, deletedAt: null }, select: { id: true } })).map((user) => user.id)
                    : [];
                const chargeScope = isDepartmentHead ? { employeeId: { in: departmentEmployeeIds } } : {};
                // 1. Fetch counts
                const totalAssets = await database_1.default.asset.count({
                    where: { deletedAt: null, ...assetScope },
                });
                const activeEmployees = await database_1.default.user.count({
                    where: { status: "ACTIVE", deletedAt: null, ...(isDepartmentHead && departmentId ? { departmentId } : {}) },
                });
                const pendingMaintenance = await database_1.default.maintenanceRequest.count({
                    where: {
                        status: { in: ["PENDING", "APPROVED", "IN_PROGRESS"] },
                        deletedAt: null,
                        ...(isDepartmentHead && departmentId ? { asset: { departmentId } } : {}),
                    },
                });
                // Critical alerts
                const writtenOffCount = await database_1.default.asset.count({
                    where: { currentStatus: "RETIRED", deletedAt: null, ...assetScope },
                });
                const overdueCount = await database_1.default.assetAllocation.count({
                    where: {
                        status: "ACTIVE",
                        expectedReturn: { lt: new Date() },
                        deletedAt: null,
                        ...(isDepartmentHead && departmentId ? { asset: { departmentId } } : {}),
                    },
                });
                const criticalAlerts = writtenOffCount + overdueCount;
                const [collectedAmounts, outstandingAmounts] = await Promise.all([
                    database_1.default.assetCharge.aggregate({ where: { status: "PAID", ...chargeScope }, _sum: { amount: true } }),
                    database_1.default.assetCharge.aggregate({ where: { status: "PENDING", ...chargeScope }, _sum: { amount: true } }),
                ]);
                // 2. Fetch asset status distribution
                const statusGroups = await database_1.default.asset.groupBy({
                    by: ["currentStatus"],
                    where: { deletedAt: null, ...assetScope },
                    _count: {
                        currentStatus: true,
                    },
                });
                const statusDistribution = statusGroups.map((g) => ({
                    status: g.currentStatus,
                    count: g._count.currentStatus,
                }));
                // Ensure all standard categories exist
                const standardStatuses = ["AVAILABLE", "ALLOCATED", "UNDER_MAINTENANCE", "RETIRED"];
                for (const stat of standardStatuses) {
                    if (!statusDistribution.find((d) => d.status === stat)) {
                        statusDistribution.push({ status: stat, count: 0 });
                    }
                }
                // 3. Fetch recent activity logs
                const activities = await database_1.default.activityLog.findMany({
                    take: 8,
                    orderBy: { createdAt: "desc" },
                    include: {
                        user: {
                            select: {
                                fullName: true,
                                email: true,
                            },
                        },
                    },
                });
                const recentActivity = activities.map((act) => ({
                    id: act.id,
                    user: act.user.fullName,
                    role: act.role,
                    module: act.module,
                    action: act.action,
                    createdAt: act.createdAt,
                }));
                // 4. Fetch upcoming tasks
                const upcomingReturns = await database_1.default.assetAllocation.findMany({
                    where: {
                        status: "ACTIVE",
                        expectedReturn: {
                            gte: new Date(),
                            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                        },
                        deletedAt: null,
                        ...(isDepartmentHead && departmentId ? { asset: { departmentId } } : {}),
                    },
                    include: {
                        asset: {
                            include: { model: true, brand: true },
                        },
                    },
                    take: 3,
                });
                const pendingRepairs = await database_1.default.maintenanceRequest.findMany({
                    where: {
                        status: "PENDING",
                        deletedAt: null,
                        ...(isDepartmentHead && departmentId ? { asset: { departmentId } } : {}),
                    },
                    include: {
                        asset: {
                            include: { model: true, brand: true },
                        },
                    },
                    take: 3,
                });
                const upcomingTasks = [];
                upcomingReturns.forEach((ret) => {
                    const diffDays = Math.ceil((new Date(ret.expectedReturn).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    const itemText = ret.asset.model?.name || ret.asset.brand?.name || "Generic Asset";
                    upcomingTasks.push({
                        id: `return-${ret.id}`,
                        type: "RETURN",
                        item: `${itemText} (${ret.asset.assetTag})`,
                        due: diffDays === 0 ? "Today" : diffDays === 1 ? "Tomorrow" : `In ${diffDays} days`,
                        status: "warning",
                    });
                });
                pendingRepairs.forEach((rep) => {
                    const itemText = rep.asset.model?.name || rep.asset.brand?.name || "Generic Asset";
                    upcomingTasks.push({
                        id: `repair-${rep.id}`,
                        type: "MAINTENANCE",
                        item: `${itemText} (${rep.asset.assetTag})`,
                        due: "Pending Approval",
                        status: "outline",
                    });
                });
                if (upcomingTasks.length === 0) {
                    upcomingTasks.push({ id: "fallback-1", type: "AUDIT", item: "Quarterly Asset Verification", due: "Scheduled", status: "outline" });
                }
                // ==========================================
                // 5. FETCH LIVE LIFECYCLE LISTS FOR ADMIN
                // ==========================================
                // A. Given (Allocated Assets)
                const givenList = await database_1.default.asset.findMany({
                    where: { currentStatus: "ALLOCATED", deletedAt: null, ...assetScope },
                    include: {
                        model: true,
                        brand: true,
                        category: true,
                        allocations: {
                            where: { status: "ACTIVE" },
                            include: { employee: true, department: true }
                        }
                    },
                    take: 8,
                    orderBy: { createdAt: "desc" }
                });
                const givenAssets = givenList.map((a) => ({
                    id: a.id,
                    tag: a.assetTag,
                    name: a.model?.name || a.brand?.name || "Generic Asset",
                    category: a.category?.name || "-",
                    assignee: a.allocations[0]?.employee?.fullName || a.allocations[0]?.department?.name || "Unassigned",
                    allocatedAt: a.allocations[0]?.allocatedAt || null,
                }));
                // B. Not Equipped (Available Assets)
                const notEquippedList = await database_1.default.asset.findMany({
                    where: { currentStatus: "AVAILABLE", deletedAt: null, ...assetScope },
                    include: {
                        model: true,
                        brand: true,
                        category: true
                    },
                    take: 8,
                    orderBy: { createdAt: "desc" }
                });
                const notEquippedAssets = notEquippedList.map((a) => ({
                    id: a.id,
                    tag: a.assetTag,
                    name: a.model?.name || a.brand?.name || "Generic Asset",
                    category: a.category?.name || "-",
                    condition: a.condition,
                    location: a.location || "-",
                }));
                // C. In Repair (Under Maintenance)
                const inRepairList = await database_1.default.asset.findMany({
                    where: { currentStatus: "UNDER_MAINTENANCE", deletedAt: null, ...assetScope },
                    include: {
                        model: true,
                        brand: true,
                        category: true,
                        maintenance: {
                            where: { status: { in: ["PENDING", "APPROVED", "IN_PROGRESS"] } },
                            orderBy: { createdAt: "desc" }
                        }
                    },
                    take: 8,
                    orderBy: { createdAt: "desc" }
                });
                const inRepairAssets = inRepairList.map((a) => ({
                    id: a.id,
                    tag: a.assetTag,
                    name: a.model?.name || a.brand?.name || "Generic Asset",
                    category: a.category?.name || "-",
                    priority: a.maintenance[0]?.priority || "MEDIUM",
                    repairStatus: a.maintenance[0]?.status || "PENDING",
                }));
                // D. Returned (Recently returned asset allocations)
                const returnedList = await database_1.default.assetAllocation.findMany({
                    where: { status: "RETURNED", deletedAt: null, ...(isDepartmentHead && departmentId ? { asset: { departmentId } } : {}) },
                    include: {
                        asset: {
                            include: { model: true, brand: true, category: true }
                        },
                        employee: true,
                        department: true
                    },
                    take: 8,
                    orderBy: { actualReturn: "desc" }
                });
                const returnedAssets = returnedList.map((alloc) => ({
                    id: alloc.id,
                    tag: alloc.asset?.assetTag || "-",
                    name: alloc.asset?.model?.name || alloc.asset?.brand?.name || "Generic Asset",
                    category: alloc.asset?.category?.name || "-",
                    assignee: alloc.employee?.fullName || alloc.department?.name || "-",
                    returnedAt: alloc.actualReturn || null,
                    condition: alloc.returnCondition || "GOOD",
                }));
                (0, response_1.sendSuccess)(res, "Dashboard stats fetched successfully", {
                    kpis: {
                        totalAssets,
                        activeEmployees,
                        pendingMaintenance,
                        criticalAlerts,
                        amountCollected: collectedAmounts._sum.amount || 0,
                        amountOutstanding: outstandingAmounts._sum.amount || 0,
                    },
                    statusDistribution,
                    recentActivity,
                    upcomingTasks,
                    lifecycleLists: {
                        given: givenAssets,
                        notEquipped: notEquippedAssets,
                        inRepair: inRepairAssets,
                        returned: returnedAssets,
                    }
                });
            }
        }
        catch (err) {
            next(err);
        }
    }
}
exports.DashboardController = DashboardController;
exports.dashboardController = new DashboardController();
