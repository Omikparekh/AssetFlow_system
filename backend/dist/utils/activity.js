"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logActivity = void 0;
const database_1 = __importDefault(require("../config/database"));
const logger_1 = __importDefault(require("./logger"));
const logActivity = async (params) => {
    try {
        await database_1.default.activityLog.create({
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
    }
    catch (err) {
        // Log the error but do not throw or crash the main request lifecycle
        logger_1.default.error(err, "Failed to write activity log entry");
    }
};
exports.logActivity = logActivity;
