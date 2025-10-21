/**
 * Performance Monitoring Utilities
 *
 * Track API performance, database queries, and system metrics
 */

import logger from './logger';

/**
 * Performance thresholds (in milliseconds)
 */
const THRESHOLDS = {
  API_SLOW: 1000,        // API requests > 1s are slow
  API_CRITICAL: 3000,    // API requests > 3s are critical
  DB_SLOW: 100,          // DB queries > 100ms are slow
  DB_CRITICAL: 500,      // DB queries > 500ms are critical
};

/**
 * Track API endpoint performance
 */
class PerformanceTracker {
  constructor() {
    this.metrics = new Map();
  }

  /**
   * Record an API request metric
   */
  recordRequest(endpoint, duration, statusCode) {
    if (!this.metrics.has(endpoint)) {
      this.metrics.set(endpoint, {
        count: 0,
        totalDuration: 0,
        minDuration: Infinity,
        maxDuration: 0,
        errors: 0,
        slowRequests: 0,
      });
    }

    const metric = this.metrics.get(endpoint);
    metric.count++;
    metric.totalDuration += duration;
    metric.minDuration = Math.min(metric.minDuration, duration);
    metric.maxDuration = Math.max(metric.maxDuration, duration);

    if (statusCode >= 400) {
      metric.errors++;
    }

    if (duration > THRESHOLDS.API_SLOW) {
      metric.slowRequests++;
    }

    // Log if critically slow
    if (duration > THRESHOLDS.API_CRITICAL) {
      logger.error({
        endpoint,
        duration: `${duration}ms`,
        statusCode,
      }, 'Critical: Extremely slow API request');
    }
  }

  /**
   * Get metrics for an endpoint
   */
  getMetrics(endpoint) {
    const metric = this.metrics.get(endpoint);
    if (!metric) return null;

    return {
      endpoint,
      totalRequests: metric.count,
      averageDuration: Math.round(metric.totalDuration / metric.count),
      minDuration: metric.minDuration,
      maxDuration: metric.maxDuration,
      errorRate: ((metric.errors / metric.count) * 100).toFixed(2) + '%',
      slowRequestRate: ((metric.slowRequests / metric.count) * 100).toFixed(2) + '%',
    };
  }

  /**
   * Get all metrics
   */
  getAllMetrics() {
    const allMetrics = [];
    for (const endpoint of this.metrics.keys()) {
      allMetrics.push(this.getMetrics(endpoint));
    }
    return allMetrics.sort((a, b) => b.totalRequests - a.totalRequests);
  }

  /**
   * Reset metrics
   */
  reset() {
    this.metrics.clear();
  }
}

// Global performance tracker instance
const performanceTracker = new PerformanceTracker();

/**
 * Timer utility for measuring execution time
 */
export class Timer {
  constructor(label) {
    this.label = label;
    this.startTime = Date.now();
  }

  /**
   * Stop timer and return duration
   */
  stop() {
    const duration = Date.now() - this.startTime;
    return duration;
  }

  /**
   * Stop timer and log result
   */
  stopAndLog(level = 'info') {
    const duration = this.stop();
    const logData = {
      operation: this.label,
      duration: `${duration}ms`,
    };

    if (duration > THRESHOLDS.API_CRITICAL) {
      logger.error(logData, `Critical: ${this.label} took too long`);
    } else if (duration > THRESHOLDS.API_SLOW) {
      logger.warn(logData, `Warning: ${this.label} was slow`);
    } else if (level === 'debug') {
      logger.debug(logData, `${this.label} completed`);
    }

    return duration;
  }
}

/**
 * Measure async function execution time
 *
 * Usage:
 * const result = await measureAsync('Database query', async () => {
 *   return await User.find();
 * });
 */
export async function measureAsync(label, fn) {
  const timer = new Timer(label);
  try {
    const result = await fn();
    timer.stopAndLog('debug');
    return result;
  } catch (error) {
    const duration = timer.stop();
    logger.error({
      operation: label,
      duration: `${duration}ms`,
      error: error.message,
    }, `${label} failed`);
    throw error;
  }
}

/**
 * Measure database query performance
 *
 * Usage:
 * const users = await measureDbQuery('User.find', () => User.find());
 */
export async function measureDbQuery(label, query) {
  const startTime = Date.now();
  try {
    const result = await query();
    const duration = Date.now() - startTime;

    const logData = {
      query: label,
      duration: `${duration}ms`,
    };

    if (duration > THRESHOLDS.DB_CRITICAL) {
      logger.error(logData, 'Critical: Very slow database query');
    } else if (duration > THRESHOLDS.DB_SLOW) {
      logger.warn(logData, 'Warning: Slow database query');
    } else {
      logger.debug(logData, 'Database query executed');
    }

    return result;
  } catch (error) {
    logger.error({
      query: label,
      error: error.message,
    }, 'Database query failed');
    throw error;
  }
}

/**
 * Track API request performance
 *
 * Usage in API route:
 * export const GET = trackPerformance(async (request) => {
 *   // Your handler
 * });
 */
export function trackPerformance(handler) {
  return async (request, context) => {
    const startTime = Date.now();
    const endpoint = request.nextUrl?.pathname || 'unknown';

    try {
      const response = await handler(request, context);
      const duration = Date.now() - startTime;

      // Record metrics
      performanceTracker.recordRequest(endpoint, duration, response.status);

      // Log if slow
      if (duration > THRESHOLDS.API_SLOW) {
        logger.warn({
          endpoint,
          duration: `${duration}ms`,
          status: response.status,
        }, 'Slow API request detected');
      }

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      performanceTracker.recordRequest(endpoint, duration, 500);
      throw error;
    }
  };
}

/**
 * Get current performance metrics
 */
export function getPerformanceMetrics() {
  return {
    endpoints: performanceTracker.getAllMetrics(),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Reset performance metrics
 */
export function resetPerformanceMetrics() {
  performanceTracker.reset();
}

/**
 * Memory usage monitor
 */
export function getMemoryUsage() {
  const usage = process.memoryUsage();
  return {
    heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)} MB`,
    rss: `${Math.round(usage.rss / 1024 / 1024)} MB`,
    external: `${Math.round(usage.external / 1024 / 1024)} MB`,
    heapUsedPercentage: Math.round((usage.heapUsed / usage.heapTotal) * 100),
  };
}

/**
 * Check if memory usage is high
 */
export function isMemoryHigh() {
  const usage = process.memoryUsage();
  const heapUsedPercentage = (usage.heapUsed / usage.heapTotal) * 100;

  if (heapUsedPercentage > 90) {
    logger.error({
      memory: getMemoryUsage(),
    }, 'Critical: Memory usage above 90%');
    return true;
  } else if (heapUsedPercentage > 80) {
    logger.warn({
      memory: getMemoryUsage(),
    }, 'Warning: Memory usage above 80%');
    return true;
  }

  return false;
}

/**
 * Monitor memory periodically
 *
 * Call this in server startup to monitor memory
 */
export function startMemoryMonitoring(intervalMinutes = 15) {
  setInterval(() => {
    isMemoryHigh(); // This will log if memory is high
  }, intervalMinutes * 60 * 1000);

  logger.info({ intervalMinutes }, 'Memory monitoring started');
}

export default {
  Timer,
  measureAsync,
  measureDbQuery,
  trackPerformance,
  getPerformanceMetrics,
  resetPerformanceMetrics,
  getMemoryUsage,
  isMemoryHigh,
  startMemoryMonitoring,
};
