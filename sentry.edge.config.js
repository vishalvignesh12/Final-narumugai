import * as Sentry from '@sentry/nextjs';

/**
 * Sentry Edge Runtime Configuration
 * Tracks errors in Edge runtime (middleware, edge API routes)
 */

Sentry.init({
  // Sentry DSN from environment variables
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment name
  environment: process.env.NODE_ENV || 'development',

  // Sample rate for edge runtime
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',

  // Filter sensitive data
  beforeSend(event, hint) {
    // Don't send events if Sentry DSN is not configured
    if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
      return null;
    }

    // Remove sensitive headers
    if (event.request && event.request.headers) {
      delete event.request.headers.authorization;
      delete event.request.headers.cookie;
      delete event.request.headers['x-csrf-token'];
    }

    return event;
  },

  // Ignore authentication redirect errors (expected behavior)
  ignoreErrors: [
    'Redirect',
    'NEXT_REDIRECT',
  ],
});
