import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import { rateLimit } from 'express-rate-limit';
import { expressCspHeader, INLINE, NONE, SELF } from 'express-csp-header';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';

// Rate limiter configuratie
const limiter = rateLimit({
    windowMs: process.env.NODE_ENV === 'test' ? 1000 : 15 * 60 * 1000, // Kortere window voor tests
    max: process.env.NODE_ENV === 'test' ? 3 : 100, // Lagere limiet voor tests
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.headers['x-forwarded-for'] || req.ip;
    }
});

// Moderne CSRF token implementatie
function generateToken(size = 32) {
    return crypto.randomBytes(size).toString('hex');
}

function csrfProtection(options = {}) {
    const { cookie: cookieOpts = {}, ignoreMethods = ['GET', 'HEAD', 'OPTIONS'] } = options;
    
    return function csrf(req, res, next) {
        // Skip CSRF check voor bepaalde methods
        if (ignoreMethods.includes(req.method)) {
            return next();
        }

        // Genereer een token als er nog geen is
        if (!req.session.csrfToken) {
            req.session.csrfToken = generateToken();
        }

        // Check de token
        const token = req.headers['x-csrf-token'] || req.headers['x-xsrf-token'];
        
        if (!token || token !== req.session.csrfToken) {
            return res.status(403).json({
                error: 'CSRF token validation failed'
            });
        }

        // Token is geldig
        next();
    };
}

// Security middleware configuratie
export function configureSecurityMiddleware(app) {
    // Basic security headers
    app.use(helmet());

    // Cookie parser voor CSRF
    app.use(cookieParser());

    // HTTP Parameter Pollution bescherming
    app.use(hpp());

    // Rate limiting
    app.use(limiter);

    // Content Security Policy
    app.use(expressCspHeader({
        directives: {
            'default-src': [SELF],
            'script-src': [SELF, INLINE],
            'style-src': [SELF, INLINE],
            'img-src': [SELF, 'data:', 'https:'],
            'font-src': [SELF, 'https:', 'data:'],
            'object-src': [NONE],
            'frame-ancestors': [NONE]
        }
    }));

    // CSRF bescherming
    app.use(csrfProtection({
        cookie: {
            key: 'csrf',
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        }
    }));

    // XSS bescherming via Helmet en extra headers
    app.use((req, res, next) => {
        res.setHeader('X-XSS-Protection', '1; mode=block');
        next();
    });

    // Voorkom clickjacking
    app.use((req, res, next) => {
        res.setHeader('X-Frame-Options', 'DENY');
        next();
    });

    // Strict Transport Security in productie
    if (process.env.NODE_ENV === 'production') {
        app.use((req, res, next) => {
            res.setHeader(
                'Strict-Transport-Security',
                'max-age=31536000; includeSubDomains; preload'
            );
            next();
        });
    }

    // Error handler voor security middleware
    app.use((err, req, res, next) => {
        if (err.code === 'EBADCSRFTOKEN') {
            return res.status(403).json({
                error: 'CSRF token validation failed'
            });
        }
        next(err);
    });
}
