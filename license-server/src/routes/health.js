const express = require('express');
const router = express.Router();
const { pool } = require('../database');
const logger = require('../utils/logger');

/**
 * Health check endpoint
 */
router.get('/', async (req, res) => {
  try {
    // Test database connectie
    await pool.query('SELECT NOW()');
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

module.exports = router;
