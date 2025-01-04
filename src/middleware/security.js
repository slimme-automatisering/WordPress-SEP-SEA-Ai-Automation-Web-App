import helmet from 'helmet';
import xss from 'xss-clean';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import { expressCspHeader, INLINE, NONE, SELF } from 'express-csp-header';
import { logger } from '../utils/logger.js';
import csrf from 'csurf';
import timeout from 'express-timeout-handler';

// Rate limiting configuratie
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Te veel requests van dit IP adres, probeer het later opnieuw.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit overschreden door IP: ${req.ip}`);
    res.status(429).json({
      status: 'error',
      message: 'Te veel requests van dit IP adres, probeer het later opnieuw.'
    });
  }
});

// CSP configuratie
const cspConfig = expressCspHeader({
  directives: {
    'default-src': [SELF],
    'script-src': [SELF, INLINE],
    'style-src': [SELF, INLINE],
    'img-src': [SELF, 'data:', 'https:'],
    'font-src': [SELF, 'https://fonts.gstatic.com'],
    'object-src': [NONE],
    'block-all-mixed-content': true
  }
});

// Timeout configuratie
const timeoutOptions = {
  timeout: 30000,
  onTimeout: (req, res) => {
    res.status(503).json({
      status: 'error',
      message: 'Request timeout - server is mogelijk overbelast'
    });
  }
};

// XSS filter middleware
const xssFilter = (req, res, next) => {
  if (req.body) {
    for (let key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);
      }
    }
  }
  if (req.query) {
    for (let key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = xss(req.query[key]);
      }
    }
  }
  next();
};

// CSRF configuratie
const csrfProtection = csrf({
  cookie: {
    key: 'XSRF-TOKEN',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// CSRF error handler
const csrfErrorHandler = (err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);
  
  logger.warn(`CSRF token mismatch voor ${req.path}`);
  res.status(403).json({
    status: 'error',
    message: 'Ongeldige CSRF token'
  });
};

export const securityMiddleware = [
  // Request timeout (30 seconden)
  timeout.handler(timeoutOptions),
  
  // Basic security headers
  helmet(),
  
  // Content Security Policy
  cspConfig,
  
  // Rate limiting
  limiter,
  
  // XSS protection
  xssFilter,
  
  // HTTP Parameter Pollution
  hpp(),
  
  // MongoDB query injection
  mongoSanitize(),
  
  // CSRF protection
  csrfProtection,
  csrfErrorHandler
];

// Middleware voor het valideren van request bodies
export function validateRequestBody(schema) {
  return (req, res, next) => {
    try {
      const { error } = schema.validate(req.body);
      if (error) {
        logger.warn('Ongeldige request body:', error.details[0].message);
        return res.status(400).json({
          status: 'error',
          message: 'Ongeldige request body',
          details: error.details[0].message
        });
      }
      next();
    } catch (err) {
      logger.error('Error bij request body validatie:', err);
      next(err);
    }
  };
}

// Middleware voor het sanitizen van user input
export function sanitizeUserInput(req, res, next) {
  try {
    // Sanitize body
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = req.body[key].trim();
        }
      });
    }

    // Sanitize query parameters
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
          req.query[key] = req.query[key].trim();
        }
      });
    }

    next();
  } catch (err) {
    logger.error('Error bij input sanitization:', err);
    next(err);
  }
}