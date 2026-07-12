import app from "./app";
import prisma from "./config/database";
import logger from "./utils/logger";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Verify database connectivity
    await prisma.$queryRaw`SELECT 1`;
    logger.info("Database connection handshake verified successfully.");

    const server = app.listen(PORT, () => {
      logger.info(`AssetFlow Backend Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
    });

    // Graceful Shutdown Handler
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Gracefully terminating server process...`);
      server.close(async () => {
        logger.info("HTTP Server closed.");
        await prisma.$disconnect();
        logger.info("Database connection disconnected. Exiting process.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

  } catch (err) {
    logger.error(err, "Failed to initialize server process");
    process.exit(1);
  }
};

startServer();
