const logger = require('./logger');

const retry = async (fn, retries = 5, delay = 5000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) {
      throw error;
    }
    logger.warn(`Retrying operation. Attempts remaining: ${retries}`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return retry(fn, retries - 1, delay);
  }
};

module.exports = retry; 