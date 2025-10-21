import { z } from 'zod';

// Environment variable validation schema
const envSchema = z.object({
  // ============================================================================
  // REQUIRED VARIABLES
  // ============================================================================

  // Database
  MONGODB_URI: z
    .string()
    .min(1, 'MONGODB_URI is required')
    .refine(
      (val) => val.startsWith('mongodb://') || val.startsWith('mongodb+srv://'),
      'MONGODB_URI must start with mongodb:// or mongodb+srv://'
    ),

  // Authentication
  SECRET_KEY: z
    .string()
    .min(32, 'SECRET_KEY must be at least 32 characters for security'),

  // Payment Gateway (Razorpay)
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().min(1, 'NEXT_PUBLIC_RAZORPAY_KEY_ID is required'),
  RAZORPAY_KEY_SECRET: z.string().min(1, 'RAZORPAY_KEY_SECRET is required'),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1, 'RAZORPAY_WEBHOOK_SECRET is required'),

  // Application
  NEXT_PUBLIC_BASE_URL: z.string().url('NEXT_PUBLIC_BASE_URL must be a valid URL'),

  // ============================================================================
  // REQUIRED FOR PRODUCTION (Warning in development)
  // ============================================================================

  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  NODE_ENV: z
    .enum(['development', 'production', 'test', 'staging'])
    .default('development'),

  // ============================================================================
  // EMAIL CONFIGURATION (Required if email features enabled)
  // ============================================================================

  NODEMAILER_HOST: z.string().optional(),
  NODEMAILER_PORT: z
    .string()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .refine((val) => val === undefined || (val >= 1 && val <= 65535),
      'NODEMAILER_PORT must be between 1 and 65535')
    .optional(),
  NODEMAILER_EMAIL: z.string().email().optional(),
  NODEMAILER_PASSWORD: z.string().optional(),

  // ============================================================================
  // OPTIONAL WITH DEFAULTS
  // ============================================================================

  // Database
  MONGODB_DB_NAME: z.string().default('ecommerce-production'),

  // Logging
  LOG_LEVEL: z
    .enum(['error', 'warn', 'info', 'debug'])
    .default(process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  LOG_FILE_PATH: z.string().optional(),

  // Stock Management
  STOCK_LOCK_EXPIRY_MINUTES: z
    .string()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine((val) => val > 0, 'STOCK_LOCK_EXPIRY_MINUTES must be positive')
    .default('10'),

  STOCK_CLEANUP_INTERVAL_MINUTES: z
    .string()
    .transform((val) => (val ? parseInt(val, 10) : 5))
    .refine((val) => val > 0, 'STOCK_CLEANUP_INTERVAL_MINUTES must be positive')
    .default('5'),

  STOCK_CLEANUP_ENABLED: z
    .string()
    .transform((val) => val !== 'false')
    .default('true'),

  // Rate Limiting
  RATE_LIMIT_ENABLED: z
    .string()
    .transform((val) => val !== 'false')
    .default('true'),

  RATE_LIMIT_WINDOW_MS: z
    .string()
    .transform((val) => (val ? parseInt(val, 10) : 900000))
    .default('900000'),

  RATE_LIMIT_MAX_REQUESTS: z
    .string()
    .transform((val) => (val ? parseInt(val, 10) : 100))
    .default('100'),

  // Currency
  DEFAULT_CURRENCY: z
    .string()
    .length(3, 'DEFAULT_CURRENCY must be a 3-letter ISO 4217 code')
    .default('INR'),

  // ============================================================================
  // CLOUDINARY (Optional - for image uploads)
  // ============================================================================

  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional(),
  NEXT_PUBLIC_CLOUDINARY_API_KEY: z.string().optional(),
  NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: z.string().optional(),
  CLOUDINARY_SECRET_KEY: z.string().optional(),

  // Sentry (optional)
  SENTRY_AUTH_TOKEN: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
});

/**
 * Validates environment variables and returns a typed config object
 * @throws {Error} If validation fails with detailed error messages
 */
export function validateEnv() {
  try {
    const validated = envSchema.parse(process.env);

    // Additional validation: cleanup interval must be less than lock expiry
    if (validated.STOCK_CLEANUP_INTERVAL_MINUTES >= validated.STOCK_LOCK_EXPIRY_MINUTES) {
      throw new Error(
        `STOCK_CLEANUP_INTERVAL_MINUTES (${validated.STOCK_CLEANUP_INTERVAL_MINUTES}) must be less than STOCK_LOCK_EXPIRY_MINUTES (${validated.STOCK_LOCK_EXPIRY_MINUTES})`
      );
    }

    // Warn if Sentry not configured in production
    if (validated.NODE_ENV === 'production' && !validated.NEXT_PUBLIC_SENTRY_DSN) {
      console.warn('⚠️  Warning: NEXT_PUBLIC_SENTRY_DSN not configured. Error monitoring disabled in production.');
    }

    // Warn if email not configured
    if (!validated.NODEMAILER_HOST || !validated.NODEMAILER_EMAIL) {
      console.warn('⚠️  Warning: Email configuration incomplete. Order confirmation emails will fail.');
    }

    return validated;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('\n❌ Environment validation failed:\n');

      const missingRequired = [];
      const invalidValues = [];

      error.errors.forEach((err) => {
        const field = err.path.join('.');
        if (err.code === 'invalid_type' && err.received === 'undefined') {
          missingRequired.push(`  - ${field}: ${err.message}`);
        } else {
          invalidValues.push(`  - ${field}: ${err.message}`);
        }
      });

      if (missingRequired.length > 0) {
        console.error('Missing required variables:');
        missingRequired.forEach((msg) => console.error(msg));
        console.error('');
      }

      if (invalidValues.length > 0) {
        console.error('Invalid variables:');
        invalidValues.forEach((msg) => console.error(msg));
        console.error('');
      }

      console.error('See .env.example for complete configuration template.');
      console.error('Generate SECRET_KEY with: openssl rand -hex 32\n');

      process.exit(1);
    }

    // Re-throw unexpected errors
    throw error;
  }
}

// Export validated config
let config;

try {
  config = validateEnv();
} catch (error) {
  // Error already logged by validateEnv
  process.exit(1);
}

export { config };

// Export helper functions for environment detection
export const isProduction = config.NODE_ENV === 'production';
export const isDevelopment = config.NODE_ENV === 'development';
export const isTest = config.NODE_ENV === 'test';
export const isStaging = config.NODE_ENV === 'staging';
