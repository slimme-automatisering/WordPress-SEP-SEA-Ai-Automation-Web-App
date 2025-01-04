require('dotenv').config({ path: '.env.test' });
const { pool, setupDatabase } = require('../database');

beforeAll(async () => {
  await setupDatabase();
});

afterAll(async () => {
  await pool.end();
});
