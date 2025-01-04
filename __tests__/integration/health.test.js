import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import { cache } from '../../src/config/redis.js';

const app = express();

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

describe('Health Check API', () => {
  it('should return health status', async () => {
    const response = await request(app).get('/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('timestamp');
  });

  it('should check Redis health', async () => {
    const response = await request(app).get('/health/redis');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status');
    if (response.body.status === 'healthy') {
      expect(response.body).toHaveProperty('message', 'Redis connection is working');
    }
  });
});
