/**
 * Request Validation Utilities
 *
 * Common validation schemas and helpers for API requests
 */

import { z } from 'zod';
import { ApiErrors } from './apiErrorHandler';

/**
 * Common validation schemas
 */

// MongoDB ObjectId validation
export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

// Email validation
export const emailSchema = z.string().email('Invalid email format').toLowerCase();

// Phone validation (Indian format)
export const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number');

// Password validation (min 8 chars, at least one letter and one number)
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Password must contain at least one letter and one number');

// Pagination validation
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Sort validation
export const sortSchema = z.object({
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Search query validation
export const searchSchema = z.object({
  q: z.string().min(1).max(100).optional(),
});

// Date range validation
export const dateRangeSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
}).refine(
  (data) => !data.startDate || !data.endDate || data.startDate <= data.endDate,
  'Start date must be before end date'
);

// Product quantity validation
export const quantitySchema = z.union([
  z.number().int().min(1, 'Quantity must be at least 1'),
  z.string().transform((val) => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 1) {
      throw new Error('Quantity must be a valid number >= 1');
    }
    return num;
  }),
]).default(1);

// Cart item validation
export const cartItemSchema = z.object({
  variantId: z.string().optional(), // Can be null for fallback variants
  quantity: quantitySchema,
});

// Address validation
export const addressSchema = z.object({
  fullName: z.string().min(2).max(100),
  phone: phoneSchema,
  email: emailSchema.optional(),
  addressLine1: z.string().min(5).max(200),
  addressLine2: z.string().max(200).optional(),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode'),
  country: z.string().default('India'),
});

/**
 * Validation helpers
 */

/**
 * Validate request body
 *
 * @param {Request} request - Next.js request
 * @param {z.Schema} schema - Zod schema
 * @returns {Promise<Object>} Validated data
 */
export async function validateBody(request, schema) {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      throw ApiErrors.validation('Request validation failed', errors);
    }

    return result.data;
  } catch (error) {
    if (error instanceof ApiErrors.constructor) {
      throw error;
    }
    throw ApiErrors.validation('Invalid request body');
  }
}

/**
 * Validate query parameters
 *
 * @param {Request} request - Next.js request
 * @param {z.Schema} schema - Zod schema
 * @returns {Object} Validated data
 */
export function validateQuery(request, schema) {
  const searchParams = request.nextUrl.searchParams;
  const queryObject = Object.fromEntries(searchParams.entries());

  const result = schema.safeParse(queryObject);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    throw ApiErrors.validation('Query validation failed', errors);
  }

  return result.data;
}

/**
 * Validate path parameters
 *
 * @param {Object} params - Route params
 * @param {z.Schema} schema - Zod schema
 * @returns {Object} Validated data
 */
export function validateParams(params, schema) {
  const result = schema.safeParse(params);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    throw ApiErrors.validation('Parameter validation failed', errors);
  }

  return result.data;
}

/**
 * Sanitize input to prevent injection attacks
 *
 * @param {string} input - Input string
 * @returns {string} Sanitized string
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;

  // Remove potential MongoDB operators
  return input.replace(/\$|{|}|\[|\]/g, '');
}

/**
 * Validate and sanitize search query
 *
 * @param {string} query - Search query
 * @returns {string} Sanitized query
 */
export function sanitizeSearchQuery(query) {
  if (!query) return '';

  // Remove special characters except spaces, letters, numbers, and common punctuation
  return query
    .replace(/[^\w\s\-.,]/g, '')
    .trim()
    .slice(0, 100); // Limit length
}

/**
 * Validate file upload
 *
 * @param {File} file - Uploaded file
 * @param {Object} options - Validation options
 * @returns {boolean} Whether file is valid
 */
export function validateFile(file, options = {}) {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  } = options;

  if (!file) {
    throw ApiErrors.validation('No file provided');
  }

  if (file.size > maxSize) {
    throw ApiErrors.validation(`File size exceeds ${maxSize / 1024 / 1024}MB`);
  }

  if (!allowedTypes.includes(file.type)) {
    throw ApiErrors.validation(`File type must be one of: ${allowedTypes.join(', ')}`);
  }

  return true;
}

/**
 * Validate multiple files
 *
 * @param {File[]} files - Uploaded files
 * @param {Object} options - Validation options
 * @returns {boolean} Whether all files are valid
 */
export function validateFiles(files, options = {}) {
  const { maxFiles = 10 } = options;

  if (!Array.isArray(files) || files.length === 0) {
    throw ApiErrors.validation('No files provided');
  }

  if (files.length > maxFiles) {
    throw ApiErrors.validation(`Maximum ${maxFiles} files allowed`);
  }

  files.forEach((file, index) => {
    try {
      validateFile(file, options);
    } catch (error) {
      throw ApiErrors.validation(`File ${index + 1}: ${error.message}`);
    }
  });

  return true;
}

/**
 * Validate array length
 *
 * @param {Array} array - Array to validate
 * @param {number} min - Minimum length
 * @param {number} max - Maximum length
 * @param {string} fieldName - Field name for error message
 */
export function validateArrayLength(array, min, max, fieldName = 'Array') {
  if (!Array.isArray(array)) {
    throw ApiErrors.validation(`${fieldName} must be an array`);
  }

  if (array.length < min) {
    throw ApiErrors.validation(`${fieldName} must have at least ${min} items`);
  }

  if (array.length > max) {
    throw ApiErrors.validation(`${fieldName} cannot have more than ${max} items`);
  }

  return true;
}

/**
 * Common validation schemas for specific routes
 */

// User registration validation
export const userRegistrationSchema = z.object({
  name: z.string().min(2).max(100),
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
});

// User login validation
export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

// Order creation validation
export const orderCreationSchema = z.object({
  items: z.array(cartItemSchema).min(1, 'At least one item required'),
  shippingAddress: addressSchema,
  couponCode: z.string().optional(),
  notes: z.string().max(500).optional(),
});

// Product creation validation
export const productCreationSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().min(10).max(5000),
  price: z.number().positive(),
  quantity: z.number().int().min(0),
  category: objectIdSchema,
  images: z.array(z.string().url()).min(1).max(10),
  isAvailable: z.boolean().default(true),
});

// Review creation validation
export const reviewCreationSchema = z.object({
  product: objectIdSchema,
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(1000),
});

/**
 * Export everything as default for easy imports
 */
export default {
  // Schemas
  objectIdSchema,
  emailSchema,
  phoneSchema,
  passwordSchema,
  paginationSchema,
  sortSchema,
  searchSchema,
  dateRangeSchema,
  quantitySchema,
  cartItemSchema,
  addressSchema,
  userRegistrationSchema,
  userLoginSchema,
  orderCreationSchema,
  productCreationSchema,
  reviewCreationSchema,

  // Helpers
  validateBody,
  validateQuery,
  validateParams,
  sanitizeInput,
  sanitizeSearchQuery,
  validateFile,
  validateFiles,
  validateArrayLength,
};
