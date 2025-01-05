import rateLimit from "express-rate-limit";

// Basis rate limiter voor alle routes
export const baseLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuten
  max: 100, // Maximaal 100 requests per IP per 15 minuten
  message: {
    error: {
      message: "Te veel requests. Probeer het later opnieuw.",
      status: 429,
    },
  },
  standardHeaders: true, // Return rate limit info in de headers
  legacyHeaders: false, // Disable de `X-RateLimit-*` headers
});

// Strikte rate limiter voor analyse endpoints
export const analysisLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 uur
  max: 50, // Maximaal 50 analyse requests per IP per uur
  message: {
    error: {
      message: "Te veel analyse requests. Probeer het over een uur opnieuw.",
      status: 429,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter voor suggestie endpoints
export const suggestionsLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minuten
  max: 200, // Maximaal 200 suggestie requests per IP per 30 minuten
  message: {
    error: {
      message:
        "Te veel suggestie requests. Probeer het over 30 minuten opnieuw.",
      status: 429,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
