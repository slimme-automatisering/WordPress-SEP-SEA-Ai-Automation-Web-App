import Redis from "ioredis";

// Redis configuratie met retry strategie
const redisConfig = {
  host: process.env.REDIS_HOST || "redis", // Gebruik de service naam uit docker-compose
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  showFriendlyErrorStack: process.env.NODE_ENV !== "production",
};

// Maak Redis client instance
const client = new Redis(redisConfig);

// Event listeners voor betere monitoring
client.on("connect", () => {
  console.log("Redis Client Connected");
});

client.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

client.on("ready", () => {
  console.log("Redis Client Ready");
});

client.on("reconnecting", () => {
  console.log("Redis Client Reconnecting...");
});

export const cache = {
  get: async (key) => {
    try {
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Redis Get Error:", error);
      return null;
    }
  },

  set: async (key, value, expireTime = 3600) => {
    try {
      const stringValue = JSON.stringify(value);
      await client.setex(key, expireTime, stringValue);
      return true;
    } catch (error) {
      console.error("Redis Set Error:", error);
      return false;
    }
  },

  del: async (key) => {
    try {
      await client.del(key);
      return true;
    } catch (error) {
      console.error("Redis Delete Error:", error);
      return false;
    }
  },

  // Cache middleware met verbeterde error handling
  cacheMiddleware: (duration) => {
    return async (req, res, next) => {
      // Skip caching voor niet-GET requests
      if (req.method !== "GET") {
        return next();
      }

      const key = `__express__${req.originalUrl || req.url}`;

      try {
        const cachedResponse = await cache.get(key);

        if (cachedResponse) {
          // Voeg cache header toe
          res.setHeader("X-Cache", "HIT");
          return res.json(cachedResponse);
        }

        // Cache miss header
        res.setHeader("X-Cache", "MISS");

        // Modify res.json to cache the response
        const originalJson = res.json.bind(res);
        res.json = async (body) => {
          try {
            await cache.set(key, body, duration);
          } catch (error) {
            console.error("Cache Set Error in Middleware:", error);
          }
          return originalJson(body);
        };

        next();
      } catch (error) {
        console.error("Cache Middleware Error:", error);
        // Bij cache error, ga door zonder caching
        next();
      }
    };
  },

  // Nieuwe methode voor het flushen van de cache
  flushCache: async () => {
    try {
      await client.flushdb();
      return true;
    } catch (error) {
      console.error("Redis Flush Error:", error);
      return false;
    }
  },

  // Nieuwe methode voor health check
  healthCheck: async () => {
    try {
      const ping = await client.ping();
      return ping === "PONG";
    } catch (error) {
      console.error("Redis Health Check Error:", error);
      return false;
    }
  },
};

export default client;
