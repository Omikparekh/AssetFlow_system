import { Request, Response, NextFunction } from "express";
import { organizationService } from "../services/organization.service";
import { sendSuccess } from "../utils/response";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { logActivity } from "../utils/activity";

export class OrganizationController {
  async getOrganization(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const org = await organizationService.getOrganization();
      sendSuccess(res, "Organization profile fetched successfully", org);
    } catch (err) {
      next(err);
    }
  }

  async updateOrganization(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorId = req.user!.id;
      const beforeState = await organizationService.getOrganization();
      const org = await organizationService.updateOrganization(req.body, actorId);

      // Log Activity
      await logActivity({
        userId: actorId,
        role: req.user!.roleName,
        module: "ORGANIZATION",
        action: "UPDATE_ORG_PROFILE",
        entityName: "system_settings",
        entityId: "org-profile",
        beforeJson: beforeState,
        afterJson: org,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });

      sendSuccess(res, "Organization profile updated successfully", org);
    } catch (err) {
      next(err);
    }
  }
}

export const organizationController = new OrganizationController();
