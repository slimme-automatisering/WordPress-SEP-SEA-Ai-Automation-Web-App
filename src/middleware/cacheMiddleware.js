import { BaseMiddleware } from './baseMiddleware.js';
import { AppError } from '../utils/errorHandler.js';

export class CacheMiddleware extends BaseMiddleware {
  constructor() {
    super();
  }

  /**
   * Cache middleware voor routes
   */
  cacheRoute(options = {}) {
    const {
      ttl = 3600, // 1 uur
      prefix = 'route',
      condition = () => true // Standaard altijd cachen
    } = options;

    return async (req, res, next) => {
      // Skip cache voor non-GET requests
      if (req.method !== 'GET') {
        return next();
      }

      // Check conditie
      if (!condition(req)) {
        return next();
      }

      const key = this.createCacheKey(prefix, {
        url: req.originalUrl,
        auth: req.user?.id || 'anonymous'
      });

      try {
        // Check cache
        const cached = await this.cache.get(key);
        if (cached) {
          const data = JSON.parse(cached);
          return res.json(data);
        }

        // Cache miss - vervang res.json met eigen implementatie
        const originalJson = res.json.bind(res);
        res.json = (body) => {
          // Herstel originele json method
          res.json = originalJson;

          // Cache response
          this.cache.setex(key, ttl, JSON.stringify(body))
            .catch(error => this.logger.error('Cache error:', error));

          // Stuur response
          return res.json(body);
        };

        next();
      } catch (error) {
        this.logger.error('Cache middleware error:', error);
        next();
      }
    };
  }

  /**
   * Cache middleware voor API responses
   */
  cacheApi(options = {}) {
    const {
      ttl = 300, // 5 minuten
      prefix = 'api',
      keyGenerator = (req) => req.originalUrl
    } = options;

    return async (req, res, next) => {
      // Skip cache voor non-GET requests
      if (req.method !== 'GET') {
        return next();
      }

      const key = this.createCacheKey(prefix, {
        key: keyGenerator(req),
        auth: req.user?.id || 'anonymous'
      });

      try {
        // Check cache
        const cached = await this.cache.get(key);
        if (cached) {
          return res.json(JSON.parse(cached));
        }

        // Cache miss - vervang res.json
        const originalJson = res.json.bind(res);
        res.json = (body) => {
          res.json = originalJson;

          // Alleen succesvolle responses cachen
          if (res.statusCode === 200) {
            this.cache.setex(key, ttl, JSON.stringify(body))
              .catch(error => this.logger.error('Cache error:', error));
          }

          return res.json(body);
        };

        next();
      } catch (error) {
        this.logger.error('API cache error:', error);
        next();
      }
    };
  }

  /**
   * Cache invalidatie middleware
   */
  invalidateCache(patterns = []) {
    return async (req, res, next) => {
      // Originele response versturen
      const originalJson = res.json.bind(res);
      res.json = async (body) => {
        res.json = originalJson;

        // Alleen bij succesvolle mutaties cache invalideren
        if (res.statusCode === 200 && ['POST', 'PUT', 'DELETE'].includes(req.method)) {
          try {
            for (const pattern of patterns) {
              const keys = await this.cache.keys(pattern);
              if (keys.length > 0) {
                await this.cache.del(keys);
                this.logger.debug('Cache geïnvalideerd:', { pattern, count: keys.length });
              }
            }
          } catch (error) {
            this.logger.error('Cache invalidatie error:', error);
          }
        }

        return res.json(body);
      };

      next();
    };
  }

  /**
   * Cache warmup middleware
   */
  warmupCache(options = {}) {
    const {
      urls = [],
      interval = 3600000, // 1 uur
      concurrency = 5
    } = options;

    // Start warmup proces
    this.startWarmup(urls, interval, concurrency);

    // Middleware doet niets, alleen logging
    return (req, res, next) => {
      next();
    };
  }

  /**
   * Start cache warmup proces
   */
  async startWarmup(urls, interval, concurrency) {
    const warmup = async () => {
      this.logger.info('Cache warmup gestart');
      
      // Verwerk URLs in batches
      for (let i = 0; i < urls.length; i += concurrency) {
        const batch = urls.slice(i, i + concurrency);
        
        await Promise.all(
          batch.map(async (url) => {
            try {
              const response = await fetch(url);
              const data = await response.json();
              
              const key = this.createCacheKey('warmup', { url });
              await this.cache.setex(key, interval / 1000, JSON.stringify(data));
              
              this.logger.debug('URL gecached:', { url });
            } catch (error) {
              this.logger.error('Warmup error:', { url, error: error.message });
            }
          })
        );
      }

      this.logger.info('Cache warmup voltooid');
    };

    // Start initial warmup
    warmup();

    // Schedule periodic warmup
    setInterval(warmup, interval);
  }

  /**
   * Cache monitoring middleware
   */
  monitorCache() {
    return async (req, res, next) => {
      const start = Date.now();
      
      // Vervang cache operaties met gemonitorde versies
      const originalGet = this.cache.get.bind(this.cache);
      const originalSet = this.cache.set.bind(this.cache);

      this.cache.get = async (...args) => {
        const result = await originalGet(...args);
        this.recordCacheMetric('get', result != null, Date.now() - start);
        return result;
      };

      this.cache.set = async (...args) => {
        const result = await originalSet(...args);
        this.recordCacheMetric('set', true, Date.now() - start);
        return result;
      };

      next();
    };
  }

  /**
   * Record cache metrics
   */
  recordCacheMetric(operation, hit, duration) {
    this.logger.info('Cache metric:', {
      operation,
      hit,
      duration,
      timestamp: new Date().toISOString()
    });
  }
}
