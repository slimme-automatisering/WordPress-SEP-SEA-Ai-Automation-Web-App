const { Pool } = require('pg');
const logger = require('../utils/logger');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function setupDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS licenses (
        id UUID PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        key VARCHAR(255) UNIQUE NOT NULL,
        company_name VARCHAR(255),
        domains TEXT[],
        features JSONB,
        valid_until TIMESTAMP NOT NULL,
        max_api_calls INTEGER,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS license_usage (
        id UUID PRIMARY KEY,
        license_id UUID REFERENCES licenses(id),
        api_calls INTEGER DEFAULT 0,
        date DATE DEFAULT CURRENT_DATE,
        features_used JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_license_key ON licenses(key);
      CREATE INDEX IF NOT EXISTS idx_license_usage_date ON license_usage(date);
    `);
    logger.info('Database setup completed');
  } catch (error) {
    logger.error('Error setting up database:', error);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  setupDatabase
};
