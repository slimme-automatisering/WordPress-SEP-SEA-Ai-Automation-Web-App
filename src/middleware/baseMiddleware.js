import { logger } from '../utils/logger.js';
import { AppError } from '../utils/errorHandler.js';
import { redisClient } from '../config/redis.js';

export class BaseMiddleware {
  constructor() {
    this.logger = logger;
    this.cache = redisClient;
  }

  /**
   * Wrapper voor async middleware
   * @param {Function} fn - Middleware functie
   */
  static asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Valideer request headers
   */
  validateHeaders(requiredHeaders = []) {
    return (req, res, next) => {
      const missingHeaders = requiredHeaders.filter(
        header => !req.headers[header.toLowerCase()]
      );

      if (missingHeaders.length > 0) {
        throw new AppError(
          `Verplichte headers ontbreken: ${missingHeaders.join(', ')}`,
          400
        );
      }

      next();
    };
  }

  /**
   * Valideer request parameters
   */
  validateParams(schema) {
    return (req, res, next) => {
      const { error } = schema.validate(req.params);
      
      if (error) {
        throw new AppError(
          `Ongeldige parameters: ${error.details[0].message}`,
          400
        );
      }

      next();
    };
  }

  /**
   * Valideer query parameters
   */
  validateQuery(schema) {
    return (req, res, next) => {
      const { error } = schema.validate(req.query);
      
      if (error) {
        throw new AppError(
          `Ongeldige query parameters: ${error.details[0].message}`,
          400
        );
      }

      next();
    };
  }

  /**
   * Valideer request body
   */
  validateBody(schema) {
    return (req, res, next) => {
      const { error } = schema.validate(req.body);
      
      if (error) {
        throw new AppError(
          `Ongeldige request body: ${error.details[0].message}`,
          400
        );
      }

      next();
    };
  }

  /**
   * Rate limiting middleware
   */
  rateLimit(options = {}) {
    const {
      windowMs = 60000, // 1 minuut
      max = 100, // 100 requests per window
      message = 'Te veel requests, probeer het later opnieuw'
    } = options;

    return async (req, res, next) => {
      const key = `ratelimit:${req.ip}`;
      
      try {
        const requests = await this.cache.incr(key);
        
        if (requests === 1) {
          await this.cache.expire(key, windowMs / 1000);
        }

        if (requests > max) {
          throw new AppError(message, 429);
        }

        // Voeg headers toe
        res.set({
          'X-RateLimit-Limit': max,
          'X-RateLimit-Remaining': Math.max(0, max - requests),
          'X-RateLimit-Reset': await this.cache.ttl(key)
        });

        next();
      } catch (error) {
        if (error instanceof AppError) {
          throw error;
        }
        
        // Bij Redis errors, sta request toe
        this.logger.error('Rate limit error:', error);
        next();
      }
    };
  }

  /**
   * CORS middleware
   */
  cors(options = {}) {
    const {
      origin = '*',
      methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders = ['Content-Type', 'Authorization'],
      exposedHeaders = ['X-RateLimit-Limit', 'X-RateLimit-Remaining'],
      credentials = true,
      maxAge = 86400 // 24 uur
    } = options;

    return (req, res, next) => {
      res.set({
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': methods.join(','),
        'Access-Control-Allow-Headers': allowedHeaders.join(','),
        'Access-Control-Expose-Headers': exposedHeaders.join(','),
        'Access-Control-Allow-Credentials': credentials,
        'Access-Control-Max-Age': maxAge
      });

      if (req.method === 'OPTIONS') {
        return res.status(204).end();
      }

      next();
    };
  }

  /**
   * Security headers middleware
   */
  securityHeaders() {
    return (req, res, next) => {
      res.set({
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Content-Security-Policy': "default-src 'self'",
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      });

      next();
    };
  }

  /**
   * Request logging middleware
   */
  requestLogger() {
    return (req, res, next) => {
      const start = Date.now();

      // Log bij voltooiing
      res.on('finish', () => {
        const duration = Date.now() - start;
        
        this.logger.info('Request verwerkt:', {
          method: req.method,
          url: req.originalUrl,
          status: res.statusCode,
          duration,
          ip: req.ip,
          userAgent: req.get('user-agent')
        });
      });

      next();
    };
  }

  /**
   * Error logging middleware
   */
  errorLogger() {
    return (err, req, res, next) => {
      this.logger.error('Request error:', {
        error: err.message,
        stack: err.stack,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('user-agent')
      });

      next(err);
    };
  }

  /**
   * Error handler middleware
   */
  errorHandler() {
    return (err, req, res, next) => {
      const statusCode = err.statusCode || 500;
      const message = err.message || 'Er is een fout opgetreden';

      res.status(statusCode).json({
        success: false,
        error: {
          message,
          code: err.code,
          status: statusCode
        }
      });
    };
  }
}
