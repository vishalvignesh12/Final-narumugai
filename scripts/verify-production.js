#!/usr/bin/env node

/**
 * Production Verification Script
 *
 * Automated checks to verify production readiness
 * Run before deploying to production
 *
 * Usage: node scripts/verify-production.js [BASE_URL]
 * Example: node scripts/verify-production.js https://yourdomain.com
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.argv[2] || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const ADMIN_TOKEN = process.env.ADMIN_ACCESS_TOKEN || null;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

// Test results
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

/**
 * HTTP request helper
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const lib = urlObj.protocol === 'https:' ? https : http;

    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: options.timeout || 10000,
    };

    const req = lib.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data ? JSON.parse(data) : null,
            raw: data
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: null,
            raw: data
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

/**
 * Log test result
 */
function logTest(name, passed, message = '', isWarning = false) {
  const result = {
    name,
    passed,
    message,
    isWarning
  };

  results.tests.push(result);

  if (passed) {
    results.passed++;
    console.log(`${colors.green}✓${colors.reset} ${name}`);
  } else if (isWarning) {
    results.warnings++;
    console.log(`${colors.yellow}⚠${colors.reset} ${name} - ${message}`);
  } else {
    results.failed++;
    console.log(`${colors.red}✗${colors.reset} ${name} - ${message}`);
  }
}

/**
 * Test: Health endpoint
 */
async function testHealthEndpoint() {
  console.log(`\n${colors.bold}${colors.blue}Testing Health Endpoint${colors.reset}`);

  try {
    const response = await makeRequest(`${BASE_URL}/api/health`);

    logTest(
      'Health endpoint accessible',
      response.status === 200 || response.status === 503,
      response.status !== 200 && response.status !== 503 ? `Status: ${response.status}` : ''
    );

    if (response.data) {
      logTest(
        'Health endpoint returns JSON',
        response.data !== null,
        'Invalid JSON response'
      );

      if (response.data.status) {
        logTest(
          'Application is healthy',
          response.data.status === 'healthy',
          response.data.status !== 'healthy' ? `Status: ${response.data.status}` : ''
        );

        if (response.data.checks) {
          logTest(
            'Database connection healthy',
            response.data.checks.database === 'healthy',
            response.data.checks.database !== 'healthy' ? `DB Status: ${response.data.checks.database}` : ''
          );

          logTest(
            'Configuration check passed',
            response.data.checks.configuration === 'healthy',
            response.data.checks.configuration !== 'healthy' ? `Config Status: ${response.data.checks.configuration}` : ''
          );

          logTest(
            'Cleanup job status',
            response.data.checks.cleanupJob === 'healthy' || response.data.checks.cleanupJob === 'disabled',
            response.data.checks.cleanupJob === 'unhealthy' ? 'Cleanup job unhealthy' : '',
            response.data.checks.cleanupJob === 'disabled'
          );
        }
      }
    }
  } catch (error) {
    logTest('Health endpoint accessible', false, error.message);
  }
}

/**
 * Test: API connectivity
 */
async function testAPIConnectivity() {
  console.log(`\n${colors.bold}${colors.blue}Testing API Connectivity${colors.reset}`);

  try {
    const response = await makeRequest(`${BASE_URL}/api/products`);

    logTest(
      'Products API accessible',
      response.status === 200 || response.status === 404,
      response.status !== 200 && response.status !== 404 ? `Status: ${response.status}` : ''
    );

    if (response.data && response.status === 200) {
      logTest(
        'Products API returns data',
        response.data.success !== undefined,
        'Unexpected response format'
      );
    }
  } catch (error) {
    logTest('Products API accessible', false, error.message);
  }
}

/**
 * Test: Checkout session creation
 */
