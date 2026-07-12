"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationController = exports.OrganizationController = void 0;
const organization_service_1 = require("../services/organization.service");
const response_1 = require("../utils/response");
const activity_1 = require("../utils/activity");
class OrganizationController {
    async getOrganization(req, res, next) {
        try {
            const org = await organization_service_1.organizationService.getOrganization();
            (0, response_1.sendSuccess)(res, "Organization profile fetched successfully", org);
        }
        catch (err) {
            next(err);
        }
    }
    async updateOrganization(req, res, next) {
        try {
            const actorId = req.user.id;
            const beforeState = await organization_service_1.organizationService.getOrganization();
            const org = await organization_service_1.organizationService.updateOrganization(req.body, actorId);
            // Log Activity
            await (0, activity_1.logActivity)({
                userId: actorId,
                role: req.user.roleName,
                module: "ORGANIZATION",
                action: "UPDATE_ORG_PROFILE",
                entityName: "system_settings",
                entityId: "org-profile",
                beforeJson: beforeState,
                afterJson: org,
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
            });
            (0, response_1.sendSuccess)(res, "Organization profile updated successfully", org);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.OrganizationController = OrganizationController;
exports.organizationController = new OrganizationController();
