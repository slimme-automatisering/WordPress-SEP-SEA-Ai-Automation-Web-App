import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/health', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const dbStatus = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting"
    };

    res.json({
      status: 'ok',
      timestamp: new Date(),
      database: {
        state: dbStatus[dbState],
        connected: dbState === 1
      },
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

router.get('/health/mongodb', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const dbStatus = {
      0: "disconnected",
      1: "connected", 
      2: "connecting",
      3: "disconnecting"
    };

    if (dbState === 1) {
      await mongoose.connection.db.admin().ping();
      res.json({
        status: 'healthy',
        state: dbStatus[dbState],
        message: 'MongoDB connection is working'
      });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        state: dbStatus[dbState],
        message: 'MongoDB is not connected'
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

export default router; 