import helmet from 'helmet';
import xss from 'xss-clean';

export const securityMiddleware = [
  helmet(),
  xss(),
  (req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    next();
  }
]; 