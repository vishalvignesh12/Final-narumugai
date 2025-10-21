/**
 * Next.js Instrumentation Hook
 *
 * This file runs once when the Next.js server starts.
 * Used for:
 * - Environment variable validation
 * - Background job initialization
 * - One-time setup tasks
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run on Node.js runtime (not Edge)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('🚀 Initializing application...');

    // Step 1: Validate environment variables FIRST
    // This will exit the process if validation fails
    try {
      const { validateEnv } = await import('./lib/envConfig.js');
      validateEnv();
      console.log('✅ Environment variables validated');
    } catch (error) {
      console.error('❌ Environment validation failed');
      // validateEnv already logged details and called process.exit(1)
      return;
    }

    // Step 2: Initialize Sentry (if configured)
    // Sentry initialization happens automatically via config files
    // but we can verify it's configured
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      console.log('✅ Sentry error monitoring enabled');
    }

    // Step 3: Start background jobs
    // Stock cleanup job will be started here once created
    // Note: We'll update this in Phase 4 when creating the cleanup job
    console.log('✅ Application initialized successfully');
  }
}
