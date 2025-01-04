import mongoose from 'mongoose';
import { retry } from '../utils/retry.js';
import logger from '../utils/logger.js';

const connectDB = async () => {
  const connect = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI);

      logger.info(`MongoDB Connected: ${conn.connection.host}`);

      mongoose.connection.on('error', (err) => {
        logger.error('MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected. Attempting to reconnect...');
      });

      return conn;
    } catch (error) {
      logger.error('Error connecting to MongoDB:', error);
      throw error;
    }
  };

  return retry(connect, 5, 5000);
};

export default connectDB; 