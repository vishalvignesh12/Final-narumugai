/**
 * API Request Logging Middleware
 *
 * Logs all API requests with timing, status codes, and errors
 * Integrates with Pino logger for structured logging
 */

import logger from './logger';

/**
 * Extract client information from request
 */
function getClientInfo(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const userAgent = request.headers.get('user-agent');

  return {
    ip: forwarded?.split(',')[0] || realIp || 'unknown',
    userAgent: userAgent || 'unknown',
  };
}

/**
 * Log API request and response
 *
 * @param {Request} request - Next.js request object
 * @param {Response} response - Response object
 * @param {number} duration - Request duration in ms
 * @param {Object} additionalData - Additional data to log
 */
export function logApiRequest(request, response, duration, additionalData = {}) {
  const clientInfo = getClientInfo(request);
  const method = request.method;
  const path = request.nextUrl?.pathname || 'unknown';
  const status = response.status;

  const logData = {
    method,
    path,
    status,
    duration: `${duration}ms`,
    ip: clientInfo.ip,
    userAgent: clientInfo.userAgent,
    ...additionalData,
  };

  // Log based on status code
  if (status >= 500) {
    logger.error(logData, 'API request failed with server error');
  } else if (status >= 400) {
    logger.warn(logData, 'API request failed with client error');
  } else if (duration > 1000) {
    logger.warn(logData, 'API request slow response');
  } else {
    logger.info(logData, 'API request processed');
  }
}

/**
 * Wrapper to log API routes
 *
 * Usage:
 * export const GET = withApiLogging(async (request) => {
 *   // Your handler code
 * });
 *
 * @param {Function} handler - API route handler
 * @returns {Function} Wrapped handler with logging
 */
export function withApiLogging(handler) {
  return async (request, context) => {
    const startTime = Date.now();
    let response;
    let error = null;

    try {
      response = await handler(request, context);
      return response;
    } catch (err) {
      error = err;
      // Re-throw to let error handler catch it
      throw err;
    } finally {
      const duration = Date.now() - startTime;

      if (response) {
        logApiRequest(request, response, duration, {
          error: error ? error.message : undefined,
        });
      } else if (error) {
        // Response not created due to error
        logger.error({
          method: request.method,
          path: request.nextUrl?.pathname,
          duration: `${duration}ms`,
          error: error.message,
          stack: error.stack,
        }, 'API request threw unhandled error');
      }
    }
  };
}

/**
 * Log webhook events specifically
 *
 * @param {string} provider - Webhook provider (e.g., 'razorpay')
 * @param {string} event - Event type
 * @param {Object} data - Event data
 * @param {boolean} success - Whether webhook processing succeeded
 */
export function logWebhook(provider, event, data, success) {
  const logData = {
    provider,
    event,
    success,
    orderId: data.order_id,
    paymentId: data.payment_id,
  };

  if (success) {
    logger.info(logData, `${provider} webhook processed successfully`);
  } else {
    logger.error({ ...logData, error: data.error }, `${provider} webhook processing failed`);
  }
}
