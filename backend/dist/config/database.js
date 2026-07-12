"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const logger_1 = __importDefault(require("../utils/logger"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    logger_1.default.error("DATABASE_URL environment variable is not defined!");
    process.exit(1);
}
// Initialize pg connection pool
const isLocal = connectionString.includes("localhost") || connectionString.includes("127.0.0.1");
const pool = new pg_1.Pool({
    connectionString,
    max: 20, // Connection limit
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
    ssl: isLocal ? false : { rejectUnauthorized: false },
});
exports.pool = pool;
pool.on("error", (err) => {
    logger_1.default.error(err, "Unexpected error on idle pg client pool");
});
// Setup Prisma driver adapter
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
logger_1.default.info("Database adapter-pg and Prisma Client initialized successfully.");
exports.default = prisma;
