import { logger } from "../utils/logger.js";
import { AppError } from "../utils/errorHandler.js";
import { redisClient } from "../config/redis.js";

export class BaseService {
  constructor() {
    this.logger = logger;
    this.cache = redisClient;
  }

  /**
   * Cache helper voor het ophalen van data
   * @param {string} key - Cache key
   * @param {Function} fetchData - Functie om data op te halen als cache miss
   * @param {number} ttl - Time to live in seconden
   */
  async getCached(key, fetchData, ttl = 3600) {
    try {
      // Check cache
      const cached = await this.cache.get(key);
      if (cached) {
        this.logger.debug("Cache hit:", { key });
        return JSON.parse(cached);
      }

      // Cache miss, fetch data
      this.logger.debug("Cache miss:", { key });
      const data = await fetchData();

      // Store in cache
      await this.cache.setex(key, ttl, JSON.stringify(data));
      return data;
    } catch (error) {
      this.logger.error("Cache error:", {
        key,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Verwijder items uit de cache
   * @param {string|Array} keys - Cache key(s) om te verwijderen
   */
  async invalidateCache(keys) {
    try {
      const keyArray = Array.isArray(keys) ? keys : [keys];
      await Promise.all(keyArray.map((key) => this.cache.del(key)));

      this.logger.debug("Cache invalidated:", { keys: keyArray });
    } catch (error) {
      this.logger.error("Cache invalidation error:", {
        keys,
        error: error.message,
        stack: error.stack,
      });
    }
  }

  /**
   * Rate limiting helper
   * @param {string} key - Rate limit key
   * @param {number} limit - Maximum aantal requests
   * @param {number} window - Tijdsvenster in seconden
   */
  async checkRateLimit(key, limit, window = 60) {
    const count = await this.cache.incr(key);

    if (count === 1) {
      await this.cache.expire(key, window);
    }

    if (count > limit) {
      throw new AppError("Rate limit overschreden", 429);
    }

    return {
      remaining: Math.max(0, limit - count),
      reset: await this.cache.ttl(key),
    };
  }

  /**
   * Helper voor het verwerken van batch operaties
   * @param {Array} items - Items om te verwerken
   * @param {Function} processItem - Functie om één item te verwerken
   * @param {number} batchSize - Grootte van elke batch
   */
  async processBatch(items, processItem, batchSize = 10) {
    const results = {
      successful: [],
      failed: [],
      total: items.length,
    };

    // Verwerk items in batches
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);

      const batchResults = await Promise.allSettled(
        batch.map((item) => processItem(item)),
      );

      // Verwerk resultaten
      batchResults.forEach((result, index) => {
        if (result.status === "fulfilled") {
          results.successful.push({
            item: batch[index],
            result: result.value,
          });
        } else {
          results.failed.push({
            item: batch[index],
            error: result.reason,
          });
        }
      });

      // Log voortgang
      this.logger.debug("Batch verwerkt:", {
        processed: Math.min(i + batchSize, items.length),
        total: items.length,
        successful: results.successful.length,
        failed: results.failed.length,
      });
    }

    return results;
  }

  /**
   * Helper voor het maken van unieke cache keys
   * @param {string} prefix - Prefix voor de key
   * @param {Object} params - Parameters om in de key op te nemen
   */
  createCacheKey(prefix, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}:${params[key]}`)
      .join(":");

    return `${prefix}:${sortedParams}`;
  }

  /**
   * Helper voor het valideren van externe API responses
   * @param {Object} response - API response
   * @param {string} service - Naam van de service
   */
  validateApiResponse(response, service) {
    if (!response || response.error) {
      const error = new AppError(
        `${service} API fout: ${response?.error?.message || "Onbekende fout"}`,
        response?.error?.status || 500,
      );

      this.logger.error(`${service} API fout:`, {
        error: response?.error,
        response,
      });

      throw error;
    }

    return response;
  }
}
