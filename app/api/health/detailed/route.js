import mongoose from 'mongoose';
import { isAuthenticated } from '@/lib/authentication';
import { connectDB } from '@/lib/databaseConnection';
import { response } from '@/lib/helperFunction';
import { config } from '@/lib/envConfig';
import { getCleanupJobStatus } from '@/lib/stockCleanupJob';
import logger from '@/lib/logger';
import OrderModel from '@/models/Order.model';
import ProductModel from '@/models/Product.model';
import ProductVariantModel from '@/models/ProductVariant.model';

/**
 * GET /api/health/detailed
 *
 * Admin-only detailed health check endpoint
 * Provides comprehensive system diagnostics for troubleshooting
 *
 * Returns:
 * - Database connection and stats
 * - Memory usage
 * - Active stock locks
 * - Pending orders count
 * - Cleanup job status
 * - Environment information
 */

export async function GET(request) {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  try {
    // Authenticate admin user
    const auth = await isAuthenticated('admin');
    if (!auth.isAuth) {
      logger.warn({ path: '/api/health/detailed' }, 'Unauthorized health check attempt');
      return response(false, 401, 'Unauthorized - Admin access required');
    }

    await connectDB();

    const diagnostics = {
      timestamp,
      environment: process.env.NODE_ENV || 'unknown',
    };

    const errors = [];

    // 1. Database diagnostics
    try {
      const dbState = mongoose.connection.readyState;
      const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];

      diagnostics.database = {
        state: dbStates[dbState] || 'unknown',
        stateCode: dbState,
        host: mongoose.connection.host || 'unknown',
        name: mongoose.connection.name || 'unknown',
      };

      // Get database stats (collection counts)
      if (dbState === 1) {
        try {
          const [productCount, orderCount, userCount] = await Promise.all([
            ProductModel.countDocuments(),
            OrderModel.countDocuments(),
            mongoose.connection.db.collection('users').countDocuments(),
          ]);

          diagnostics.database.collections = {
            products: productCount,
            orders: orderCount,
            users: userCount,
          };
        } catch (error) {
          errors.push(`Collection stats failed: ${error.message}`);
        }
      }
    } catch (error) {
      diagnostics.database = { error: error.message };
      errors.push(`Database diagnostics failed: ${error.message}`);
    }

    // 2. Memory usage
    try {
      const memUsage = process.memoryUsage();
      diagnostics.memory = {
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
        rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
        external: `${Math.round(memUsage.external / 1024 / 1024)} MB`,
        heapUsedPercentage: `${Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)}%`,
      };
    } catch (error) {
      diagnostics.memory = { error: error.message };
      errors.push(`Memory diagnostics failed: ${error.message}`);
    }

    // 3. Active stock locks
    try {
      const now = new Date();

      const [lockedProducts, lockedVariants] = await Promise.all([
        ProductModel.countDocuments({
          lockedQuantity: { $gt: 0 },
        }),
        ProductVariantModel.countDocuments({
          lockedQuantity: { $gt: 0 },
        }),
      ]);

      const [expiredProducts, expiredVariants] = await Promise.all([
        ProductModel.countDocuments({
          lockedQuantity: { $gt: 0 },
          lockExpiresAt: { $lte: now },
        }),
        ProductVariantModel.countDocuments({
          lockedQuantity: { $gt: 0 },
          lockExpiresAt: { $lte: now },
        }),
      ]);

      diagnostics.stockLocks = {
        active: {
          products: lockedProducts,
          variants: lockedVariants,
          total: lockedProducts + lockedVariants,
        },
        expired: {
          products: expiredProducts,
          variants: expiredVariants,
          total: expiredProducts + expiredVariants,
        },
      };

      if (diagnostics.stockLocks.expired.total > 0) {
        errors.push(`${diagnostics.stockLocks.expired.total} expired locks detected - cleanup job may need attention`);
      }
    } catch (error) {
      diagnostics.stockLocks = { error: error.message };
      errors.push(`Stock lock diagnostics failed: ${error.message}`);
    }

    // 4. Order statistics
    try {
      const orderStats = await OrderModel.aggregate([
        {
          $match: { deletedAt: null },
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]);

      diagnostics.orders = {
        byStatus: orderStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
      };

      // Count recent pending orders (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const recentPendingCount = await OrderModel.countDocuments({
        status: 'pending',
        createdAt: { $gte: yesterday },
        deletedAt: null,
      });

      diagnostics.orders.recentPending = recentPendingCount;
    } catch (error) {
      diagnostics.orders = { error: error.message };
      errors.push(`Order diagnostics failed: ${error.message}`);
    }

    // 5. Cleanup job status
    try {
      diagnostics.cleanupJob = getCleanupJobStatus();
    } catch (error) {
      diagnostics.cleanupJob = { error: error.message };
      errors.push(`Cleanup job status failed: ${error.message}`);
    }

    // 6. Configuration check
    try {
      diagnostics.configuration = {
        mongodbConfigured: !!config.MONGODB_URI,
        razorpayConfigured: !!(config.NEXT_PUBLIC_RAZORPAY_KEY_ID && config.RAZORPAY_KEY_SECRET),
        sentryConfigured: !!config.NEXT_PUBLIC_SENTRY_DSN,
        emailConfigured: !!(config.EMAIL_HOST && config.EMAIL_USER),
        stockCleanupEnabled: config.STOCK_CLEANUP_ENABLED,
        stockLockExpiryMinutes: config.STOCK_LOCK_EXPIRY_MINUTES,
      };
    } catch (error) {
      diagnostics.configuration = { error: error.message };
      errors.push(`Configuration check failed: ${error.message}`);
    }

    // 7. Uptime and performance
    diagnostics.system = {
      uptime: `${Math.floor(process.uptime() / 60)} minutes`,
      nodeVersion: process.version,
      platform: process.platform,
      responseTime: `${Date.now() - startTime}ms`,
    };

    // Final health status
    const isHealthy = errors.length === 0;

    const responseData = {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp,
      diagnostics,
    };

    if (errors.length > 0) {
      responseData.warnings = errors;
    }

    logger.info({
      adminId: auth.userId,
      status: responseData.status,
      errorCount: errors.length,
    }, 'Detailed health check performed');

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    logger.error({
      error: error.message,
      stack: error.stack,
    }, 'Detailed health check failed');

    return new Response(
      JSON.stringify({
        status: 'error',
        timestamp,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  }
}
