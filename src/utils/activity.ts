import prisma from "../config/database";
import logger from "./logger";

interface ActivityLogParams {
  userId: string;
  role: string;
  module: string;
  action: string;
  entityName: string;
  entityId: string;
  beforeJson?: any;
  afterJson?: any;
  ipAddress?: string;
  userAgent?: string;
}

export const logActivity = async (params: ActivityLogParams): Promise<void> => {
  try {
    await prisma.activityLog.create({
      data: {
        userId: params.userId,
        role: params.role,
        module: params.module,
        action: params.action,
        entityName: params.entityName,
        entityId: params.entityId,
        beforeJson: params.beforeJson ? JSON.parse(JSON.stringify(params.beforeJson)) : undefined,
        afterJson: params.afterJson ? JSON.parse(JSON.stringify(params.afterJson)) : undefined,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  } catch (err) {
    // Log the error but do not throw or crash the main request lifecycle
    logger.error(err, "Failed to write activity log entry");
  }
};
