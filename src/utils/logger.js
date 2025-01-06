import winston from "winston";
import "winston-daily-rotate-file";
import path from "node:path";

// Windsurf probleem detectie format
const windsurfProblemFormat = winston.format((info) => {
  if (info.level === "error") {
    // Format voor Windsurf Problems venster
    const fileName = info.metadata?.error?.fileName || "unknown";
    const line = info.metadata?.error?.line || 0;
    const column = info.metadata?.error?.column || 0;
    const problemMessage = `[ERROR] ${fileName}:${line}:${column} - ${info.message}`;

    // Log naar stderr voor Windsurf probleem detectie
    console.error(problemMessage);
  }
  return info;
});

// Custom log format met betere structuur en leesbaarheid
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.metadata({
    fillExcept: ["timestamp", "level", "message", "stack"],
  }),
  windsurfProblemFormat(),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, metadata }) => {
    const meta = Object.keys(metadata).length
      ? JSON.stringify(metadata, null, 2)
      : "";
    return `${timestamp} ${level.toUpperCase()}: ${message}${stack ? `\nStack: ${stack}` : ""}${meta ? `\nMetadata: ${meta}` : ""}`;
  }),
);

// Daily rotate transport voor error logs
const errorRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join("logs", "error-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  level: "error",
  maxSize: "20m",
  maxFiles: "14d",
  format: logFormat,
  handleExceptions: true,
  handleRejections: true,
});

// Daily rotate transport voor alle logs
const combinedRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join("logs", "combined-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "14d",
  format: logFormat,
});

// Console transport voor development
const consoleTransport = new winston.transports.Console({
  format: logFormat,
});

// Exporteer de logger instance
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: logFormat,
  transports: [
    errorRotateTransport,
    combinedRotateTransport,
    consoleTransport
  ],
  exitOnError: false,
  defaultMeta: { 
    service: "seo-sea-api",
    environment: process.env.NODE_ENV
  }
});

// Helper functies
export const logRequest = (req, message) => {
  logger.info(message, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userId: req.user?.id
  });
};

export const logError = (error, context = {}) => {
  logger.error(error.message, {
    error,
    context
  });
};

export const logSyntaxError = (fileName, line, column, message) => {
  logger.error(message, {
    error: {
      fileName,
      line,
      column
    }
  });
};

export const logRuntimeError = (error, fileName) => {
  logger.error(error.message, {
    error: {
      stack: error.stack,
      fileName
    }
  });
};

// Default export voor backward compatibility
export default {
  error: (...args) => logger.error(...args),
  warn: (...args) => logger.warn(...args),
  info: (...args) => logger.info(...args),
  debug: (...args) => logger.debug(...args),
  logRequest,
  logError,
  logSyntaxError,
  logRuntimeError
};
