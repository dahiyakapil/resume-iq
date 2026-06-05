/**
 * Custom Error Class for better error handling
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Error response formatter
 */
export const formatErrorResponse = (error, isDevelopment = false) => {
  const response = {
    error: error.message || 'Internal Server Error',
    statusCode: error.statusCode || 500,
  };

  if (isDevelopment) {
    response.stack = error.stack;
    response.details = error.details;
  }

  return response;
};

/**
 * Validation error handler
 */
export const handleValidationError = (fields) => {
  const missingFields = Object.entries(fields)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingFields.length > 0) {
    throw new AppError(
      `Missing required fields: ${missingFields.join(', ')}`,
      400,
      { missingFields }
    );
  }
};

/**
 * Database error handler
 */
export const handleDatabaseError = (error) => {
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return new AppError(`${field} already exists`, 409);
  }
  
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(err => err.message);
    return new AppError(`Validation failed: ${messages.join(', ')}`, 400);
  }
  
  if (error.name === 'CastError') {
    return new AppError(`Invalid ${error.path}: ${error.value}`, 400);
  }
  
  return new AppError('Database operation failed', 500);
};

/**
 * Log error with context
 */
export const logError = (context, error, additionalInfo = {}) => {
  console.error(`[${context}] Error:`, {
    message: error.message,
    stack: error.stack,
    ...additionalInfo,
    timestamp: new Date().toISOString()
  });
};
