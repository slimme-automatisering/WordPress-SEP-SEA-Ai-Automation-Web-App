import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { logger } from "./utils/logger";
import { monitorDockerLogs } from "./utils/dockerErrorParser";
import demoController from "./controllers/demoController";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "cdn.jsdelivr.net"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "cdn.jsdelivr.net"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));
app.use(cors());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression
app.use(compression());

// Serve static files
app.use('/dashboard', express.static(path.join(__dirname, 'dashboard')));

// Docker error parsing
if (process.env.ENABLE_ERROR_PARSING === "true") {
  const dockerLogger = monitorDockerLogs(process.env.HOSTNAME, "app");

  // Gebruik de Docker error parser voor morgan logging
  app.use(
    morgan("combined", {
      stream: dockerLogger,
    }),
  );
} else {
  // Standaard logging zonder error parsing
  app.use(
    morgan("combined", {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    }),
  );
}

// Demo routes voor error testing
app.use("/api", demoController);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Unhandled rejection handler met Docker error parsing
process.on("unhandledRejection", (reason, promise) => {
  const error = {
    type: "UNHANDLED_REJECTION",
    message: reason?.message || "Unhandled Promise Rejection",
    fileName: "app.js",
    line: 0,
    column: 0,
    original: reason,
  };

  if (process.env.ENABLE_ERROR_PARSING === "true") {
    console.error(
      `[${error.type}] ${error.fileName}:${error.line}:${error.column} - ${error.message} [REPAIR: cascade fix-promise]`,
    );
  }

  logger.error("Unhandled Rejection:", { error });
});

// Uncaught exception handler met Docker error parsing
process.on("uncaughtException", (error) => {
  const errorInfo = {
    type: "UNCAUGHT_EXCEPTION",
    message: error.message,
    fileName: error.fileName || "app.js",
    line: error.lineNumber || 0,
    column: error.columnNumber || 0,
    original: error,
  };

  if (process.env.ENABLE_ERROR_PARSING === "true") {
    console.error(
      `[${errorInfo.type}] ${errorInfo.fileName}:${errorInfo.line}:${errorInfo.column} - ${errorInfo.message} [REPAIR: cascade fix-exception]`,
    );
  }

  logger.error("Uncaught Exception:", { error: errorInfo });

  // Geef het process tijd om de error te loggen voordat we afsluiten
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

export default app;
