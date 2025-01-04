import { BaseMiddleware } from './baseMiddleware.js';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errorHandler.js';

export class AuthMiddleware extends BaseMiddleware {
  constructor() {
    super();
    this.JWT_SECRET = process.env.JWT_SECRET;
    this.JWT_EXPIRES = process.env.JWT_EXPIRES || '24h';
  }

  /**
   * Verify JWT token
   */
  verifyToken() {
    return (req, res, next) => {
      try {
        // Check authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
          throw new AppError('Geen token gevonden', 401);
        }

        // Verify token
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, this.JWT_SECRET);

        // Add user to request
        req.user = decoded;
        next();
      } catch (error) {
        if (error.name === 'JsonWebTokenError') {
          throw new AppError('Ongeldige token', 401);
        }
        if (error.name === 'TokenExpiredError') {
          throw new AppError('Token verlopen', 401);
        }
        throw error;
      }
    };
  }

  /**
   * Check user roles
   */
  checkRoles(roles = []) {
    return (req, res, next) => {
      if (!req.user) {
        throw new AppError('Niet geautoriseerd', 401);
      }

      const hasRole = roles.some(role => req.user.roles.includes(role));
      if (!hasRole) {
        throw new AppError('Onvoldoende rechten', 403);
      }

      next();
    };
  }

  /**
   * Verify API key
   */
  verifyApiKey() {
    return async (req, res, next) => {
      try {
        const apiKey = req.headers['x-api-key'];
        if (!apiKey) {
          throw new AppError('Geen API key gevonden', 401);
        }

        // Check cache first
        const cacheKey = `apikey:${apiKey}`;
        let apiKeyData = await this.cache.get(cacheKey);

        if (!apiKeyData) {
          // Verify with database/service
          apiKeyData = await this.verifyApiKeyWithService(apiKey);
          
          // Cache result
          if (apiKeyData) {
            await this.cache.setex(cacheKey, 3600, JSON.stringify(apiKeyData));
          }
        } else {
          apiKeyData = JSON.parse(apiKeyData);
        }

        if (!apiKeyData) {
          throw new AppError('Ongeldige API key', 401);
        }

        // Add API key data to request
        req.apiKey = apiKeyData;
        next();
      } catch (error) {
        if (error instanceof AppError) {
          throw error;
        }
        this.logger.error('API key verificatie fout:', error);
        throw new AppError('API key verificatie mislukt', 500);
      }
    };
  }

  /**
   * Verify CSRF token
   */
  verifyCsrfToken() {
    return (req, res, next) => {
      // Skip voor GET en HEAD requests
      if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
      }

      const token = req.headers['csrf-token'] || req.body._csrf;
      const cookieToken = req.cookies['XSRF-TOKEN'];

      if (!token || !cookieToken || token !== cookieToken) {
        throw new AppError('Ongeldige CSRF token', 403);
      }

      next();
    };
  }

  /**
   * Generate JWT token
   */
  generateToken(payload) {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES
    });
  }

  /**
   * Refresh JWT token
   */
  refreshToken() {
    return (req, res, next) => {
      try {
        const token = req.body.refreshToken;
        if (!token) {
          throw new AppError('Geen refresh token gevonden', 400);
        }

        // Verify refresh token
        const decoded = jwt.verify(token, this.JWT_SECRET);
        
        // Generate new access token
        const accessToken = this.generateToken({
          id: decoded.id,
          roles: decoded.roles
        });

        res.json({
          success: true,
          data: { accessToken }
        });
      } catch (error) {
        if (error.name === 'JsonWebTokenError') {
          throw new AppError('Ongeldige refresh token', 401);
        }
        if (error.name === 'TokenExpiredError') {
          throw new AppError('Refresh token verlopen', 401);
        }
        throw error;
      }
    };
  }

  /**
   * Verify API key with external service
   */
  async verifyApiKeyWithService(apiKey) {
    // Implementeer verificatie met database/service
    return null;
  }
}
