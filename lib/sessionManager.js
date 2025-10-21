import { SignJWT, jwtVerify } from 'jose';
import { config } from './envConfig.js';
import logger from './logger.js';
import crypto from 'crypto';

/**
 * Session Manager for Checkout Flow
 *
 * Manages checkout sessions for both authenticated users and guests
 * Prevents unauthorized payment API access
 */

// In-memory session store (use Redis in production for multi-instance deployments)
const sessionStore = new Map();

// Session expiry: 1 hour
const SESSION_EXPIRY_MS = 60 * 60 * 1000;

/**
 * Generate a hash of cart items for validation
 * Prevents session reuse with different items
 */
function hashCartItems(cartItems) {
  const normalized = JSON.stringify(
    cartItems.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
    }))
  );
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Create a checkout session token
 *
 * @param {Object} params - Session parameters
 * @param {Array} params.cartItems - Array of cart items
 * @param {string} params.userId - User ID (null for guests)
 * @returns {Promise<string>} Session token (JWT)
 */
export async function createCheckoutSession({ cartItems, userId = null }) {
  const sessionId = crypto.randomUUID();
  const cartHash = hashCartItems(cartItems);
  const createdAt = Date.now();
  const expiresAt = createdAt + SESSION_EXPIRY_MS;

  // Store session in memory
  sessionStore.set(sessionId, {
    sessionId,
    cartHash,
    userId,
    createdAt,
    expiresAt,
    used: false,
  });

  // Create JWT token
  const secret = new TextEncoder().encode(config.SECRET_KEY);
  const token = await new SignJWT({
    sessionId,
    cartHash,
    userId,
    createdAt,
    expiresAt,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(secret);

  logger.info(
    {
      sessionId,
      userId,
      itemCount: cartItems.length,
      expiresAt: new Date(expiresAt).toISOString(),
    },
    'Checkout session created'
  );

  // Cleanup expired sessions periodically
  cleanupExpiredSessions();

  return { token, sessionId, expiresAt };
}

/**
 * Validate a checkout session token
 *
 * @param {string} token - Session token to validate
 * @param {Array} currentCartItems - Current cart items to verify against
 * @returns {Promise<Object|null>} Session data if valid, null if invalid
 */
export async function validateCheckoutSession(token, currentCartItems) {
  if (!token) {
    logger.warn('Session validation failed: No token provided');
    return null;
  }

  try {
    // Verify JWT signature and expiration
    const secret = new TextEncoder().encode(config.SECRET_KEY);
    const { payload } = await jwtVerify(token, secret);

    const { sessionId, cartHash, userId, createdAt, expiresAt } = payload;

    // Check if session exists in store
    const session = sessionStore.get(sessionId);
    if (!session) {
      logger.warn({ sessionId }, 'Session validation failed: Session not found in store');
      return null;
    }

    // Check if session is expired
    if (Date.now() > expiresAt) {
      sessionStore.delete(sessionId);
      logger.warn({ sessionId }, 'Session validation failed: Session expired');
      return null;
    }

    // Verify cart hash matches (prevents session reuse with different items)
    if (currentCartItems) {
      const currentHash = hashCartItems(currentCartItems);
      if (currentHash !== cartHash) {
        logger.warn(
          { sessionId, expectedHash: cartHash, actualHash: currentHash },
          'Session validation failed: Cart mismatch'
        );
        return null;
      }
    }

    logger.debug({ sessionId, userId }, 'Session validated successfully');

    return {
      sessionId,
      cartHash,
      userId,
      createdAt,
      expiresAt,
    };
  } catch (error) {
    logger.warn({ error: error.message }, 'Session validation failed: Invalid token');
    return null;
  }
}

/**
 * Mark a session as used (for single-use operations)
 *
 * @param {string} sessionId - Session ID to mark as used
 */
export function markSessionUsed(sessionId) {
  const session = sessionStore.get(sessionId);
  if (session) {
    session.used = true;
    logger.debug({ sessionId }, 'Session marked as used');
  }
}

/**
 * Check if a session has been used
 *
 * @param {string} sessionId - Session ID to check
 * @returns {boolean} True if session has been used
 */
export function isSessionUsed(sessionId) {
  const session = sessionStore.get(sessionId);
  return session ? session.used : true;
}

/**
 * Invalidate/delete a session
 *
 * @param {string} sessionId - Session ID to invalidate
 */
export function invalidateSession(sessionId) {
  const deleted = sessionStore.delete(sessionId);
  if (deleted) {
    logger.info({ sessionId }, 'Session invalidated');
  }
  return deleted;
}

/**
 * Cleanup expired sessions from memory
 * Runs periodically to prevent memory leaks
 */
function cleanupExpiredSessions() {
  const now = Date.now();
  let cleanedCount = 0;

  for (const [sessionId, session] of sessionStore.entries()) {
    if (now > session.expiresAt) {
      sessionStore.delete(sessionId);
      cleanedCount++;
    }
  }

  if (cleanedCount > 0) {
    logger.debug({ cleanedCount }, 'Expired sessions cleaned up');
  }
}

// Run cleanup every 10 minutes
setInterval(cleanupExpiredSessions, 10 * 60 * 1000);

/**
 * Get session statistics (for monitoring/debugging)
 */
export function getSessionStats() {
  const now = Date.now();
  let activeCount = 0;
  let expiredCount = 0;

  for (const session of sessionStore.values()) {
    if (now > session.expiresAt) {
      expiredCount++;
    } else {
      activeCount++;
    }
  }

  return {
    total: sessionStore.size,
    active: activeCount,
    expired: expiredCount,
  };
}
