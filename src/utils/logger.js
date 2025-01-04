import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';

// Windsurf probleem detectie format
const windsurfProblemFormat = winston.format((info) => {
  if (info.level === 'error') {
    // Format voor Windsurf Problems venster
    const fileName = info.metadata?.error?.fileName || 'unknown';
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
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.metadata({ fillExcept: ['timestamp', 'level', 'message', 'stack'] }),
  windsurfProblemFormat(),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, metadata }) => {
    const meta = Object.keys(metadata).length ? JSON.stringify(metadata, null, 2) : '';
    return `${timestamp} ${level.toUpperCase()}: ${message}${stack ? `\nStack: ${stack}` : ''}${meta ? `\nMetadata: ${meta}` : ''}`;
  })
);

// Daily rotate transport voor error logs
const errorRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join('logs', 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: '20m',
  maxFiles: '14d',
  format: logFormat,
  handleExceptions: true,
  handleRejections: true
});

// Daily rotate transport voor alle logs
const combinedRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join('logs', 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: logFormat,
  handleExceptions: true,
  handleRejections: true
});

// Console transport met kleuren en betere formatting
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, stack, metadata }) => {
      const meta = metadata && Object.keys(metadata).length ? 
        '\n' + JSON.stringify(metadata, null, 2) : '';
      return `${timestamp} ${level}: ${message}${stack ? `\nStack: ${stack}` : ''}${meta}`;
    })
  ),
  handleExceptions: true,
  handleRejections: true
});

// Maak de logger instance met verbeterde configuratie
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: logFormat,
  transports: [
    errorRotateTransport,
    combinedRotateTransport,
    consoleTransport
  ],
  exitOnError: false
});

// Helper functie voor gestructureerd loggen van requests
export function logRequest(req, message) {
  const requestData = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id,
    requestId: req.id,
    params: req.params,
    query: req.query,
    body: req.body
  };

  logger.info(message, { request: requestData });
}

// Helper functie voor gestructureerd loggen van errors
export function logError(error, context = {}) {
  const errorData = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    code: error.code,
    fileName: error.fileName || context.fileName,
    line: error.line || context.line,
    column: error.column || context.column,
    ...context
  };

  logger.error('Error occurred', { error: errorData });
}

// Helper functie voor het loggen van syntax errors
export function logSyntaxError(fileName, line, column, message) {
  logError(new Error(message), {
    fileName,
    line,
    column,
    type: 'SYNTAX_ERROR'
  });
}

// Helper functie voor het loggen van runtime errors
export function logRuntimeError(error, fileName) {
  const stack = error.stack || '';
  const match = stack.match(/at .+ \((.+):(\d+):(\d+)\)/);
  
  logError(error, {
    fileName: fileName || (match ? match[1] : 'unknown'),
    line: match ? parseInt(match[2]) : 0,
    column: match ? parseInt(match[3]) : 0,
    type: 'RUNTIME_ERROR'
  });
}

// Exporteer de logger instance
export { logger };
export default logger;