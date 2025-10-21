import mongoose from 'mongoose';
import { config } from '@/lib/envConfig';
import { getCleanupJobStatus } from '@/lib/stockCleanupJob';

/**
 * GET /api/health
 *
 * Public health check endpoint for uptime monitoring
 * Checks critical services: database, configuration
 *
 * Returns 200 if healthy, 503 if unhealthy
 */

export async function GET(request) {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  const checks = {
    database: 'checking',
    configuration: 'checking',
    sentry: 'checking',
    cleanupJob: 'checking',
  };

  const errors = [];
  let isHealthy = true;

  try {
    // Check 1: Database connectivity
    try {
      const dbState = mongoose.connection.readyState;
      // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
      if (dbState === 1) {
        checks.database = 'healthy';
      } else {
        checks.database = 'unhealthy';
        errors.push(`Database connection state: ${dbState} (expected: 1)`);
        isHealthy = false;
      }
    } catch (error) {
      checks.database = 'unhealthy';
      errors.push(`Database check failed: ${error.message}`);
      isHealthy = false;
    }

    // Check 2: Configuration (critical env vars present)
    try {
      const requiredVars = [
        'MONGODB_URI',
        'SECRET_KEY',
        'NEXT_PUBLIC_RAZORPAY_KEY_ID',
        'RAZORPAY_KEY_SECRET',
      ];

      const missing = requiredVars.filter(varName => !config[varName]);

      if (missing.length === 0) {
        checks.configuration = 'healthy';
      } else {
        checks.configuration = 'unhealthy';
        errors.push(`Missing configuration: ${missing.join(', ')}`);
        isHealthy = false;
      }
    } catch (error) {
      checks.configuration = 'unhealthy';
      errors.push(`Configuration check failed: ${error.message}`);
      isHealthy = false;
    }

    // Check 3: Sentry (warning only, not critical)
    if (config.NEXT_PUBLIC_SENTRY_DSN) {
      checks.sentry = 'healthy';
    } else {
      checks.sentry = 'disabled';
      // Not critical for health, just a warning
    }

    // Check 4: Cleanup job status
    try {
      const jobStatus = getCleanupJobStatus();
      if (jobStatus.enabled && jobStatus.running) {
        checks.cleanupJob = 'healthy';
      } else if (!jobStatus.enabled) {
        checks.cleanupJob = 'disabled';
      } else {
        checks.cleanupJob = 'unhealthy';
        errors.push('Cleanup job is enabled but not running');
        // Not critical enough to mark as unhealthy
      }
    } catch (error) {
      checks.cleanupJob = 'unknown';
    }

    const duration = Date.now() - startTime;

    const responseData = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp,
      uptime: process.uptime(),
      duration,
      checks,
    };

    if (errors.length > 0) {
      responseData.errors = errors;
    }

    const statusCode = isHealthy ? 200 : 503;

    return new Response(JSON.stringify(responseData), {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    // Catastrophic failure
    return new Response(
      JSON.stringify({
        status: 'unhealthy',
        timestamp,
        error: error.message,
        checks,
        errors: [...errors, error.message],
      }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  }
}
