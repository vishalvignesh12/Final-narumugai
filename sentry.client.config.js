import * as Sentry from '@sentry/nextjs';

/**
 * Sentry Client-Side Configuration
 * Tracks errors and performance in the browser
 */

Sentry.init({
  // Sentry DSN from environment variables
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment name
  environment: process.env.NODE_ENV || 'development',

  // Adjust sample rate for different environments
  // 1.0 = 100% of errors captured
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session replay for debugging user sessions
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',

  // Integrations
  integrations: [
    // Session replay integration
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),

    // Browser tracing for performance monitoring
    new Sentry.BrowserTracing({
      tracePropagationTargets: [
        'localhost',
        /^\//,
        process.env.NEXT_PUBLIC_BASE_URL,
      ],
    }),
  ],

  // Filter out sensitive data
  beforeSend(event, hint) {
    // Don't send events if Sentry DSN is not configured
    if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
      return null;
    }

    // Filter out network timeout errors (too noisy)
    const error = hint.originalException;
    if (error && error.message && error.message.includes('timeout')) {
      return null;
    }

    // Sanitize sensitive data from breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
        if (breadcrumb.data) {
          // Remove sensitive fields
          delete breadcrumb.data.password;
          delete breadcrumb.data.token;
          delete breadcrumb.data.credit_card;
          delete breadcrumb.data.razorpay_signature;
        }
        return breadcrumb;
      });
    }

    return event;
  },

  // Ignore specific errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'canvas.contentDocument',
    // Network errors
    'NetworkError',
    'Network request failed',
    // Random plugins/extensions
    'atomicFindClose',
    'conduitPage',
  ],
});
