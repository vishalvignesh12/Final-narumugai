import cron from 'node-cron';
import { connectDB } from './databaseConnection.js';
import ProductModel from '../models/Product.model.js';
import ProductVariantModel from '../models/ProductVariant.model.js';
import { config } from './envConfig.js';
import logger from './logger.js';
import * as Sentry from '@sentry/nextjs';

/**
 * Stock Lock Cleanup Job
 *
 * Releases expired stock locks automatically
 * Runs every 5 minutes (configurable)
 * Prevents permanent stock lockout when users abandon checkout
 */

let cleanupJob = null;

/**
 * Clean up expired stock locks
 * @returns {Promise<Object>} Cleanup results
 */
export async function cleanupExpiredLocks() {
  const startTime = Date.now();
  const now = new Date();

  logger.info('Starting stock lock cleanup job');

  try {
    await connectDB();

    const results = {
      productsChecked: 0,
      variantsChecked: 0,
      productsUnlocked: 0,
      variantsUnlocked: 0,
      totalQuantityReleased: 0,
      errors: [],
    };

    // Find and unlock expired locks in Products
    const expiredProducts = await ProductModel.find({
      lockedQuantity: { $gt: 0 },
      lockExpiresAt: { $lte: now },
    });

    results.productsChecked = expiredProducts.length;

    for (const product of expiredProducts) {
      try {
        const quantityToRelease = product.lockedQuantity;

        await ProductModel.findByIdAndUpdate(product._id, {
          $set: {
            lockedQuantity: 0,
            lockExpiresAt: null,
          },
          $inc: {
            quantity: quantityToRelease,
          },
        });

        // Make product available again if it has stock
        if (!product.isAvailable && product.quantity + quantityToRelease > 0) {
          await ProductModel.findByIdAndUpdate(product._id, {
            isAvailable: true,
            $unset: { soldAt: 1 },
          });
        }

        results.productsUnlocked++;
        results.totalQuantityReleased += quantityToRelease;

        logger.debug({
          productId: product._id,
          productName: product.name,
          quantityReleased: quantityToRelease,
        }, 'Product lock released');

      } catch (error) {
        results.errors.push({
          productId: product._id,
          error: error.message,
        });
        logger.error({
          productId: product._id,
          error: error.message,
        }, 'Failed to unlock product');
      }
    }

    // Find and unlock expired locks in ProductVariants
    const expiredVariants = await ProductVariantModel.find({
      lockedQuantity: { $gt: 0 },
      lockExpiresAt: { $lte: now },
    }).populate('product', 'name isAvailable');

    results.variantsChecked = expiredVariants.length;

    for (const variant of expiredVariants) {
      try {
        const quantityToRelease = variant.lockedQuantity;

        await ProductVariantModel.findByIdAndUpdate(variant._id, {
          $set: {
            lockedQuantity: 0,
            lockExpiresAt: null,
          },
          $inc: {
            quantity: quantityToRelease,
          },
        });

        // Make product available again if it has stock
        if (variant.product && !variant.product.isAvailable && variant.quantity + quantityToRelease > 0) {
          await ProductModel.findByIdAndUpdate(variant.product._id, {
            isAvailable: true,
            $unset: { soldAt: 1 },
          });
        }

        results.variantsUnlocked++;
        results.totalQuantityReleased += quantityToRelease;

        logger.debug({
          variantId: variant._id,
          productName: variant.product?.name,
          quantityReleased: quantityToRelease,
        }, 'Variant lock released');

      } catch (error) {
        results.errors.push({
          variantId: variant._id,
          error: error.message,
        });
        logger.error({
          variantId: variant._id,
          error: error.message,
        }, 'Failed to unlock variant');
      }
    }

    const duration = Date.now() - startTime;

    logger.info({
      duration,
      productsChecked: results.productsChecked,
      variantsChecked: results.variantsChecked,
      productsUnlocked: results.productsUnlocked,
      variantsUnlocked: results.variantsUnlocked,
      totalQuantityReleased: results.totalQuantityReleased,
      errorCount: results.errors.length,
    }, 'Stock lock cleanup completed');

    return results;

  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error({
      error: error.message,
      stack: error.stack,
      duration,
    }, 'Stock lock cleanup job failed');

    // Send to Sentry
    if (config.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error, {
        tags: { job: 'stock-cleanup' },
      });
    }

    throw error;
  }
}

/**
 * Start the stock cleanup cron job
 */
export function startStockCleanupJob() {
  if (!config.STOCK_CLEANUP_ENABLED) {
    logger.info('Stock cleanup job is disabled via configuration');
    return;
  }

  if (cleanupJob) {
    logger.warn('Stock cleanup job already running');
    return;
  }

  const intervalMinutes = config.STOCK_CLEANUP_INTERVAL_MINUTES;
  const cronExpression = `*/${intervalMinutes} * * * *`;

  logger.info({
    intervalMinutes,
    cronExpression,
    lockExpiryMinutes: config.STOCK_LOCK_EXPIRY_MINUTES,
  }, 'Starting stock cleanup cron job');

  cleanupJob = cron.schedule(cronExpression, async () => {
    try {
      await cleanupExpiredLocks();
    } catch (error) {
      // Error already logged in cleanupExpiredLocks
      logger.error('Cron job execution failed');
    }
  });

  logger.info('Stock cleanup cron job started successfully');
}

/**
 * Stop the stock cleanup cron job
 */
export function stopStockCleanupJob() {
  if (cleanupJob) {
    cleanupJob.stop();
    cleanupJob = null;
    logger.info('Stock cleanup cron job stopped');
  }
}

/**
 * Get cleanup job status
 */
export function getCleanupJobStatus() {
  return {
    running: cleanupJob !== null,
    enabled: config.STOCK_CLEANUP_ENABLED,
    intervalMinutes: config.STOCK_CLEANUP_INTERVAL_MINUTES,
    lockExpiryMinutes: config.STOCK_LOCK_EXPIRY_MINUTES,
  };
}
