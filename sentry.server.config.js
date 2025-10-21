import * as Sentry from '@sentry/nextjs';

/**
 * Sentry Server-Side Configuration
 * Tracks errors and performance on the server (API routes, server components)
 */

Sentry.init({
  // Sentry DSN from environment variables
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment name
  environment: process.env.NODE_ENV || 'development',

  // Adjust sample rate for different environments
  // Lower rate in production to reduce volume
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',

  // Filter out sensitive data before sending to Sentry
  beforeSend(event, hint) {
    // Don't send events if Sentry DSN is not configured
    if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
      return null;
    }

    // Filter out rate limit errors (expected behavior, too noisy)
    const error = hint.originalException;
    if (error && error.message && error.message.includes('rate limit')) {
      return null;
    }

    // Filter out CSRF token errors (expected for attack attempts)
    if (error && error.message && error.message.toLowerCase().includes('csrf')) {
      return null;
    }

    // Sanitize request data
    if (event.request) {
      // Remove sensitive headers
      if (event.request.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
        delete event.request.headers['x-csrf-token'];
      }

      // Remove sensitive data from request body
      if (event.request.data) {
        try {
          const data = typeof event.request.data === 'string'
            ? JSON.parse(event.request.data)
            : event.request.data;

          // Redact sensitive fields
          if (data.password) data.password = '[REDACTED]';
          if (data.razorpay_signature) data.razorpay_signature = '[REDACTED]';
          if (data.razorpay_payment_id) {
            data.razorpay_payment_id = '****' + data.razorpay_payment_id.slice(-4);
          }

          event.request.data = JSON.stringify(data);
        } catch (e) {
          // If parsing fails, leave as is
        }
      }
    }

    // Sanitize extra context
    if (event.extra) {
      // Remove sensitive fields from extra data
      delete event.extra.password;
      delete event.extra.token;
      delete event.extra.razorpay_signature;
      delete event.extra.SECRET_KEY;
      delete event.extra.RAZORPAY_KEY_SECRET;
    }

    return event;
  },

  // Ignore specific errors
  ignoreErrors: [
    // Expected validation errors
    'Invalid or missing fields',
    'Validation error',
    // MongoDB duplicate key (handled gracefully)
    'E11000 duplicate key',
  ],

  // Configure integrations
  integrations: [
    // HTTP integration for tracking outgoing requests
    new Sentry.Integrations.Http({ tracing: true }),
  ],
});
