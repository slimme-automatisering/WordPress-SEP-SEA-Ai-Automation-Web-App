import { logger } from "./logger.js";

// Winston logger configuratie
// const logger = winston.createLogger({
//   level: 'error',
//   format: winston.format.combine(
//     winston.format.timestamp(),
//     winston.format.json()
//   ),
//   transports: [
//     new winston.transports.File({ filename: 'error.log', level: 'error' }),
//     new winston.transports.File({ filename: 'combined.log' })
//   ]
// });

// if (process.env.NODE_ENV !== 'production') {
//   logger.add(new winston.transports.Console({
//     format: winston.format.simple()
//   }));
// }

export class AppError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.errorCode = errorCode;
    this.isOperational = true; // Voor onderscheid tussen operationele en programmeerfouten
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specifieke error types
export class ValidationError extends AppError {
  constructor(message) {
    super(message, 400, "VALIDATION_ERROR");
  }
}

export class AuthenticationError extends AppError {
  constructor(message) {
    super(message, 401, "AUTHENTICATION_ERROR");
  }
}

export class AuthorizationError extends AppError {
  constructor(message) {
    super(message, 403, "AUTHORIZATION_ERROR");
  }
}

// Centrale error handler
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Log error details
  logger.error({
    error: {
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode,
      status: err.status,
      errorCode: err.errorCode,
      path: req.originalUrl,
      method: req.method,
      ip: req.ip,
      timestamp: new Date().toISOString(),
    },
  });

  // Mongoose validation error handling
  if (err.name === "ValidationError") {
    err = new ValidationError(
      Object.values(err.errors)
        .map((val) => val.message)
        .join(", "),
    );
  }

  // JWT error handling
  if (err.name === "JsonWebTokenError") {
    err = new AuthenticationError("Ongeldige token. Log opnieuw in.");
  }

  if (process.env.NODE_ENV === "development") {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
      errorCode: err.errorCode,
    });
  } else {
    // Production: geen stack trace
    res.status(err.statusCode).json({
      status: err.status,
      message: err.isOperational ? err.message : "Er is een fout opgetreden",
      errorCode: err.errorCode,
    });
  }
};

// Uncaught exception handler
process.on("uncaughtException", (err) => {
  logger.error({
    message: "UNCAUGHT EXCEPTION",
    error: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

// Unhandled rejection handler
process.on("unhandledRejection", (err) => {
  logger.error({
    message: "UNHANDLED REJECTION",
    error: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

// Export error types en handler
export default {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  errorHandler,
};
