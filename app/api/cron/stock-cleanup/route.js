import { isAuthenticated } from '@/lib/authentication';
import { connectDB } from '@/lib/databaseConnection';
import { response } from '@/lib/helperFunction';
import { cleanupExpiredLocks, getCleanupJobStatus } from '@/lib/stockCleanupJob';
import logger from '@/lib/logger';
import { applyRateLimit, adminRateLimiter } from '@/lib/rateLimiter';

/**
 * POST /api/cron/stock-cleanup
 *
 * Admin-only manual stock cleanup trigger
 * Allows admins to manually release expired stock locks
 *
 * Use cases:
 * - Emergency stock release when cleanup job fails
 * - Troubleshooting lock issues
 * - Testing cleanup functionality
 * - Manual intervention needed
 *
 * Rate limited to prevent abuse
 */

export async function POST(request) {
  const startTime = Date.now();

  try {
    // Apply rate limiting (admins get higher limits but still rate limited)
    const rateLimitResult = await applyRateLimit(request, adminRateLimiter);
    if (rateLimitResult) return rateLimitResult;

    // Authenticate admin user
    const auth = await isAuthenticated('admin');
    if (!auth.isAuth) {
      logger.warn({ path: '/api/cron/stock-cleanup' }, 'Unauthorized cleanup attempt');
      return response(false, 401, 'Unauthorized - Admin access required');
    }

    await connectDB();

    logger.info({
      adminId: auth.userId,
      triggeredBy: 'manual',
    }, 'Manual stock cleanup triggered');

    // Run the cleanup function
    const results = await cleanupExpiredLocks();

    const duration = Date.now() - startTime;

    // Log the results
    logger.info({
      adminId: auth.userId,
      duration,
      results: {
        productsUnlocked: results.productsUnlocked,
        variantsUnlocked: results.variantsUnlocked,
        totalQuantityReleased: results.totalQuantityReleased,
        errorCount: results.errors?.length || 0,
      },
    }, 'Manual stock cleanup completed');

    return response(true, 200, 'Stock cleanup completed successfully', {
      results: {
        productsChecked: results.productsChecked,
        variantsChecked: results.variantsChecked,
        productsUnlocked: results.productsUnlocked,
        variantsUnlocked: results.variantsUnlocked,
        totalQuantityReleased: results.totalQuantityReleased,
        errors: results.errors || [],
        duration: `${duration}ms`,
      },
      jobStatus: getCleanupJobStatus(),
    });

  } catch (error) {
    logger.error({
      error: error.message,
      stack: error.stack,
    }, 'Manual stock cleanup failed');

    return response(false, 500, 'Stock cleanup failed', {
      error: error.message,
    });
  }
}

/**
 * GET /api/cron/stock-cleanup
 *
 * Admin-only cleanup job status check
 * Returns current status of the automatic cleanup job
 */

export async function GET(request) {
  try {
    // Apply rate limiting
    const rateLimitResult = await applyRateLimit(request, adminRateLimiter);
    if (rateLimitResult) return rateLimitResult;

    // Authenticate admin user
    const auth = await isAuthenticated('admin');
    if (!auth.isAuth) {
      logger.warn({ path: '/api/cron/stock-cleanup' }, 'Unauthorized status check attempt');
      return response(false, 401, 'Unauthorized - Admin access required');
    }

    const jobStatus = getCleanupJobStatus();

    return response(true, 200, 'Cleanup job status retrieved', {
      jobStatus,
    });

  } catch (error) {
    logger.error({
      error: error.message,
      stack: error.stack,
    }, 'Failed to get cleanup job status');

    return response(false, 500, 'Failed to get job status', {
      error: error.message,
    });
  }
}
