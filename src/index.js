// Optionele NewRelic import
try {
  if (process.env.NEW_RELIC_LICENSE_KEY) {
    await import('newrelic/index.cjs');
  }
} catch (error) {
  console.log('NewRelic niet geconfigureerd, monitoring wordt overgeslagen');
}

import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { securityMiddleware } from './middleware/security.js';
import { errorHandler } from './utils/errorHandler.js';
import { cache } from './config/redis.js';
import router from './routes/index.js';
import logger from './utils/logger.js';
import connectDB from './config/database.js';
import healthRouter from './routes/health.js';

const app = express();

// Compressie voor alle responses
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parsing (nodig voor CSRF)
app.use(cookieParser());

// Security middleware
app.use(securityMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Redis health check endpoint
app.get('/health/redis', async (req, res) => {
  try {
    const isHealthy = await cache.healthCheck();
    if (isHealthy) {
      res.json({ status: 'healthy', message: 'Redis connection is working' });
    } else {
      res.status(500).json({ status: 'unhealthy', message: 'Redis connection failed' });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Cache middleware voor API routes
app.use('/api', cache.cacheMiddleware(3600));

// Voeg hier de nieuwe route toe
app.get('/', (req, res) => {
  res.send('Welkom bij de SEO & SEA Automation Web App!');
});

app.use('/api', router);

// Error handling
app.use(errorHandler);

// Update de health routes
app.use('/health', healthRouter);

// Start server
const PORT = process.env.PORT || 3000;
let server;

async function startServer() {
  try {
    await connectDB();
    server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Server start failed:', error);
    process.exit(1);
  }
}

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Received shutdown signal. Starting graceful shutdown...');
  
  // Stop nieuwe requests
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
    });
  }

  try {
    // Sluit database connectie
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed');
    }

    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// Bind shutdown handlers
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

startServer();

export default app;