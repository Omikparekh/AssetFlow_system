import { createClient } from "redis";
import logger from "../utils/logger";

class CacheService {
  private client: any = null;
  private isConnected = false;
  private memoryCache = new Map<string, { value: any; expiresAt: number }>();

  constructor() {
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    
    if (process.env.USE_REDIS === "true") {
      this.client = createClient({ url: redisUrl });
      
      this.client.on("connect", () => {
        logger.info("Redis cache client connecting...");
      });

      this.client.on("ready", () => {
        this.isConnected = true;
        logger.info("Redis cache client ready.");
      });

      this.client.on("error", (err: Error) => {
        logger.warn(`Redis Cache connection error: ${err.message}. Falling back to in-memory cache.`);
        this.isConnected = false;
      });

      this.client.connect().catch((err: Error) => {
        logger.warn(`Failed to connect to Redis: ${err.message}. In-memory cache active.`);
      });
    } else {
      logger.info("Redis cache disabled. Using standard in-memory fallback cache.");
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.isConnected && this.client) {
      try {
        const raw = await this.client.get(key);
        return raw ? (JSON.parse(raw) as T) : null;
      } catch (err) {
        logger.error(err, `Error reading key "${key}" from Redis`);
      }
    }

    // Memory cache fallback
    const cached = this.memoryCache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }
    
    return cached.value as T;
  }

  async set(key: string, value: any, ttlSeconds = 300): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        await this.client.set(key, JSON.stringify(value), {
          EX: ttlSeconds,
        });
        return;
      } catch (err) {
        logger.error(err, `Error writing key "${key}" to Redis`);
      }
    }

    // Memory cache fallback
    this.memoryCache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key: string): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        await this.client.del(key);
        return;
      } catch (err) {
        logger.error(err, `Error deleting key "${key}" from Redis`);
      }
    }

    this.memoryCache.delete(key);
  }
}

export const cache = new CacheService();
