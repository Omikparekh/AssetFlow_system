"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cache = void 0;
const redis_1 = require("redis");
const logger_1 = __importDefault(require("../utils/logger"));
class CacheService {
    client = null;
    isConnected = false;
    memoryCache = new Map();
    constructor() {
        const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
        if (process.env.USE_REDIS === "true") {
            this.client = (0, redis_1.createClient)({ url: redisUrl });
            this.client.on("connect", () => {
                logger_1.default.info("Redis cache client connecting...");
            });
            this.client.on("ready", () => {
                this.isConnected = true;
                logger_1.default.info("Redis cache client ready.");
            });
            this.client.on("error", (err) => {
                logger_1.default.warn(`Redis Cache connection error: ${err.message}. Falling back to in-memory cache.`);
                this.isConnected = false;
            });
            this.client.connect().catch((err) => {
                logger_1.default.warn(`Failed to connect to Redis: ${err.message}. In-memory cache active.`);
            });
        }
        else {
            logger_1.default.info("Redis cache disabled. Using standard in-memory fallback cache.");
        }
    }
    async get(key) {
        if (this.isConnected && this.client) {
            try {
                const raw = await this.client.get(key);
                return raw ? JSON.parse(raw) : null;
            }
            catch (err) {
                logger_1.default.error(err, `Error reading key "${key}" from Redis`);
            }
        }
        // Memory cache fallback
        const cached = this.memoryCache.get(key);
        if (!cached)
            return null;
        if (Date.now() > cached.expiresAt) {
            this.memoryCache.delete(key);
            return null;
        }
        return cached.value;
    }
    async set(key, value, ttlSeconds = 300) {
        if (this.isConnected && this.client) {
            try {
                await this.client.set(key, JSON.stringify(value), {
                    EX: ttlSeconds,
                });
                return;
            }
            catch (err) {
                logger_1.default.error(err, `Error writing key "${key}" to Redis`);
            }
        }
        // Memory cache fallback
        this.memoryCache.set(key, {
            value,
            expiresAt: Date.now() + ttlSeconds * 1000,
        });
    }
    async del(key) {
        if (this.isConnected && this.client) {
            try {
                await this.client.del(key);
                return;
            }
            catch (err) {
                logger_1.default.error(err, `Error deleting key "${key}" from Redis`);
            }
        }
        this.memoryCache.delete(key);
    }
}
exports.cache = new CacheService();
