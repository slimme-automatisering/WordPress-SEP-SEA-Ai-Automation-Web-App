require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { setupDatabase } = require('./database');
const licenseRoutes = require('./routes/license');
const healthRoutes = require('./routes/health');
const logger = require('./utils/logger');

const app = express();
const port = process.env.LICENSE_SERVER_PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use('/api/v1/licenses', licenseRoutes);
app.use('/health', healthRoutes);

// Error handling
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  // Start server
  async function startServer() {
    try {
      await setupDatabase();
      app.listen(port, () => {
        logger.info(`License server listening at http://localhost:${port}`);
      });
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  startServer();
}

module.exports = app;
