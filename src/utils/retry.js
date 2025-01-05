import logger from "./logger";

/**
 * Voert een functie uit met automatische retry bij falen
 * @param {Function} fn - De functie om uit te voeren
 * @param {number} retries - Aantal resterende pogingen
 * @param {number} initialDelay - Initiële vertraging in ms
 * @param {Function} shouldRetry - Optionele functie om te bepalen of retry nodig is
 */
export const retry = async (
  fn,
  retries = 5,
  initialDelay = 1000,
  shouldRetry = () => true,
) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0 || !shouldRetry(error)) {
      throw error;
    }

    const delay = initialDelay * Math.pow(2, 5 - retries); // Exponentiële backoff
    logger.warn(
      `Retrying operation. Attempts remaining: ${retries}. Next retry in ${delay}ms`,
    );

    await new Promise((resolve) => setTimeout(resolve, delay));
    return retry(fn, retries - 1, initialDelay, shouldRetry);
  }
};

// Als je een default export wilt:
export default retry;
