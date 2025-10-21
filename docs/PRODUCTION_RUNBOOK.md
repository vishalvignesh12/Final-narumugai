# Production Deployment Runbook

**Complete guide for deploying this e-commerce platform to production**

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Configuration](#environment-configuration)
3. [Database Setup](#database-setup)
4. [Security Configuration](#security-configuration)
5. [Payment Gateway Setup](#payment-gateway-setup)
6. [Stock Management Configuration](#stock-management-configuration)
7. [Monitoring Setup](#monitoring-setup)
8. [Deployment Steps](#deployment-steps)
9. [Post-Deployment Verification](#post-deployment-verification)
10. [Rollback Procedure](#rollback-procedure)

---

## Pre-Deployment Checklist

### Infrastructure Requirements
- [ ] Node.js hosting environment (Vercel, Railway, DigitalOcean, etc.)
- [ ] MongoDB Atlas cluster (or equivalent MongoDB hosting)
- [ ] Domain name configured with SSL
- [ ] Razorpay account with API credentials
- [ ] Cloudinary account for media storage
- [ ] Email service (SMTP) configured
- [ ] (Optional) Sentry account for error tracking

### Code Preparation
- [ ] All tests passing locally
- [ ] Production build successful (`npm run build`)
- [ ] All environment variables documented
- [ ] Database migrations ready (if any)
- [ ] API endpoints tested
- [ ] Frontend production build tested

### Team Readiness
- [ ] Admin credentials prepared
- [ ] Support team briefed
- [ ] Monitoring dashboard access granted
- [ ] Rollback plan reviewed

---

## Environment Configuration

### Required Environment Variables

Create a `.env.production` file with these variables:

```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority

# Authentication
SECRET_KEY=your-256-bit-secret-key-here

# Payment Gateway
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Media Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Service
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Monitoring (Optional but Recommended)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx

# Stock Management (CRITICAL)
STOCK_CLEANUP_ENABLED=true
STOCK_CLEANUP_INTERVAL_MINUTES=5
STOCK_LOCK_EXPIRY_MINUTES=15

# Rate Limiting
RATE_LIMIT_ENABLED=true

# Session Security
CHECKOUT_SESSION_EXPIRY_MINUTES=30
```

### Generate Secret Keys

```bash
# Generate SECRET_KEY (256-bit)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate RAZORPAY_WEBHOOK_SECRET (use Razorpay dashboard)
# Go to Settings > Webhooks > Generate Secret
```

---

## Database Setup

### MongoDB Atlas Configuration

1. **Create Production Cluster**
   - Log in to MongoDB Atlas
   - Create new M10+ cluster (for production workload)
   - Choose region closest to your hosting
   - Enable backups

2. **Network Access**
   ```
   - Add hosting provider's IP addresses
   - For Vercel: Add 0.0.0.0/0 (with authentication)
   - Enable VPC peering if available
   ```

3. **Database User**
   ```
   - Create dedicated user for production
   - Grant readWrite permissions
   - Use strong password (32+ characters)
   ```

4. **Connection String**
   ```
   mongodb+srv://produser:PASSWORD@cluster.mongodb.net/ecommerce-prod?retryWrites=true&w=majority&appName=EcommerceApp
   ```

5. **Indexes (CRITICAL for Performance)**
   ```javascript
   // Run these in MongoDB shell or via script

   // Products
   db.products.createIndex({ isAvailable: 1, createdAt: -1 })
   db.products.createIndex({ lockedQuantity: 1, lockExpiresAt: 1 })
   db.products.createIndex({ slug: 1 }, { unique: true })

   // Product Variants
   db.productvariants.createIndex({ product: 1 })
   db.productvariants.createIndex({ lockedQuantity: 1, lockExpiresAt: 1 })

   // Orders
   db.orders.createIndex({ order_id: 1 }, { unique: true })
   db.orders.createIndex({ user: 1, createdAt: -1 })
   db.orders.createIndex({ status: 1, createdAt: -1 })
   db.orders.createIndex({ deletedAt: 1 })

   // Users
   db.users.createIndex({ email: 1 }, { unique: true })
   ```

---

## Security Configuration

### 1. Rate Limiting

Rate limiting is enabled by default. Verify configuration:

```javascript
// lib/rateLimiter.js already configured with:
// - General API: 100 requests/15min
// - Stock operations: 20 requests/15min
// - Authentication: 10 requests/15min
// - Webhooks: 200 requests/15min
```

### 2. CSRF Protection

CSRF tokens are automatically generated for checkout sessions. No additional configuration needed.

### 3. Payment Security

- **Webhook Signature Verification**: Enabled automatically
- **Idempotent Order Creation**: Prevents duplicate orders
- **Stock Lock Before Payment**: Prevents overselling

### 4. Admin Endpoints

Secure these endpoints (admin authentication required):
- `/api/health/detailed` - Detailed diagnostics
- `/api/cron/stock-cleanup` - Manual cleanup trigger

### 5. Security Headers

Add to `next.config.js`:

```javascript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()',
        },
      ],
    },
  ];
},
```

---

## Payment Gateway Setup

### Razorpay Configuration

1. **Switch to Live Mode**
   - Log in to Razorpay Dashboard
   - Switch from Test Mode to Live Mode
   - Complete KYC verification if not done

2. **API Keys**
   ```
   - Go to Settings > API Keys
   - Generate Live API keys
   - Copy Key ID and Key Secret
   - Add to environment variables
   ```

3. **Webhook Configuration (CRITICAL)**
   ```
   - Go to Settings > Webhooks
   - Click "Add New Webhook"
   - URL: https://yourdomain.com/api/webhooks/razorpay
   - Events to subscribe:
     ✓ payment.captured
     ✓ payment.failed
     ✓ payment.authorized
   - Generate webhook secret
   - Add secret to RAZORPAY_WEBHOOK_SECRET environment variable
   ```

4. **Test Webhook**
   ```bash
   # Use Razorpay's webhook testing tool
   # Send test events to verify endpoint is reachable
   ```

5. **Payment Flow Verification**
   - Create test order with Re 1
   - Complete payment
   - Verify order created in database
   - Verify stock deducted
   - Verify email sent
   - Verify webhook logs

---

## Stock Management Configuration

### Critical Stock Features

1. **Stock Lock Expiry**
   ```bash
   STOCK_LOCK_EXPIRY_MINUTES=15
   # Users have 15 minutes to complete payment
   # After that, stock is automatically released
   ```

2. **Cleanup Job**
   ```bash
   STOCK_CLEANUP_ENABLED=true
   STOCK_CLEANUP_INTERVAL_MINUTES=5
   # Job runs every 5 minutes to release expired locks
   ```

3. **Verify Cleanup Job Started**
   ```bash
   # Check application logs on startup
   # Should see: "Starting stock cleanup cron job"
   # Should see: "Stock cleanup cron job started successfully"
   ```

4. **Manual Cleanup Trigger**
   ```bash
   # Emergency cleanup if automatic job fails
   curl -X POST https://yourdomain.com/api/cron/stock-cleanup \
     -H "Cookie: access_token=ADMIN_TOKEN"
   ```

### Stock Lock Flow

```
1. User adds items to cart
2. User goes to checkout
3. Checkout page creates session
4. Frontend calls /api/stock/lock
5. Stock locked for 15 minutes
6. Countdown timer shows user remaining time
7. User completes payment OR timer expires
8. If payment success: Stock permanently deducted
9. If payment fails/expires: Cleanup job releases lock
```

---

## Monitoring Setup

### 1. Health Check Endpoints

**Public Health Check**
```bash
GET https://yourdomain.com/api/health
# Returns: 200 if healthy, 503 if unhealthy
# Monitor every 5 minutes
```

**Detailed Health Check (Admin Only)**
```bash
GET https://yourdomain.com/api/health/detailed
# Returns comprehensive diagnostics:
# - Database stats
# - Memory usage
# - Active stock locks
# - Order statistics
# - Cleanup job status
```

### 2. Uptime Monitoring

Configure external monitoring service (UptimeRobot, Pingdom, etc.):

```
Monitor: https://yourdomain.com/api/health
Interval: 5 minutes
Alert on: Status code != 200
Alert to: ops-team@yourdomain.com
```

### 3. Sentry Error Tracking (Recommended)

```bash
# Already configured if NEXT_PUBLIC_SENTRY_DSN is set
# Automatically captures:
# - JavaScript errors
# - API errors
# - Stock cleanup failures
# - Payment processing errors
```

### 4. Log Monitoring

Application uses structured logging (Pino). Key log events:

```
Level: INFO
- Stock locks created
- Orders created
- Payments processed
- Cleanup job runs

Level: WARN
- Failed payment attempts
- Stock lock failures
- Email sending failures

Level: ERROR
- Database connection errors
- Payment webhook failures
- Stock cleanup errors
```

### 5. Key Metrics to Monitor

```
- Active stock locks count (should be low)
- Expired stock locks count (should be 0 after cleanup)
- Pending orders > 24 hours old (investigate if high)
- Payment success rate (should be > 95%)
- Cleanup job execution time (should be < 5 seconds)
- API response times (should be < 500ms)
```

---

## Deployment Steps

### Option A: Vercel (Recommended for Next.js)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy to Production**
   ```bash
   vercel --prod
   ```

4. **Add Environment Variables**
   ```bash
   # Go to Vercel Dashboard > Settings > Environment Variables
   # Add all variables from .env.production
   ```

5. **Configure Domain**
   ```bash
   # Vercel Dashboard > Domains
   # Add your domain and follow DNS configuration steps
   ```

6. **Verify Deployment**
   ```bash
   # Check deployment logs
   vercel logs https://yourdomain.com
   ```

### Option B: Railway

1. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login and Deploy**
   ```bash
   railway login
   railway init
   railway up
   ```

3. **Add Environment Variables**
   ```bash
   railway variables set MONGODB_URI="mongodb+srv://..."
   # Add all other variables
   ```

4. **Configure Domain**
   ```bash
   railway domain
   ```

### Option C: DigitalOcean App Platform

1. **Create App**
   - Go to DigitalOcean Dashboard
   - Create App > Choose GitHub repo
   - Select branch: main

2. **Configure Build**
   ```
   Build Command: npm run build
   Run Command: npm start
   Environment: Node.js
   ```

3. **Add Environment Variables**
   - Go to App Settings > Environment Variables
   - Add all production variables

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

---

## Post-Deployment Verification

### Automated Verification Script

Create `verify-production.js`:

```javascript
const axios = require('axios');

const BASE_URL = 'https://yourdomain.com';

async function verify() {
  console.log('🔍 Starting production verification...\n');

  // 1. Health check
  console.log('1️⃣ Checking health endpoint...');
  const health = await axios.get(`${BASE_URL}/api/health`);
  console.log(health.data.status === 'healthy' ? '✅ Healthy' : '❌ Unhealthy');

  // 2. Homepage load
  console.log('2️⃣ Checking homepage...');
  const homepage = await axios.get(BASE_URL);
  console.log(homepage.status === 200 ? '✅ Homepage loads' : '❌ Homepage error');

  // 3. API connectivity
  console.log('3️⃣ Checking API connectivity...');
  const products = await axios.get(`${BASE_URL}/api/products`);
  console.log(products.status === 200 ? '✅ API working' : '❌ API error');

  console.log('\n✅ Production verification complete!');
}

verify().catch(console.error);
```

Run verification:
```bash
node verify-production.js
```

### Manual Verification Checklist

#### Critical Path Testing

- [ ] **Homepage loads**
  - Visit https://yourdomain.com
  - Verify images load
  - Check navigation works

- [ ] **Product listing**
  - Browse products
  - Search functionality works
  - Filters work

- [ ] **Product details**
  - Click product
  - View images
  - Check variants display

- [ ] **Add to cart**
  - Add product to cart
  - Verify quantity
  - Check cart total

- [ ] **Checkout flow (CRITICAL)**
  - Go to checkout
  - Verify countdown timer appears
  - Check shipping form validation
  - Verify Razorpay payment popup opens
  - Complete test payment (Re 1)
  - Verify order confirmation
  - Check order appears in database
  - Verify stock deducted
  - Confirm email received

- [ ] **Stock locking**
  - Add item to cart
  - Go to checkout (stock locked)
  - Wait for timer to expire
  - Verify stock released
  - Check database: lockedQuantity = 0

- [ ] **Payment failure handling**
  - Start checkout
  - Cancel payment popup
  - Verify stock released
  - Check error message displayed

- [ ] **Authentication**
  - Sign up new user
  - Verify email sent
  - Log in
  - Log out

- [ ] **Order management**
  - View order history (user)
  - Check order details
  - Test order cancellation
  - Verify stock restored after cancellation

- [ ] **Admin functions** (if applicable)
  - Log in as admin
  - Access detailed health check: `/api/health/detailed`
  - Trigger manual cleanup: `/api/cron/stock-cleanup`
  - Verify admin dashboard

#### Monitoring Verification

- [ ] **Health endpoint**
  ```bash
  curl https://yourdomain.com/api/health
  # Should return {"status": "healthy", ...}
  ```

- [ ] **Cleanup job running**
  ```bash
  # Check logs for:
  # "Stock cleanup cron job started successfully"
  ```

- [ ] **Sentry receiving errors**
  - Trigger test error
  - Check Sentry dashboard

- [ ] **Uptime monitor configured**
  - Verify alerts working
  - Test alert by stopping server

#### Performance Verification

- [ ] **Page load times**
  - Homepage: < 3 seconds
  - Product page: < 2 seconds
  - Checkout: < 2 seconds

- [ ] **API response times**
  ```bash
  # Use browser DevTools Network tab
  # All API calls should be < 500ms
  ```

- [ ] **Database queries**
  - Check MongoDB Atlas performance tab
  - Verify indexes being used
  - No slow queries (> 1 second)

---

## Rollback Procedure

### When to Rollback

- Critical bugs discovered in production
- Payment processing failures
- Database connection issues
- High error rates in Sentry
- Stock management failures

### Rollback Steps

#### Vercel

```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]

# Or use dashboard
# Vercel Dashboard > Deployments > Click previous deployment > Promote to Production
```

#### Railway

```bash
# View deployments
railway deployments

# Rollback to previous
railway rollback [deployment-id]
```

#### Manual Rollback

1. **Restore previous version**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Redeploy**
   ```bash
   # Deployment will automatically trigger
   ```

3. **Verify rollback**
   ```bash
   curl https://yourdomain.com/api/health
   ```

### Post-Rollback

- [ ] Notify team of rollback
- [ ] Document issue that caused rollback
- [ ] Create hotfix branch
- [ ] Test fix thoroughly
- [ ] Redeploy when ready

---

## Ongoing Maintenance

### Daily Tasks

- Check health endpoint status
- Review Sentry errors
- Monitor order volume
- Check payment success rate

### Weekly Tasks

- Review active stock locks (should be minimal)
- Audit cleanup job logs
- Check database performance
- Review API response times
- Test checkout flow

### Monthly Tasks

- Review MongoDB Atlas metrics
- Check database backup status
- Audit user accounts
- Review rate limiting effectiveness
- Update dependencies (`npm audit fix`)

### Emergency Contacts

```
Payment Issues: support@razorpay.com
Database Issues: MongoDB Atlas Support
Hosting Issues: [Your hosting provider support]
Development Team: [Your team contact]
```

---

## Troubleshooting Quick Reference

**Stock not releasing after timer expires**
```bash
# Check cleanup job status
curl -H "Cookie: access_token=ADMIN_TOKEN" \
  https://yourdomain.com/api/cron/stock-cleanup

# Manually trigger cleanup
curl -X POST -H "Cookie: access_token=ADMIN_TOKEN" \
  https://yourdomain.com/api/cron/stock-cleanup
```

**Orders not being created after payment**
```bash
# Check webhook logs in Razorpay dashboard
# Verify webhook secret matches environment variable
# Check application logs for webhook errors
```

**High number of expired locks**
```bash
# Check cleanup job is running
# Check STOCK_CLEANUP_ENABLED=true
# Verify cron job started in logs
# Manually trigger cleanup if needed
```

For detailed troubleshooting, see `docs/TROUBLESHOOTING.md`.

---

## Success Criteria

Deployment is successful when:

- ✅ Health endpoint returns healthy
- ✅ Test order completes successfully
- ✅ Stock locking works correctly
- ✅ Payment webhooks processed
- ✅ Emails sending successfully
- ✅ Cleanup job running
- ✅ No critical errors in Sentry
- ✅ All monitoring alerts configured
- ✅ Performance metrics acceptable

---

**Document Version:** 1.0
**Last Updated:** [Current Date]
**Maintained By:** Development Team
