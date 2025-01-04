import { logger } from '../utils/logger.js';
import { ValidationError } from '../utils/errorHandler.js';

export class BaseController {
  constructor() {
    // Bind methods to ensure 'this' context
    this.sendResponse = this.sendResponse.bind(this);
    this.sendError = this.sendError.bind(this);
    this.validateRequest = this.validateRequest.bind(this);
  }

  /**
   * Standaard response formatter
   * @param {Object} res - Express response object
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Response message
   * @param {Object} data - Response data
   * @param {Object} meta - Meta informatie (paginering, etc.)
   */
  sendResponse(res, statusCode = 200, message = 'Success', data = null, meta = null) {
    const response = {
      status: statusCode < 400 ? 'success' : 'error',
      message,
      timestamp: new Date().toISOString()
    };

    if (data) response.data = data;
    if (meta) response.meta = meta;

    logger.info('API Response:', {
      statusCode,
      message,
      path: res.req.originalUrl,
      method: res.req.method,
      ...(meta && { meta })
    });

    return res.status(statusCode).json(response);
  }

  /**
   * Standaard error handler
   * @param {Object} res - Express response object
   * @param {Error} error - Error object
   */
  sendError(res, error) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Er is een fout opgetreden';

    logger.error('API Error:', {
      statusCode,
      message,
      path: res.req.originalUrl,
      method: res.req.method,
      stack: error.stack,
      ...(error.details && { details: error.details })
    });

    return this.sendResponse(res, statusCode, message, null, {
      errorCode: error.errorCode,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }

  /**
   * Request body validator
   * @param {Object} schema - Joi schema
   * @param {Object} body - Request body
   * @throws {ValidationError} Als validatie faalt
   */
  validateRequest(schema, body) {
    const { error, value } = schema.validate(body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      throw new ValidationError('Validatie fout', details);
    }

    return value;
  }

  /**
   * Wrapper voor async route handlers met error handling
   * @param {Function} fn - Async route handler
   */
  static asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(error => {
        next(error);
      });
    };
  }
}
