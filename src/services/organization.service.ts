import prisma from "../config/database";
import logger from "../utils/logger";

export class OrganizationService {
  private defaultOrgKeys = {
    "org.name": "AssetFlow Corporation",
    "org.taxId": "XX-XXXXXXX",
    "org.address": "123 Enterprise Way, Suite 500, Tech City",
    "org.phone": "+1-555-0199",
    "org.email": "contact@assetflow.com",
    "org.website": "https://assetflow.com",
    "org.currency": "USD",
  };

  async getOrganization(): Promise<any> {
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: { in: Object.keys(this.defaultOrgKeys) },
      },
    });

    const orgData: Record<string, string | null> = {};
    
    // Set default values first
    Object.entries(this.defaultOrgKeys).forEach(([k, v]) => {
      const dbSetting = settings.find((s) => s.key === k);
      const cleanKey = k.replace("org.", "");
      orgData[cleanKey] = dbSetting ? dbSetting.value : v;
    });

    return orgData;
  }

  async updateOrganization(data: any, actorId: string): Promise<any> {
    const updates = Object.entries(data).map(([key, val]) => {
      const dbKey = `org.${key}`;
      const valueStr = val ? String(val) : "";

      return prisma.systemSetting.upsert({
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
    await prisma.$transaction(updates);
    
    logger.info(`Organization profile updated by actor: id=${actorId}`);
    return this.getOrganization();
  }
}

export const organizationService = new OrganizationService();
