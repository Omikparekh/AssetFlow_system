import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import logger from "../utils/logger";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  logger.error("DATABASE_URL environment variable is not defined!");
  process.exit(1);
}

// Initialize pg connection pool
const isLocal = connectionString.includes("localhost") || connectionString.includes("127.0.0.1");

const pool = new Pool({
  connectionString,
  max: 20, // Connection limit
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

pool.on("error", (err) => {
  logger.error(err, "Unexpected error on idle pg client pool");
});

// Setup Prisma driver adapter
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

logger.info("Database adapter-pg and Prisma Client initialized successfully.");

export default prisma;
export { pool };
