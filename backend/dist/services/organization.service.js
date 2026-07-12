"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationService = exports.OrganizationService = void 0;
const database_1 = __importDefault(require("../config/database"));
const logger_1 = __importDefault(require("../utils/logger"));
class OrganizationService {
    defaultOrgKeys = {
        "org.name": "AssetFlow Corporation",
        "org.taxId": "XX-XXXXXXX",
        "org.address": "123 Enterprise Way, Suite 500, Tech City",
        "org.phone": "+1-555-0199",
        "org.email": "contact@assetflow.com",
        "org.website": "https://assetflow.com",
        "org.currency": "USD",
    };
    async getOrganization() {
        const settings = await database_1.default.systemSetting.findMany({
            where: {
                key: { in: Object.keys(this.defaultOrgKeys) },
            },
        });
        const orgData = {};
        // Set default values first
        Object.entries(this.defaultOrgKeys).forEach(([k, v]) => {
            const dbSetting = settings.find((s) => s.key === k);
            const cleanKey = k.replace("org.", "");
            orgData[cleanKey] = dbSetting ? dbSetting.value : v;
        });
        return orgData;
    }
    async updateOrganization(data, actorId) {
        const updates = Object.entries(data).map(([key, val]) => {
            const dbKey = `org.${key}`;
            const valueStr = val ? String(val) : "";
            return database_1.default.systemSetting.upsert({
                where: { key: dbKey },
                update: {
                    value: valueStr,
                    updatedById: actorId,
                },
                create: {
                    key: dbKey,
                    value: valueStr,
                    description: `Organization profile metadata: ${key}`,
                    updatedById: actorId,
                },
            });
        });
        // Execute in transaction
        await database_1.default.$transaction(updates);
        logger_1.default.info(`Organization profile updated by actor: id=${actorId}`);
        return this.getOrganization();
    }
}
exports.OrganizationService = OrganizationService;
exports.organizationService = new OrganizationService();
