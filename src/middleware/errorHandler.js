import { logError, logSyntaxError, logRuntimeError } from '../utils/logger';

// Centrale error handler middleware
export const errorHandler = (err, req, res, next) => {
  // Bepaal het type error en log op de juiste manier
  if (err instanceof SyntaxError) {
    logSyntaxError(
      req.originalUrl,
      err.lineNumber || 0,
      err.column || 0,
      err.message
    );
  } else if (err instanceof TypeError || err instanceof ReferenceError) {
    logRuntimeError(err, req.originalUrl);
  } else {
    // Voor andere errors, gebruik de standaard error logger
    logError(err, {
      fileName: req.originalUrl,
      route: req.route?.path,
      method: req.method,
      query: req.query,
      body: req.body,
      user: req.user?.id
    });
  }

  // Stuur een gepaste error response
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Er is een fout opgetreden'
    : err.message;

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: err.code,
      type: err.name
    }
  });
};

// Custom error class voor API errors
export class ApiError extends Error {
  constructor(message, statusCode = 500, code = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
    
    // Parse filename en line number uit stack
    const stackLine = this.stack.split('\n')[1];
    const match = stackLine.match(/at .+ \((.+):(\d+):(\d+)\)/);
    if (match) {
      this.fileName = match[1];
      this.line = parseInt(match[2]);
      this.column = parseInt(match[3]);
    }
  }
}

// Not Found error handler
export const notFoundHandler = (req, res, next) => {
  const error = new ApiError(
    `Route niet gevonden: ${req.originalUrl}`,
    404,
    'ROUTE_NOT_FOUND'
  );
  next(error);
};

export default errorHandler;
