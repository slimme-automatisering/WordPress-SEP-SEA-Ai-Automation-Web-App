const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

/**
 * Middleware voor het verifiëren van JWT tokens
 */
function verifyToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Geen token aanwezig' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.license = decoded;
    next();
  } catch (error) {
    logger.error('Ongeldige token:', error);
    res.status(401).json({ error: 'Ongeldige token' });
  }
}

module.exports = {
  verifyToken
};