async function testCheckoutSession() {
  console.log(`\n${colors.bold}${colors.blue}Testing Checkout Session${colors.reset}`);

  try {
    const response = await makeRequest(`${BASE_URL}/api/checkout/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    logTest(
      'Checkout session API accessible',
      response.status === 200 || response.status === 201,
      response.status !== 200 && response.status !== 201 ? `Status: ${response.status}` : ''
    );

    if (response.data && response.data.success) {
      logTest(
        'Checkout session returns token',
        response.data.data && response.data.data.sessionToken,
        'No session token in response'
      );

      logTest(
        'CSRF token provided',
        response.data.data && response.data.data.csrfToken,
        'No CSRF token in response'
      );
    }
  } catch (error) {
    logTest('Checkout session API accessible', false, error.message);
  }
}

/**
 * Test: Admin endpoints (if token provided)
 */
async function testAdminEndpoints() {
  if (!ADMIN_TOKEN) {
    console.log(`\n${colors.yellow}⊘ Skipping admin endpoint tests (no ADMIN_ACCESS_TOKEN provided)${colors.reset}`);
    return;
  }

  console.log(`\n${colors.bold}${colors.blue}Testing Admin Endpoints${colors.reset}`);

  // Test detailed health check
  try {
    const response = await makeRequest(`${BASE_URL}/api/health/detailed`, {
      headers: {
        'Cookie': `access_token=${ADMIN_TOKEN}`
      }
    });

    logTest(
      'Detailed health endpoint accessible',
      response.status === 200,
      response.status !== 200 ? `Status: ${response.status}` : ''
    );

    if (response.data && response.data.diagnostics) {
      logTest(
        'Detailed diagnostics available',
        response.data.diagnostics.database && response.data.diagnostics.memory,
        'Missing diagnostic data'
      );

      if (response.data.diagnostics.stockLocks) {
        const expiredLocks = response.data.diagnostics.stockLocks.expired?.total || 0;
        logTest(
          'No expired stock locks',
          expiredLocks === 0,
          `${expiredLocks} expired locks detected`,
          expiredLocks > 0 && expiredLocks < 10
        );
      }
    }
  } catch (error) {
    logTest('Detailed health endpoint accessible', false, error.message);
  }

  // Test cleanup job status
  try {
    const response = await makeRequest(`${BASE_URL}/api/cron/stock-cleanup`, {
      headers: {
        'Cookie': `access_token=${ADMIN_TOKEN}`
      }
    });

    logTest(
      'Cleanup job status endpoint accessible',
      response.status === 200,
      response.status !== 200 ? `Status: ${response.status}` : ''
    );

    if (response.data && response.data.data && response.data.data.jobStatus) {
      const status = response.data.data.jobStatus;

      logTest(
        'Cleanup job is enabled',
        status.enabled === true,
        'Cleanup job is disabled - stock locks may not be released',
        !status.enabled
      );

      logTest(
        'Cleanup job is running',
        status.running === true,
        'Cleanup job is not running - stock locks will not be released automatically',
        !status.running
      );
    }
  } catch (error) {
    logTest('Cleanup job status endpoint accessible', false, error.message);
  }
}

/**
 * Test: Environment configuration
 */
async function testEnvironment() {
  console.log(`\n${colors.bold}${colors.blue}Testing Environment Configuration${colors.reset}`);

  const requiredVars = [
    'MONGODB_URI',
    'SECRET_KEY',
    'NEXT_PUBLIC_RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'RAZORPAY_WEBHOOK_SECRET',
    'EMAIL_HOST',
    'EMAIL_USER',
  ];

  // Note: Can't directly check server environment variables from client
  // This is a placeholder for manual verification
  console.log(`${colors.yellow}⊘ Manual verification required for environment variables:${colors.reset}`);
  requiredVars.forEach(varName => {
    console.log(`  - ${varName}`);
  });

  logTest(
    'Environment variables configured',
    true,
    'Manually verify all required environment variables are set',
    true
  );
}

/**
 * Test: Performance
 */
async function testPerformance() {
  console.log(`\n${colors.bold}${colors.blue}Testing Performance${colors.reset}`);

  try {
    const startTime = Date.now();
    await makeRequest(`${BASE_URL}/api/health`);
    const duration = Date.now() - startTime;

    logTest(
      'Health endpoint response time < 500ms',
      duration < 500,
      `Response time: ${duration}ms`,
      duration >= 500 && duration < 1000
    );
  } catch (error) {
    logTest('Health endpoint response time', false, error.message);
  }

  try {
    const startTime = Date.now();
    await makeRequest(`${BASE_URL}/api/products`);
    const duration = Date.now() - startTime;

    logTest(
      'Products API response time < 1000ms',
      duration < 1000,
      `Response time: ${duration}ms`,
      duration >= 1000 && duration < 2000
    );
  } catch (error) {
    logTest('Products API response time', false, error.message);
  }
}

/**
 * Test: Security headers
 */
async function testSecurityHeaders() {
  console.log(`\n${colors.bold}${colors.blue}Testing Security Configuration${colors.reset}`);

  try {
    const response = await makeRequest(`${BASE_URL}`);

    logTest(
      'X-Frame-Options header present',
      response.headers['x-frame-options'] !== undefined,
      'Missing X-Frame-Options header',
      true
    );

    logTest(
      'X-Content-Type-Options header present',
      response.headers['x-content-type-options'] !== undefined,
      'Missing X-Content-Type-Options header',
      true
    );

    logTest(
      'HTTPS enabled',
      BASE_URL.startsWith('https://'),
      'Not using HTTPS - insecure!',
      BASE_URL.startsWith('http://localhost')
    );
  } catch (error) {
    logTest('Security headers check', false, error.message);
  }
}

/**
 * Print summary
 */
function printSummary() {
  console.log(`\n${colors.bold}${'='.repeat(50)}${colors.reset}`);
  console.log(`${colors.bold}Verification Summary${colors.reset}`);
  console.log(`${'='.repeat(50)}`);

  console.log(`\n${colors.green}Passed:${colors.reset} ${results.passed}`);
  console.log(`${colors.yellow}Warnings:${colors.reset} ${results.warnings}`);
  console.log(`${colors.red}Failed:${colors.reset} ${results.failed}`);

  const total = results.passed + results.warnings + results.failed;
  const successRate = total > 0 ? Math.round((results.passed / total) * 100) : 0;

  console.log(`\n${colors.bold}Success Rate:${colors.reset} ${successRate}%`);

  if (results.failed === 0) {
    console.log(`\n${colors.green}${colors.bold}✓ All critical tests passed!${colors.reset}`);

    if (results.warnings > 0) {
      console.log(`${colors.yellow}⚠ ${results.warnings} warning(s) detected - review before going live${colors.reset}`);
    } else {
      console.log(`${colors.green}${colors.bold}✓ Ready for production deployment!${colors.reset}`);
    }
  } else {
    console.log(`\n${colors.red}${colors.bold}✗ ${results.failed} critical test(s) failed${colors.reset}`);
    console.log(`${colors.red}${colors.bold}✗ NOT ready for production deployment${colors.reset}`);

    console.log(`\n${colors.bold}Failed Tests:${colors.reset}`);
    results.tests
      .filter(t => !t.passed && !t.isWarning)
      .forEach(t => {
        console.log(`  ${colors.red}✗${colors.reset} ${t.name}: ${t.message}`);
      });
  }

  console.log(`\n${colors.blue}For detailed troubleshooting, see docs/TROUBLESHOOTING.md${colors.reset}`);

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

/**
 * Main execution
 */
async function main() {
  console.log(`${colors.bold}${colors.blue}${'='.repeat(50)}${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}Production Verification Script${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}${'='.repeat(50)}${colors.reset}`);
  console.log(`\n${colors.bold}Target URL:${colors.reset} ${BASE_URL}`);

  if (ADMIN_TOKEN) {
    console.log(`${colors.bold}Admin Token:${colors.reset} Provided ✓`);
  } else {
    console.log(`${colors.yellow}Admin Token: Not provided (some tests will be skipped)${colors.reset}`);
    console.log(`${colors.yellow}Set ADMIN_ACCESS_TOKEN environment variable to test admin endpoints${colors.reset}`);
  }

  // Run all tests
  await testHealthEndpoint();
  await testAPIConnectivity();
  await testCheckoutSession();
  await testAdminEndpoints();
  await testEnvironment();
  await testPerformance();
  await testSecurityHeaders();

  // Print summary
  printSummary();
}

// Run the script
main().catch(error => {
  console.error(`\n${colors.red}${colors.bold}Script execution failed:${colors.reset}`, error);
  process.exit(1);
});
