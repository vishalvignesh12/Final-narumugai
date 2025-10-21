import rateLimit from 'express-rate-limit';
import { config } from './envConfig.js';
import logger from './logger.js';
import { NextResponse } from 'next/server';

/**
 * Rate Limiting Configuration
 *
 * Protects API endpoints from abuse by limiting request frequency
 * Uses in-memory storage (resets on app restart)
 */

/**
 * Get client IP address from request
 * Handles proxy/CDN scenarios (x-forwarded-for, x-real-ip)
 */
function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  // Fallback (won't work well in production behind proxy)
  return 'unknown';
}

/**
 * Create a rate limiter middleware for Next.js API routes
 *
 * @param {Object} options - Rate limit options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum requests per window
 * @param {string} options.message - Error message when limit exceeded
 * @returns {Function} Middleware function
 */
function createRateLimiter(options) {
  const {
    windowMs = config.RATE_LIMIT_WINDOW_MS,
    max = config.RATE_LIMIT_MAX_REQUESTS,
    message = 'Too many requests, please try again later',
  } = options;

  // Simple in-memory store
  const store = new Map();

  return async function rateLimiterMiddleware(request) {
    // Skip if rate limiting is disabled
    if (!config.RATE_LIMIT_ENABLED) {
      return null;
    }

    const ip = getClientIp(request);
    const key = `${ip}-${request.url}`;
    const now = Date.now();

    // Get or initialize record for this IP + endpoint
    let record = store.get(key);

    if (!record) {
      record = {
        count: 0,
        resetTime: now + windowMs,
      };
      store.set(key, record);
    }

    // Reset if window expired
    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + windowMs;
    }

    // Increment request count
    record.count++;

    // Check if limit exceeded
    if (record.count > max) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);

      logger.warn({
        ip,
        endpoint: request.url,
        count: record.count,
        limit: max,
      }, 'Rate limit exceeded');

      return NextResponse.json(
        {
          success: false,
          statusCode: 429,
          message,
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': max.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(record.resetTime).toISOString(),
          },
        }
      );
    }

    // Add rate limit headers to response
    const remaining = max - record.count;
    return {
      headers: {
        'X-RateLimit-Limit': max.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': new Date(record.resetTime).toISOString(),
      },
    };
  };

  // Cleanup old entries periodically
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now > record.resetTime + windowMs) {
        store.delete(key);
      }
    }
  }, windowMs);
}

/**
 * Global rate limiter (100 requests per 15 minutes)
 */
export const globalRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests, please try again later',
});

/**
 * Stock lock API rate limiter (20 requests per 15 minutes)
 * Prevents abuse of stock locking (locking entire inventory)
 */
export const stockLockRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: 'Stock locking rate limit exceeded, please wait before trying again',
});

/**
 * Payment API rate limiter (30 requests per 15 minutes)
 * Prevents payment-related abuse while allowing legitimate retries
 */
export const paymentRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  message: 'Payment request limit exceeded, please try again later',
});

/**
 * Authentication API rate limiter (10 requests per 15 minutes)
 * Prevents brute force attacks
 */
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many authentication attempts, please wait 15 minutes',
});

/**
 * Webhook rate limiter (100 requests per minute)
 * Allow Razorpay retries but prevent DDoS
 */
export const webhookRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: 'Webhook rate limit exceeded',
});

/**
 * Apply rate limiter to Next.js API route
 *
 * Usage in API route:
 *
 * ```
 * export async function POST(request) {
 *   const rateLimitResult = await applyRateLimit(request, paymentRateLimiter);
 *   if (rateLimitResult) return rateLimitResult;
 *
 *   // Your API logic here
 * }
 * ```
 */
export async function applyRateLimit(request, limiter) {
  const result = await limiter(request);

  // If result is a Response object, rate limit was exceeded
  if (result && result instanceof NextResponse) {
    return result;
  }

  // Otherwise, rate limit passed (result contains headers to add)
  return null;
}

/**
 * Helper to get rate limit headers from limiter result
 */
export function getRateLimitHeaders(limiterResult) {
  if (limiterResult && limiterResult.headers) {
    return limiterResult.headers;
  }
  return {};
}
