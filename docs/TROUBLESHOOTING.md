# Production Troubleshooting Guide

**Quick reference for diagnosing and fixing common production issues**

## Table of Contents

1. [Diagnostic Tools](#diagnostic-tools)
2. [Stock Management Issues](#stock-management-issues)
3. [Payment Issues](#payment-issues)
4. [Database Issues](#database-issues)
5. [Performance Issues](#performance-issues)
6. [Authentication Issues](#authentication-issues)
7. [Email Issues](#email-issues)
8. [Frontend Issues](#frontend-issues)
9. [Monitoring & Logging](#monitoring--logging)

---

## Diagnostic Tools

### Quick Health Check

```bash
# Basic health check
curl https://yourdomain.com/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-10-21T10:30:00.000Z",
  "uptime": 3600,
  "checks": {
    "database": "healthy",
    "configuration": "healthy",
    "sentry": "healthy",
    "cleanupJob": "healthy"
  }
}
```

### Detailed Diagnostics (Admin Only)

```bash
# Get detailed system diagnostics
curl -H "Cookie: access_token=YOUR_ADMIN_TOKEN" \
  https://yourdomain.com/api/health/detailed

# Shows:
# - Database stats
# - Memory usage
# - Active/expired stock locks
# - Order statistics
# - Cleanup job status
```

### Check Cleanup Job Status

```bash
# Get cleanup job status
curl -H "Cookie: access_token=YOUR_ADMIN_TOKEN" \
  https://yourdomain.com/api/cron/stock-cleanup

# Response shows:
# - running: true/false
# - enabled: true/false
# - intervalMinutes: 5
# - lockExpiryMinutes: 15
```

---

## Stock Management Issues

### Issue: Stock Not Being Locked During Checkout

**Symptoms:**
- Users can checkout same item simultaneously
- Overselling occurs
- No countdown timer on checkout page

**Diagnosis:**
```bash
# Check if stock lock API is working
curl -X POST https://yourdomain.com/api/stock/lock \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: YOUR_TOKEN" \
  -d '{
    "items": [{"variantId": "VARIANT_ID", "quantity": 1}],
    "sessionToken": "SESSION_TOKEN"
  }'
```

**Solutions:**

1. **Verify checkout session is being created**
   ```javascript
   // Check browser console on checkout page
   // Should see: "Checkout session created: {sessionToken: '...'}"
   ```

2. **Check CSRF token**
   ```javascript
   // Browser console should show:
   // "CSRF token set: csrf_..."
   ```

3. **Verify environment variables**
   ```bash
   # Check .env has:
   STOCK_LOCK_EXPIRY_MINUTES=15
   ```

4. **Check database for locked items**
   ```javascript
   // MongoDB query
   db.products.find({ lockedQuantity: { $gt: 0 } })
   db.productvariants.find({ lockedQuantity: { $gt: 0 } })
   ```

---

### Issue: Stock Locks Not Expiring

**Symptoms:**
- Items remain locked forever
- Stock not returning to available
- `lockedQuantity` stays > 0 after timer expires

**Diagnosis:**
```bash
# Check cleanup job status
curl -H "Cookie: access_token=ADMIN_TOKEN" \
  https://yourdomain.com/api/cron/stock-cleanup

# Check database for expired locks
db.products.find({
  lockedQuantity: { $gt: 0 },
  lockExpiresAt: { $lte: new Date() }
})
```

**Solutions:**

1. **Verify cleanup job is enabled**
   ```bash
   # Check environment variables
   STOCK_CLEANUP_ENABLED=true
   STOCK_CLEANUP_INTERVAL_MINUTES=5
   ```

2. **Check application logs**
   ```bash
   # Look for:
   "Starting stock cleanup cron job"
   "Stock cleanup cron job started successfully"

   # If not found, job didn't start
   ```

3. **Manually trigger cleanup**
   ```bash
   curl -X POST -H "Cookie: access_token=ADMIN_TOKEN" \
     https://yourdomain.com/api/cron/stock-cleanup
   ```

4. **Restart application**
   ```bash
   # If cleanup job never started, restart the app
   # Vercel: Redeploy
   # Railway: railway restart
   ```

5. **Manual database fix (last resort)**
   ```javascript
   // CAUTION: Only use if cleanup job completely fails
   db.products.updateMany(
     {
       lockedQuantity: { $gt: 0 },
       lockExpiresAt: { $lte: new Date() }
     },
     {
       $inc: { quantity: "$lockedQuantity" },
       $set: {
         lockedQuantity: 0,
         lockExpiresAt: null
       }
     }
   )
   ```

---

### Issue: High Number of Expired Locks

**Symptoms:**
- Detailed health check shows many expired locks
- Stock frequently unavailable
- Cleanup job seems to not be working

**Diagnosis:**
```bash
# Check detailed health
curl -H "Cookie: access_token=ADMIN_TOKEN" \
  https://yourdomain.com/api/health/detailed

# Look at stockLocks.expired.total
# Should be 0 or very low
```

**Solutions:**

1. **Check cleanup job frequency**
   ```bash
   # If STOCK_CLEANUP_INTERVAL_MINUTES is too high (> 5)
   # Reduce to 5 or lower
   ```

2. **Check cleanup job logs**
   ```bash
   # Look for errors like:
   "Stock lock cleanup job failed"
   "Failed to unlock product"
   ```

3. **Verify database indexes**
   ```javascript
   // Ensure these indexes exist
   db.products.getIndexes()
   // Should include: { lockedQuantity: 1, lockExpiresAt: 1 }

   db.productvariants.getIndexes()
   // Should include: { lockedQuantity: 1, lockExpiresAt: 1 }

   // If missing, create them:
   db.products.createIndex({ lockedQuantity: 1, lockExpiresAt: 1 })
   db.productvariants.createIndex({ lockedQuantity: 1, lockExpiresAt: 1 })
   ```

4. **Increase cleanup frequency temporarily**
   ```bash
   # Set to run every 2 minutes until backlog clears
   STOCK_CLEANUP_INTERVAL_MINUTES=2
   ```

---

## Payment Issues

### Issue: Orders Not Being Created After Successful Payment

**Symptoms:**
- Payment successful in Razorpay
- Money deducted
- No order in database
- Customer doesn't receive email

**Diagnosis:**
```bash
# Check Razorpay webhook logs
# Go to: Razorpay Dashboard > Webhooks > Logs
# Look for failed webhook deliveries

# Check application logs for webhook errors
# Search for: "Webhook processing failed"
```

**Solutions:**

1. **Verify webhook signature validation**
   ```bash
   # Check environment variable
   RAZORPAY_WEBHOOK_SECRET=whsec_...

   # Must match secret in Razorpay dashboard
   ```

2. **Check webhook URL is accessible**
   ```bash
   # Webhook must be publicly accessible
   # Test with curl:
   curl -X POST https://yourdomain.com/api/webhooks/razorpay \
     -H "Content-Type: application/json" \
     -H "x-razorpay-signature: test" \
     -d '{"event": "payment.captured"}'

   # Should return 400 (invalid signature) not 404 or 500
   ```

3. **Check rate limiting**
   ```bash
   # Webhooks have higher limits (200/15min)
   # But if exceeded, webhooks will fail
   # Check logs for: "Rate limit exceeded"
   ```

4. **Manual order creation (emergency)**
   ```bash
   # If webhook fails, create order manually
   # Use Razorpay dashboard to get payment details
   # Then create order in database with correct payment_id and order_id
   ```

5. **Idempotency check**
   ```javascript
   // Check if order already exists
   db.orders.findOne({ order_id: "order_xxx" })

   // If exists, webhook was processed
   // If not, webhook failed - check logs
   ```

---

### Issue: Payment Stuck in "Processing" State

**Symptoms:**
- User completed payment
- Payment successful in Razorpay
- Order shows "pending" indefinitely

**Diagnosis:**
```bash
# Check order status in database
db.orders.findOne({ order_id: "order_xxx" })

# Check payment status in Razorpay dashboard
```

**Solutions:**

1. **Verify webhook was received**
   ```bash
   # Razorpay Dashboard > Webhooks > Logs
   # Check for payment.captured event
   ```

2. **Manually trigger webhook (if failed)**
   ```bash
   # Razorpay Dashboard > Webhooks > Logs
   # Find failed webhook
   # Click "Retry"
   ```

3. **Update order status manually (last resort)**
   ```javascript
   // Only if webhook completely failed and can't be retried
   db.orders.updateOne(
     { order_id: "order_xxx" },
     { $set: { status: "processing" } }
   )
   ```

---

### Issue: Double Order Creation

**Symptoms:**
- Same payment creates two orders
- Stock deducted twice
- Customer charged once but has duplicate orders

**Diagnosis:**
```javascript
// Check for duplicate orders with same order_id
db.orders.aggregate([
  { $group: { _id: "$order_id", count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } }
])
```

**Solutions:**

1. **This should NOT happen** - Idempotency is built in
   ```javascript
   // Webhook handler checks for existing order:
   const existingOrder = await OrderModel.findOne({ order_id: orderId });
   if (existingOrder) return; // Skip creation
   ```

2. **If it does happen, investigate**
   - Check application logs for race conditions
   - Verify database transactions are working
   - Check if webhook was called multiple times

3. **Fix duplicate orders**
   ```javascript
   // Keep first order, delete duplicates
   // Restore stock for deleted orders
   db.orders.find({ order_id: "order_xxx" }).sort({ createdAt: 1 })
   // Keep first, delete rest
   ```

---

## Database Issues

### Issue: Database Connection Errors

**Symptoms:**
- Health check returns unhealthy
- API requests fail with "Database connection error"
- Users can't place orders

**Diagnosis:**
```bash
# Check health endpoint
curl https://yourdomain.com/api/health

# Response shows:
{
  "status": "unhealthy",
  "checks": {
    "database": "unhealthy"
  },
  "errors": ["Database connection state: 0 (expected: 1)"]
}
```

**Solutions:**

1. **Verify MongoDB Atlas cluster is running**
   - Log in to MongoDB Atlas
   - Check cluster status
   - Look for "Cluster paused" or "Maintenance"

2. **Check connection string**
   ```bash
   # Verify MONGODB_URI format:
   mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority

   # Common issues:
   # - Password contains special characters (needs URL encoding)
   # - Wrong database name
   # - Missing retryWrites parameter
   ```

3. **Check network access**
   ```bash
   # MongoDB Atlas > Network Access
   # Verify hosting provider IP is whitelisted
   # For Vercel: 0.0.0.0/0 (with strong password)
   ```

4. **Check database user permissions**
   ```bash
   # MongoDB Atlas > Database Access
   # User must have readWrite permissions
   ```

5. **Connection string with special characters**
   ```bash
   # If password has special characters, URL encode them:
   # @ → %40
   # : → %3A
   # / → %2F
   # ? → %3F
   # # → %23
   # [ → %5B
   # ] → %5D
   ```

---

### Issue: Slow Database Queries

**Symptoms:**
- API requests taking > 2 seconds
- Checkout page slow to load
- Health check shows high response times

**Diagnosis:**
```bash
# MongoDB Atlas > Metrics > Operations
# Look for slow queries (> 100ms)

# Check if indexes are being used
# MongoDB Atlas > Performance Advisor
```

**Solutions:**

1. **Create missing indexes**
   ```javascript
   // Essential indexes (see PRODUCTION_RUNBOOK.md)
   db.products.createIndex({ isAvailable: 1, createdAt: -1 })
   db.products.createIndex({ lockedQuantity: 1, lockExpiresAt: 1 })
   db.productvariants.createIndex({ product: 1 })
   db.productvariants.createIndex({ lockedQuantity: 1, lockExpiresAt: 1 })
   db.orders.createIndex({ order_id: 1 }, { unique: true })
   db.orders.createIndex({ user: 1, createdAt: -1 })
   ```

2. **Upgrade cluster tier**
   ```bash
   # If M0/M2 (free tier), upgrade to M10
   # M10 has better performance and more IOPS
   ```

3. **Optimize queries**
   ```javascript
   // Add projection to reduce data transfer
   db.products.find(
     { isAvailable: true },
     { name: 1, price: 1, images: 1 } // Only return needed fields
   )
   ```

---

## Performance Issues

### Issue: High Memory Usage

**Symptoms:**
- Detailed health check shows > 80% heap used
- Application crashes with "JavaScript heap out of memory"

**Diagnosis:**
```bash
# Check detailed health
curl -H "Cookie: access_token=ADMIN_TOKEN" \
  https://yourdomain.com/api/health/detailed

# Look at memory.heapUsedPercentage
# Should be < 70%
```

**Solutions:**

1. **Increase memory allocation**
   ```bash
   # Add to package.json scripts:
   "start": "NODE_OPTIONS='--max-old-space-size=2048' next start"
   ```

2. **Check for memory leaks**
   ```bash
   # Monitor memory over time
   # If steadily increasing, there's a leak
   ```

3. **Optimize image handling**
   ```javascript
   // Use Next.js Image component with optimization
   import Image from 'next/image'

   <Image
     src={product.image}
     width={300}
     height={300}
     quality={80}
   />
   ```

---

### Issue: Slow Page Load Times

**Symptoms:**
- Homepage takes > 3 seconds to load
- Product pages slow
- Poor Core Web Vitals

**Diagnosis:**
```bash
# Use Lighthouse in Chrome DevTools
# Or: https://pagespeed.web.dev/

# Check:
# - Largest Contentful Paint (LCP) < 2.5s
# - First Input Delay (FID) < 100ms
# - Cumulative Layout Shift (CLS) < 0.1
```

**Solutions:**

1. **Enable Next.js caching**
   ```javascript
   // Use revalidate for API routes
   export const revalidate = 60 // Revalidate every 60 seconds
   ```

2. **Optimize images**
   ```javascript
   // Always use Next.js Image component
   // Enable Cloudinary optimization
   ```

3. **Implement pagination**
   ```javascript
   // Don't load all products at once
   // Use pagination: /api/products?page=1&limit=20
   ```

4. **Add CDN**
   ```bash
   # Vercel includes CDN by default
   # For other hosts, consider Cloudflare
   ```

---

## Authentication Issues

### Issue: Users Can't Log In

**Symptoms:**
- Login returns 401 error
- Token validation fails
- Users logged out automatically

**Diagnosis:**
```bash
# Check if SECRET_KEY is set
echo $SECRET_KEY

# Check token expiry
# Decode JWT token at: https://jwt.io
```

**Solutions:**

1. **Verify SECRET_KEY**
   ```bash
   # Must be consistent across deployments
   # Check environment variables
   SECRET_KEY=your-256-bit-secret
   ```

2. **Check token expiry**
   ```javascript
   // Tokens expire after X hours
   // Check payload.exp in JWT
   ```

3. **Clear cookies and retry**
   ```javascript
   // Browser console:
   document.cookie.split(";").forEach(c => {
     document.cookie = c.trim().split("=")[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC';
   });
   ```

4. **Regenerate SECRET_KEY (last resort)**
   ```bash
   # WARNING: Logs out all users
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   # Update SECRET_KEY in environment variables
   ```

---

## Email Issues

### Issue: Emails Not Being Sent

**Symptoms:**
- Order confirmation emails not received
- Email logs show errors

**Diagnosis:**
```bash
# Check application logs
# Search for: "Failed to send confirmation email"

# Check environment variables
echo $EMAIL_HOST
echo $EMAIL_USER
```

**Solutions:**

1. **Verify SMTP credentials**
   ```bash
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password # Not regular password!
   ```

2. **Gmail App Password**
   ```bash
   # If using Gmail:
   # 1. Enable 2FA on Google account
   # 2. Generate App Password
   # 3. Use App Password in EMAIL_PASS
   ```

3. **Test email sending**
   ```javascript
   // Create test endpoint to send email
   // POST /api/test/email
   // Check logs for errors
   ```

4. **Check rate limits**
   ```bash
   # Gmail: 500 emails/day for free accounts
   # If exceeded, emails will fail
   ```

---

## Frontend Issues

### Issue: Checkout Timer Not Showing

**Symptoms:**
- No countdown timer on checkout page
- Users don't know stock is locked
- Frontend console errors

**Diagnosis:**
```javascript
// Open browser console on checkout page
// Look for errors related to:
// - checkoutSession
// - csrfToken
// - stockLockId
```

**Solutions:**

1. **Check session creation**
   ```javascript
   // Browser console should show:
   "Checkout session created: {sessionToken: '...', csrfToken: '...'}"

   // If not, check /api/checkout/session endpoint
   ```

2. **Verify stock lock response**
   ```javascript
   // After clicking "Place Order"
   // Check Network tab for /api/stock/lock response
   // Should include: lockId, expiresAt
   ```

3. **Check React state**
   ```javascript
   // Add console.logs in checkout page:
   console.log('lockExpiresAt:', lockExpiresAt)
   console.log('isStockLocked:', isStockLocked)
   ```

---

### Issue: Payment Popup Not Opening

**Symptoms:**
- Click "Pay Now" but nothing happens
- Razorpay popup doesn't appear
- Console errors about Razorpay

**Diagnosis:**
```javascript
// Browser console
// Look for: "Razorpay is not defined"
```

**Solutions:**

1. **Verify Razorpay script loaded**
   ```html
   <!-- Should be in <head> -->
   <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
   ```

2. **Check Razorpay key**
   ```javascript
   // Verify NEXT_PUBLIC_RAZORPAY_KEY_ID is set
   console.log(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID)
   ```

3. **Browser blocking popup**
   ```bash
   # Check browser settings
   # Ensure popups are allowed for yourdomain.com
   ```

---

## Monitoring & Logging

### Accessing Logs

**Vercel:**
```bash
vercel logs https://yourdomain.com
vercel logs https://yourdomain.com --follow # Real-time
```

**Railway:**
```bash
railway logs
railway logs --follow # Real-time
```

**DigitalOcean:**
```bash
# Web console > App > Runtime Logs
```

### Key Log Events to Monitor

**Stock Operations:**
```
INFO: "Stock locked successfully"
INFO: "Stock unlocked successfully"
INFO: "Stock lock cleanup completed"
WARN: "Stock lock failed: insufficient quantity"
ERROR: "Failed to unlock product"
```

**Payment Processing:**
```
INFO: "Webhook received"
INFO: "Order created successfully via webhook"
WARN: "Invalid webhook signature - possible attack"
ERROR: "Failed to process payment.captured webhook"
```

**Cleanup Job:**
```
INFO: "Starting stock cleanup cron job"
INFO: "Stock cleanup completed"
ERROR: "Stock lock cleanup job failed"
```

### Sentry Integration

**Check Sentry Dashboard:**
1. Go to sentry.io
2. Select your project
3. Look for:
   - Error frequency
   - New errors
   - Performance issues

**Common Sentry Errors:**

- `UnhandledPromiseRejection` - Async errors not caught
- `DatabaseError` - MongoDB issues
- `ValidationError` - Input validation failures
- `PaymentError` - Razorpay issues

---

## Emergency Procedures

### Complete Stock Reset (CAUTION)

```javascript
// Use only if stock is completely corrupted
// This will:
// 1. Release all locks
// 2. Clear all lock expiry times

db.products.updateMany(
  { lockedQuantity: { $gt: 0 } },
  {
    $inc: { quantity: "$lockedQuantity" },
    $set: {
      lockedQuantity: 0,
      lockExpiresAt: null
    }
  }
)

db.productvariants.updateMany(
  { lockedQuantity: { $gt: 0 } },
  {
    $inc: { quantity: "$lockedQuantity" },
    $set: {
      lockedQuantity: 0,
      lockExpiresAt: null
    }
  }
)
```

### Force Cleanup Job Restart

```bash
# Stop and restart application
# Vercel: Redeploy
vercel --prod

# Railway: Restart
railway restart

# This will restart cleanup job
```

### Emergency Order Fulfillment

```javascript
// If webhook fails and order not created:
// 1. Get payment details from Razorpay
// 2. Manually create order in database:

db.orders.insertOne({
  user: ObjectId("USER_ID"),
  order_id: "order_xxx",
  payment_id: "pay_xxx",
  status: "pending",
  products: [/* from Razorpay notes */],
  totalAmount: 1000,
  createdAt: new Date()
  // ... other fields
})

// 3. Manually deduct stock
// 4. Send confirmation email manually
```

---

## Support Escalation

**Level 1: Application Issues**
- Stock locks
- Frontend errors
- API errors
→ Check logs, use diagnostic tools

**Level 2: Infrastructure Issues**
- Database connection
- High memory usage
- Performance degradation
→ Check hosting provider status, MongoDB Atlas

**Level 3: External Service Issues**
- Razorpay webhooks failing
- Email service down
- Cloudinary issues
→ Contact service provider support

**Level 4: Critical System Failure**
- Complete application down
- Data corruption
- Security breach
→ Implement rollback, contact all stakeholders

---

## Quick Reference Commands

```bash
# Health check
curl https://yourdomain.com/api/health

# Detailed diagnostics (admin)
curl -H "Cookie: access_token=ADMIN_TOKEN" \
  https://yourdomain.com/api/health/detailed

# Manual cleanup trigger (admin)
curl -X POST -H "Cookie: access_token=ADMIN_TOKEN" \
  https://yourdomain.com/api/cron/stock-cleanup

# Check logs (Vercel)
vercel logs https://yourdomain.com --follow

# Check logs (Railway)
railway logs --follow

# Database queries
mongo "mongodb+srv://cluster.mongodb.net/dbname" --username user
> db.products.find({ lockedQuantity: { $gt: 0 } })
> db.orders.find({ status: "pending" }).sort({ createdAt: -1 }).limit(10)
```

---

**Document Version:** 1.0
**Last Updated:** [Current Date]
**Maintained By:** Development Team

For deployment procedures, see `docs/PRODUCTION_RUNBOOK.md`.
