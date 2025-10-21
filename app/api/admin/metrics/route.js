import { isAuthenticated } from '@/lib/authentication';
import { response } from '@/lib/helperFunction';
import { handleApiError } from '@/lib/apiErrorHandler';
import { getPerformanceMetrics, getMemoryUsage } from '@/lib/performanceMonitor';
import logger from '@/lib/logger';

/**
 * GET /api/admin/metrics
 *
 * Admin-only performance metrics endpoint
 * Returns API performance metrics and system resource usage
 *
 * Provides:
 * - Endpoint performance statistics
 * - Memory usage
 * - Request counts and error rates
 * - Slow request detection
 */

export const GET = handleApiError(async (request) => {
  // Authenticate admin user
  const auth = await isAuthenticated('admin');
  if (!auth.isAuth) {
    logger.warn({ path: '/api/admin/metrics' }, 'Unauthorized metrics access attempt');
    return response(false, 401, 'Unauthorized - Admin access required');
  }

  try {
    // Get performance metrics
    const performanceMetrics = getPerformanceMetrics();

    // Get memory usage
    const memoryUsage = getMemoryUsage();

    // Calculate aggregate statistics
    const endpoints = performanceMetrics.endpoints || [];
    const totalRequests = endpoints.reduce((sum, ep) => sum + ep.totalRequests, 0);
    const averageResponseTime = endpoints.length > 0
      ? Math.round(endpoints.reduce((sum, ep) => sum + ep.averageDuration, 0) / endpoints.length)
      : 0;

    // Find slowest endpoints
    const slowestEndpoints = [...endpoints]
      .sort((a, b) => b.maxDuration - a.maxDuration)
      .slice(0, 5)
      .map(ep => ({
        endpoint: ep.endpoint,
        maxDuration: ep.maxDuration,
        averageDuration: ep.averageDuration,
        totalRequests: ep.totalRequests,
      }));

    // Find endpoints with highest error rates
    const errorProneEndpoints = [...endpoints]
      .filter(ep => parseFloat(ep.errorRate) > 0)
      .sort((a, b) => parseFloat(b.errorRate) - parseFloat(a.errorRate))
      .slice(0, 5)
      .map(ep => ({
        endpoint: ep.endpoint,
        errorRate: ep.errorRate,
        totalRequests: ep.totalRequests,
      }));

    const metricsData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalEndpoints: endpoints.length,
        totalRequests,
        averageResponseTime: `${averageResponseTime}ms`,
      },
      memory: memoryUsage,
      topEndpoints: endpoints.slice(0, 10), // Top 10 by request count
      slowestEndpoints,
      errorProneEndpoints: errorProneEndpoints.length > 0 ? errorProneEndpoints : null,
      recommendations: generateRecommendations(endpoints, memoryUsage),
    };

    logger.info({
      adminId: auth.userId,
      totalEndpoints: endpoints.length,
      totalRequests,
    }, 'Performance metrics accessed');

    return response(true, 200, 'Performance metrics retrieved', metricsData);

  } catch (error) {
    logger.error({
      error: error.message,
      stack: error.stack,
    }, 'Failed to retrieve performance metrics');

    return response(false, 500, 'Failed to retrieve metrics', {
      error: error.message,
    });
  }
});

/**
 * DELETE /api/admin/metrics
 *
 * Reset performance metrics
 * Useful for starting fresh monitoring after deployment
 */

export const DELETE = handleApiError(async (request) => {
  // Authenticate admin user
  const auth = await isAuthenticated('admin');
  if (!auth.isAuth) {
    logger.warn({ path: '/api/admin/metrics' }, 'Unauthorized metrics reset attempt');
    return response(false, 401, 'Unauthorized - Admin access required');
  }

  try {
    const { resetPerformanceMetrics } = await import('@/lib/performanceMonitor');
    resetPerformanceMetrics();

    logger.info({
      adminId: auth.userId,
    }, 'Performance metrics reset');

    return response(true, 200, 'Performance metrics reset successfully');

  } catch (error) {
    logger.error({
      error: error.message,
      stack: error.stack,
    }, 'Failed to reset performance metrics');

    return response(false, 500, 'Failed to reset metrics', {
      error: error.message,
    });
  }
});

/**
 * Generate performance recommendations based on metrics
 */
function generateRecommendations(endpoints, memoryUsage) {
  const recommendations = [];

  // Check memory usage
  if (memoryUsage.heapUsedPercentage > 80) {
    recommendations.push({
      type: 'MEMORY',
      severity: memoryUsage.heapUsedPercentage > 90 ? 'CRITICAL' : 'WARNING',
      message: `Memory usage is at ${memoryUsage.heapUsedPercentage}%. Consider scaling up or investigating memory leaks.`,
    });
  }

  // Check for slow endpoints
  const slowEndpoints = endpoints.filter(ep => ep.averageDuration > 1000);
  if (slowEndpoints.length > 0) {
    recommendations.push({
      type: 'PERFORMANCE',
      severity: 'WARNING',
      message: `${slowEndpoints.length} endpoint(s) have average response time > 1s. Consider optimization or caching.`,
      endpoints: slowEndpoints.map(ep => ep.endpoint),
    });
  }

  // Check for high error rates
  const errorProneEndpoints = endpoints.filter(ep => parseFloat(ep.errorRate) > 5);
  if (errorProneEndpoints.length > 0) {
    recommendations.push({
      type: 'ERROR_RATE',
      severity: 'WARNING',
      message: `${errorProneEndpoints.length} endpoint(s) have error rate > 5%. Investigate root causes.`,
      endpoints: errorProneEndpoints.map(ep => ({ endpoint: ep.endpoint, errorRate: ep.errorRate })),
    });
  }

  // Check for endpoints with high slow request rate
  const frequentlySlowEndpoints = endpoints.filter(ep => parseFloat(ep.slowRequestRate) > 20);
  if (frequentlySlowEndpoints.length > 0) {
    recommendations.push({
      type: 'SLOW_REQUESTS',
      severity: 'INFO',
      message: `${frequentlySlowEndpoints.length} endpoint(s) have > 20% slow requests. Consider database query optimization.`,
      endpoints: frequentlySlowEndpoints.map(ep => ep.endpoint),
    });
  }

  // If no issues found
  if (recommendations.length === 0) {
    recommendations.push({
      type: 'HEALTHY',
      severity: 'INFO',
      message: 'All systems performing within normal parameters.',
    });
  }

  return recommendations;
}
