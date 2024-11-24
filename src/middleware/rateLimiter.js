import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuten
  max: 100, // max 100 requests per windowMs
  message: 'Te veel requests van dit IP, probeer het later opnieuw'
}); 