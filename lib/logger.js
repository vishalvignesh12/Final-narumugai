import pino from 'pino';
import { config, isDevelopment } from './envConfig.js';

/**
 * Structured logging with Pino
 *
 * Features:
 * - JSON output in production for log aggregation
 * - Pretty-printed output in development
 * - Automatic sensitive data sanitization
 * - Child loggers with context
 * - Multiple log levels (error, warn, info, debug)
 */

// Sensitive fields to redact from logs
const REDACT_FIELDS = [
  'password',
  'secret',
  'token',
  'api_key',
  'apiKey',
  'apikey',
  'access_token',
  'accessToken',
  'refresh_token',
  'refreshToken',
  'credit_card',
  'creditCard',
  'card_number',
  'cardNumber',
  'cvv',
  'ssn',
  'razorpay_signature',
  'razorpaySignature',
  'payment_id', // Only redact in full - keep last 4 chars
  'RAZORPAY_KEY_SECRET',
  'SECRET_KEY',
];

// Create logger instance
const logger = pino({
  level: config.LOG_LEVEL || 'info',

  // Redact sensitive fields
  redact: {
    paths: REDACT_FIELDS,
    censor: '[REDACTED]',
  },

  // Base context
  base: {
    env: config.NODE_ENV,
    pid: process.pid,
  },

  // Timestamp format
  timestamp: () => `,"time":"${new Date().toISOString()}"`,

  // Pretty print in development
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
          singleLine: false,
        },
      }
    : undefined,

  // Serializers for specific types
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
});

/**
 * Create a child logger with additional context
 * @param {Object} context - Context to add to all logs from this child
 * @returns {Logger} Child logger instance
 *
 * @example
 * const orderLogger = logger.child({ orderId: '12345', userId: 'abc' });
 * orderLogger.info('Processing order');
 */
logger.createChild = (context) => {
  return logger.child(context);
};

/**
 * Sanitize payment data for logging
 * Only logs last 4 characters of payment IDs and order IDs
 * @param {string} paymentId - Full payment ID
 * @returns {string} Sanitized payment ID
 */
export function sanitizePaymentId(paymentId) {
  if (!paymentId || typeof paymentId !== 'string') return paymentId;
  if (paymentId.length <= 4) return '****';
  return `****${paymentId.slice(-4)}`;
}

/**
 * Log payment-related events (sanitized)
 * @param {string} level - Log level (info, warn, error)
 * @param {Object} data - Payment data
 * @param {string} message - Log message
 */
export function logPayment(level, data, message) {
  const sanitized = {
    ...data,
    payment_id: data.payment_id ? sanitizePaymentId(data.payment_id) : undefined,
    order_id: data.order_id ? sanitizePaymentId(data.order_id) : undefined,
  };
  logger[level](sanitized, message);
}

/**
 * Log stock operation events
 * @param {string} level - Log level
 * @param {Object} data - Stock operation data
 * @param {string} message - Log message
 */
export function logStock(level, data, message) {
  logger[level](data, message);
}

/**
 * Log authentication events (no sensitive data)
 * @param {string} level - Log level
 * @param {Object} data - Auth data (without passwords/tokens)
 * @param {string} message - Log message
 */
export function logAuth(level, data, message) {
  const sanitized = {
    ...data,
    // Never log passwords or tokens
    password: undefined,
    token: undefined,
    access_token: undefined,
    refresh_token: undefined,
  };
  logger[level](sanitized, message);
}

/**
 * Log database operations
 * @param {string} level - Log level
 * @param {Object} data - Database operation data
 * @param {string} message - Log message
 */
export function logDatabase(level, data, message) {
  logger[level](data, message);
}

/**
 * Log API request/response
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {string} message - Log message
 */
export function logRequest(req, res, message) {
  logger.info(
    {
      method: req?.method,
      url: req?.url,
      status: res?.status,
      userId: req?.user?.id,
    },
    message
  );
}

export default logger;
