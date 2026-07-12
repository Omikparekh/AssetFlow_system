"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const database_1 = __importDefault(require("./config/database"));
const logger_1 = __importDefault(require("./utils/logger"));
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        // Verify database connectivity
        await database_1.default.$queryRaw `SELECT 1`;
        logger_1.default.info("Database connection handshake verified successfully.");
        const server = app_1.default.listen(PORT, () => {
            logger_1.default.info(`AssetFlow Backend Server is running on port ${PORT}`);
            logger_1.default.info(`Environment: ${process.env.NODE_ENV || "development"}`);
        });
        // Graceful Shutdown Handler
        const shutdown = async (signal) => {
            logger_1.default.info(`Received ${signal}. Gracefully terminating server process...`);
            server.close(async () => {
                logger_1.default.info("HTTP Server closed.");
                await database_1.default.$disconnect();
                logger_1.default.info("Database connection disconnected. Exiting process.");
                process.exit(0);
            });
        };
        process.on("SIGTERM", () => shutdown("SIGTERM"));
        process.on("SIGINT", () => shutdown("SIGINT"));
    }
    catch (err) {
        logger_1.default.error(err, "Failed to initialize server process");
        process.exit(1);
    }
};
startServer();
