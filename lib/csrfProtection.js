import crypto from 'crypto';
import logger from './logger.js';

/**
 * CSRF Protection using Double-Submit Cookie Pattern
 *
 * How it works:
 * 1. Generate CSRF token on session creation
 * 2. Store token in HTTP-only cookie AND return to client
 * 3. Client sends token in custom header (X-CSRF-Token) with requests
 * 4. Server validates: Cookie value matches header value
 * 5. If mismatch or missing: Reject request with 403
 */

/**
 * Generate a random CSRF token
 *
 * @returns {string} Random 32-byte hex string
 */
export function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Validate CSRF token from request
 *
 * Compares token in cookie with token in header
 *
 * @param {Request} request - Next.js request object
 * @returns {boolean} True if valid, false otherwise
 */
export function validateCsrfToken(request) {
  // Get token from cookie
  const cookies = request.headers.get('cookie');
  const csrfCookie = extractCsrfCookieValue(cookies);

  // Get token from header
  const csrfHeader = request.headers.get('x-csrf-token');

  // Both must exist and match
  if (!csrfCookie || !csrfHeader) {
    logger.warn(
      {
        hasCookie: !!csrfCookie,
        hasHeader: !!csrfHeader,
        url: request.url,
      },
      'CSRF validation failed: Missing token'
    );
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  const isValid = crypto.timingSafeEqual(
    Buffer.from(csrfCookie),
    Buffer.from(csrfHeader)
  );

  if (!isValid) {
    logger.warn(
      {
        url: request.url,
        method: request.method,
      },
      'CSRF validation failed: Token mismatch'
    );
  }

  return isValid;
}

/**
 * Extract CSRF token value from cookie string
 *
 * @param {string} cookieString - Cookie header value
 * @returns {string|null} CSRF token or null if not found
 */
function extractCsrfCookieValue(cookieString) {
  if (!cookieString) return null;

  const cookies = cookieString.split(';').map((c) => c.trim());
  const csrfCookie = cookies.find((c) => c.startsWith('csrf_token='));

  if (csrfCookie) {
    return csrfCookie.split('=')[1];
  }

  return null;
}

/**
 * Create Set-Cookie header for CSRF token
 *
 * @param {string} token - CSRF token to set
 * @param {Object} options - Cookie options
 * @returns {string} Set-Cookie header value
 */
export function createCsrfCookie(token, options = {}) {
  const {
    httpOnly = true,
    sameSite = 'strict',
    secure = process.env.NODE_ENV === 'production',
    maxAge = 3600, // 1 hour
  } = options;

  let cookie = `csrf_token=${token}`;
  cookie += `; Max-Age=${maxAge}`;
  cookie += `; Path=/`;
  cookie += `; SameSite=${sameSite}`;

  if (httpOnly) {
    cookie += `; HttpOnly`;
  }

  if (secure) {
    cookie += `; Secure`;
  }

  return cookie;
}

/**
 * Check if request method requires CSRF protection
 *
 * @param {string} method - HTTP method
 * @returns {boolean} True if CSRF protection required
 */
export function requiresCsrfProtection(method) {
  const protectedMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  return protectedMethods.includes(method.toUpperCase());
}

/**
 * Middleware helper for CSRF validation
 *
 * Usage in API route:
 * ```
 * export async function POST(request) {
 *   const csrfValid = await validateCsrfMiddleware(request);
 *   if (!csrfValid.valid) return csrfValid.response;
 *
 *   // Your API logic here
 * }
 * ```
 */
export async function validateCsrfMiddleware(request) {
  const method = request.method;

  // Skip CSRF check for safe methods
  if (!requiresCsrfProtection(method)) {
    return { valid: true };
  }

  // Validate CSRF token
  const isValid = validateCsrfToken(request);

  if (!isValid) {
    return {
      valid: false,
      response: new Response(
        JSON.stringify({
          success: false,
          statusCode: 403,
          message: 'CSRF token invalid or missing',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      ),
    };
  }

  return { valid: true };
}

/**
 * Skip CSRF validation for specific endpoints
 * (e.g., webhooks that use signature verification)
 */
export function shouldSkipCsrf(pathname) {
  const skipPaths = [
    '/api/webhooks', // Webhooks use signature verification
    '/api/health', // Public health check
  ];

  return skipPaths.some((path) => pathname.startsWith(path));
}
