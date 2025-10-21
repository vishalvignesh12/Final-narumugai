/**
 * Global API Error Handler
 *
 * Centralized error handling for all API routes
 * Provides consistent error responses and logging
 */

import logger from './logger';
import { response } from './helperFunction';

/**
 * Error types for classification
 */
export const ErrorTypes = {
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  CONFLICT: 'CONFLICT_ERROR',
  RATE_LIMIT: 'RATE_LIMIT_ERROR',
  DATABASE: 'DATABASE_ERROR',
  EXTERNAL_SERVICE: 'EXTERNAL_SERVICE_ERROR',
  INTERNAL: 'INTERNAL_ERROR',
};

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(message, statusCode = 500, type = ErrorTypes.INTERNAL, details = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.type = type;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Predefined error factories
 */
export const ApiErrors = {
  validation: (message, details) =>
    new ApiError(message, 400, ErrorTypes.VALIDATION, details),

  authentication: (message = 'Authentication required') =>
    new ApiError(message, 401, ErrorTypes.AUTHENTICATION),

  authorization: (message = 'Insufficient permissions') =>
    new ApiError(message, 403, ErrorTypes.AUTHORIZATION),

  notFound: (resource = 'Resource') =>
    new ApiError(`${resource} not found`, 404, ErrorTypes.NOT_FOUND),

  conflict: (message) =>
    new ApiError(message, 409, ErrorTypes.CONFLICT),

  rateLimit: (message = 'Too many requests') =>
    new ApiError(message, 429, ErrorTypes.RATE_LIMIT),

  database: (message = 'Database operation failed') =>
    new ApiError(message, 500, ErrorTypes.DATABASE),

  externalService: (service, message = 'External service unavailable') =>
    new ApiError(`${service}: ${message}`, 503, ErrorTypes.EXTERNAL_SERVICE),

  internal: (message = 'Internal server error') =>
    new ApiError(message, 500, ErrorTypes.INTERNAL),
};

/**
 * Handle Mongoose validation errors
 */
function handleMongooseError(error) {
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message,
    }));
    return new ApiError('Validation failed', 400, ErrorTypes.VALIDATION, errors);
  }

  if (error.name === 'CastError') {
    return new ApiError(`Invalid ${error.path}: ${error.value}`, 400, ErrorTypes.VALIDATION);
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return new ApiError(`${field} already exists`, 409, ErrorTypes.CONFLICT);
  }

  return new ApiError('Database error', 500, ErrorTypes.DATABASE);
}

/**
 * Handle Zod validation errors
 */
function handleZodError(error) {
  const errors = error.issues.map(issue => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));
  return new ApiError('Validation failed', 400, ErrorTypes.VALIDATION, errors);
}

/**
 * Sanitize error for client response
 *
 * Removes sensitive information like stack traces in production
 */
function sanitizeError(error, includeStack = false) {
  const sanitized = {
    message: error.message,
    type: error.type || ErrorTypes.INTERNAL,
    timestamp: error.timestamp || new Date().toISOString(),
  };

  if (error.details) {
    sanitized.details = error.details;
  }

  // Only include stack trace in development
  if (includeStack && process.env.NODE_ENV !== 'production') {
    sanitized.stack = error.stack;
  }

  return sanitized;
}

/**
 * Global error handler for API routes
 *
 * Usage:
 * export const GET = handleApiError(async (request) => {
 *   // Your handler code
 *   if (error) throw ApiErrors.validation('Invalid input');
 * });
 *
 * @param {Function} handler - API route handler
 * @returns {Function} Wrapped handler with error handling
 */
export function handleApiError(handler) {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      // Convert known error types
      let apiError = error;

      if (!(error instanceof ApiError)) {
        // Handle Mongoose errors
        if (error.name === 'ValidationError' || error.name === 'CastError' || error.code === 11000) {
          apiError = handleMongooseError(error);
        }
        // Handle Zod errors
        else if (error.name === 'ZodError') {
          apiError = handleZodError(error);
        }
        // Handle generic errors
        else {
          apiError = new ApiError(
            error.message || 'Internal server error',
            error.statusCode || 500,
            ErrorTypes.INTERNAL
          );
        }
      }

      // Log the error
      const logData = {
        type: apiError.type,
        statusCode: apiError.statusCode,
        message: apiError.message,
        path: request.nextUrl?.pathname,
        method: request.method,
      };

      if (apiError.statusCode >= 500) {
        logger.error({
          ...logData,
          stack: error.stack,
          details: apiError.details,
        }, 'API error occurred');
      } else if (apiError.statusCode >= 400) {
        logger.warn(logData, 'API client error');
      }

      // Return error response
      return response(
        false,
        apiError.statusCode,
        apiError.message,
        sanitizeError(apiError, process.env.NODE_ENV !== 'production')
      );
    }
  };
}

/**
 * Async wrapper with error handling
 *
 * Simpler alternative to handleApiError for quick wrapping
 *
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function
 */
export function asyncHandler(fn) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      throw error; // Let global handler catch it
    }
  };
}

/**
 * Validation helper
 *
 * Validates data against a schema and throws ApiError if invalid
 *
 * @param {Object} schema - Zod schema
 * @param {Object} data - Data to validate
 * @returns {Object} Validated data
 */
export function validateRequest(schema, data) {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw handleZodError(result.error);
  }

  return result.data;
}

/**
 * Database operation wrapper
 *
 * Wraps database operations and converts errors to ApiErrors
 *
 * @param {Function} operation - Database operation
 * @param {string} errorMessage - Custom error message
 * @returns {Promise} Operation result
 */
export async function dbOperation(operation, errorMessage = 'Database operation failed') {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw handleMongooseError(error);
  }
}
