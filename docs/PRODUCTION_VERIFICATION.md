# Production Verification Checklist

**Final verification before go-live**

## Quick Status Check

Run this command to verify production readiness:

```bash
node scripts/verify-production.js
```

---

## Manual Verification Checklist

### 1. Infrastructure Setup

#### Database
- [ ] MongoDB Atlas cluster provisioned (M10+ for production)
- [ ] Database backups enabled
- [ ] Network access configured
- [ ] Database user created with readWrite permissions
- [ ] Connection string tested
- [ ] All indexes created (see below)

**Index Verification:**
```javascript
// Connect to MongoDB and verify these indexes exist

// Products collection
db.products.getIndexes()
/*
Expected indexes:
- { _id: 1 } (default)
- { isAvailable: 1, createdAt: -1 }
- { lockedQuantity: 1, lockExpiresAt: 1 }
- { slug: 1 } (unique)
*/

// ProductVariants collection
db.productvariants.getIndexes()
/*
Expected indexes:
- { _id: 1 } (default)
- { product: 1 }
- { lockedQuantity: 1, lockExpiresAt: 1 }
*/

// Orders collection
db.orders.getIndexes()
/*
Expected indexes:
- { _id: 1 } (default)
- { order_id: 1 } (unique)
- { user: 1, createdAt: -1 }
- { status: 1, createdAt: -1 }
- { deletedAt: 1 }
*/
```

#### Hosting
- [ ] Production hosting configured (Vercel/Railway/DigitalOcean)
- [ ] Domain name configured
- [ ] SSL certificate active (HTTPS working)
- [ ] CDN enabled (if applicable)
- [ ] Environment variables set

---

### 2. Environment Variables

Verify all required environment variables are set:

```bash
# Application
✓ NODE_ENV=production
✓ NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Database
✓ MONGODB_URI=mongodb+srv://...

# Authentication
✓ SECRET_KEY=[256-bit key]

# Payment
✓ NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxx
✓ RAZORPAY_KEY_SECRET=[secret]
✓ RAZORPAY_WEBHOOK_SECRET=whsec_xxx

# Media
✓ CLOUDINARY_CLOUD_NAME=[name]
✓ CLOUDINARY_API_KEY=[key]
✓ CLOUDINARY_API_SECRET=[secret]

# Email
✓ EMAIL_HOST=smtp.gmail.com
✓ EMAIL_PORT=587
✓ EMAIL_SECURE=false
✓ EMAIL_USER=[email]
✓ EMAIL_PASS=[app-password]

# Stock Management (CRITICAL)
✓ STOCK_CLEANUP_ENABLED=true
✓ STOCK_CLEANUP_INTERVAL_MINUTES=5
✓ STOCK_LOCK_EXPIRY_MINUTES=15

# Monitoring
✓ NEXT_PUBLIC_SENTRY_DSN=[dsn] (optional)

# Security
✓ RATE_LIMIT_ENABLED=true
✓ CHECKOUT_SESSION_EXPIRY_MINUTES=30
```

---

### 3. API Endpoint Testing

Test all critical endpoints:

#### Health Check
```bash
curl https://yourdomain.com/api/health
# Expected: {"status": "healthy", ...}
```

#### Stock Lock API
```bash
# Create checkout session first
curl -X POST https://yourdomain.com/api/checkout/session
# Then test stock lock with session token and CSRF token
```

#### Payment Webhook
```bash
# Use Razorpay dashboard to send test webhook
# Verify it's received and processed
```

#### Admin Endpoints (with admin token)
```bash
# Detailed health
curl -H "Cookie: access_token=ADMIN_TOKEN" \
  https://yourdomain.com/api/health/detailed

# Manual cleanup
curl -X POST -H "Cookie: access_token=ADMIN_TOKEN" \
  https://yourdomain.com/api/cron/stock-cleanup
```

---

### 4. Stock Management Verification

#### Cleanup Job Status
```bash
# Check cleanup job is running
curl -H "Cookie: access_token=ADMIN_TOKEN" \
  https://yourdomain.com/api/cron/stock-cleanup

# Expected response:
{
  "success": true,
  "data": {
    "jobStatus": {
      "running": true,
      "enabled": true,
      "intervalMinutes": 5,
      "lockExpiryMinutes": 15
    }
  }
}
```

#### Stock Lock Flow Test
1. **Add product to cart**
   - Verify cart works
   - Check product quantity before lock

2. **Go to checkout**
   - Session should be created
   - CSRF token should be set
   - Check browser console for confirmations

3. **Stock lock verification**
   - Click "Place Order"
   - Stock should be locked
   - Countdown timer should appear
   - Verify in database:
     ```javascript
     db.products.findOne({ _id: ObjectId("PRODUCT_ID") })
     // Should have: lockedQuantity > 0, lockExpiresAt set
     ```

4. **Timer expiration test**
   - Wait for timer to expire (or set to 1 minute for testing)
   - Stock should be released automatically
   - Verify in database: lockedQuantity = 0

5. **Payment completion test**
   - Lock stock again
   - Complete payment with test amount
   - Verify order created
   - Verify stock permanently deducted
   - Verify email sent

---

### 5. Payment Integration Verification

#### Razorpay Configuration
- [ ] Account in Live Mode
- [ ] KYC completed
- [ ] API keys generated (Live)
- [ ] Webhook configured
- [ ] Webhook secret matches environment variable
- [ ] Test webhook sent and received

#### Payment Flow Test

**Test 1: Successful Payment**
1. Add item to cart
2. Go to checkout
3. Complete payment with Re 1
4. Verify:
   - [ ] Order created in database
   - [ ] Stock deducted
   - [ ] Order status: "pending"
   - [ ] Email sent
   - [ ] Webhook logged in Razorpay

**Test 2: Failed Payment**
1. Add item to cart
2. Go to checkout
3. Cancel payment
4. Verify:
   - [ ] No order created
   - [ ] Stock lock released
   - [ ] Error message shown

**Test 3: Webhook Failure Recovery**
1. Simulate webhook failure (temporarily disable webhook)
2. Complete payment
3. Re-enable webhook
4. Retry webhook from Razorpay dashboard
5. Verify:
   - [ ] Order created on retry
   - [ ] No duplicate orders (idempotency)

---

### 6. Security Verification

#### Rate Limiting
```bash
# Test rate limiting (100 requests/15min for general API)
for i in {1..101}; do
  curl https://yourdomain.com/api/products
done
# 101st request should return 429 (Too Many Requests)
```

#### CSRF Protection
```bash
# Try stock lock without CSRF token
curl -X POST https://yourdomain.com/api/stock/lock \
  -H "Content-Type: application/json" \
  -d '{"items": [{"variantId": "xxx", "quantity": 1}]}'
# Should return 403 (Invalid CSRF token)
```

#### Webhook Signature Validation
```bash
# Try webhook with invalid signature
curl -X POST https://yourdomain.com/api/webhooks/razorpay \
  -H "x-razorpay-signature: invalid" \
  -H "Content-Type: application/json" \
  -d '{"event": "payment.captured"}'
# Should return 400 (Invalid signature)
```

#### Session Validation
```bash
# Try stock lock with expired session
curl -X POST https://yourdomain.com/api/stock/lock \
  -H "Content-Type: application/json" \
  -d '{"sessionToken": "expired_token", "items": [...]}'
# Should return 401 (Invalid or expired session)
```

---

### 7. Performance Verification

#### Response Times
```bash
# All API endpoints should respond in < 500ms
# Use browser DevTools Network tab or:
time curl https://yourdomain.com/api/products
```

Target response times:
- Health check: < 100ms
- Product listing: < 300ms
- Product details: < 200ms
- Stock lock: < 400ms
- Checkout: < 500ms

#### Database Performance
```bash
# MongoDB Atlas > Metrics
# Check:
# - Query execution time < 100ms
# - Connection pool usage < 80%
# - CPU usage < 70%
```

#### Memory Usage
```bash
# Check detailed health endpoint
curl -H "Cookie: access_token=ADMIN_TOKEN" \
  https://yourdomain.com/api/health/detailed

# Verify memory.heapUsedPercentage < 70%
```

---

### 8. Monitoring Setup

#### Health Monitoring
- [ ] External uptime monitor configured (UptimeRobot/Pingdom)
- [ ] Monitoring /api/health every 5 minutes
- [ ] Alerts configured for downtime

#### Error Tracking
- [ ] Sentry configured (if using)
- [ ] Test error logged to Sentry
- [ ] Alert rules configured

#### Log Aggregation
- [ ] Application logs accessible
- [ ] Log retention policy set
- [ ] Log search working

---

### 9. Email Verification

#### Configuration
- [ ] SMTP credentials correct
- [ ] Test email sent successfully
- [ ] Email templates rendering correctly

#### Test Emails
1. **Order Confirmation**
   - Place test order
   - Verify email received
   - Check email formatting
   - Verify order details link works

2. **Email Deliverability**
   - Check spam folder
   - Verify SPF/DKIM records (if custom domain)
   - Test multiple email providers (Gmail, Outlook, etc.)

---

### 10. Frontend Verification

#### Checkout Page
- [ ] Countdown timer displays correctly
- [ ] Timer updates every second
- [ ] Timer expiration handled gracefully
- [ ] Stock lock UI feedback works
- [ ] Payment popup opens correctly
- [ ] Error messages display properly

#### Responsive Design
- [ ] Desktop layout works
- [ ] Mobile layout works
- [ ] Tablet layout works
- [ ] All buttons clickable on mobile

#### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

---

### 11. Order Management

#### Order Creation
- [ ] Orders created correctly
- [ ] All order fields populated
- [ ] Order ID unique
- [ ] Payment ID recorded

#### Order Cancellation
1. Create test order
2. Cancel order
3. Verify:
   - [ ] Order status: "cancelled"
   - [ ] Stock restored
   - [ ] Cancellation reason recorded
   - [ ] Cancelled timestamp set

#### Order History
- [ ] Users can view their orders
- [ ] Order details display correctly
- [ ] Sorting/filtering works

---

### 12. Admin Functions

#### Admin Authentication
- [ ] Admin login works
- [ ] Admin-only endpoints protected
- [ ] Non-admin users blocked

#### Admin Endpoints
- [ ] Detailed health check accessible
- [ ] Manual cleanup trigger works
- [ ] Returns correct data

---

### 13. Data Integrity

#### Database Consistency
```javascript
// Verify no negative quantities
db.products.find({ quantity: { $lt: 0 } })
db.productvariants.find({ quantity: { $lt: 0 } })
// Should return 0 documents

// Verify no orphaned locks
db.products.find({
  lockedQuantity: { $gt: 0 },
  lockExpiresAt: null
})
// Should return 0 documents

// Verify order integrity
db.orders.find({ order_id: null })
db.orders.find({ payment_id: null })
// Should return 0 documents
```

#### Backup Verification
- [ ] Database backup exists
- [ ] Backup restore tested
- [ ] Backup schedule configured

---

### 14. Load Testing (Optional but Recommended)

#### Concurrent Users Test
```bash
# Use tool like Apache Bench or Artillery
ab -n 1000 -c 50 https://yourdomain.com/api/products
# Test with 50 concurrent users making 1000 requests
```

#### Stress Test Critical Paths
1. **Stock Lock Stress Test**
   - Multiple users try to lock same item simultaneously
   - Verify no race conditions
   - Verify stock doesn't go negative

2. **Payment Stress Test**
   - Multiple payments simultaneously
   - Verify all webhooks processed
   - Verify no duplicate orders

---

### 15. Documentation Review

- [ ] PRODUCTION_RUNBOOK.md reviewed
- [ ] TROUBLESHOOTING.md reviewed
- [ ] API documentation up to date
- [ ] Environment variables documented
- [ ] Team trained on procedures

---

## Production Go-Live Checklist

Final checks before making site live to customers:

### Pre-Launch (T-24 hours)
- [ ] All above verifications completed
- [ ] Test orders placed and verified
- [ ] Admin accounts created
- [ ] Support team briefed
- [ ] Monitoring dashboards ready
- [ ] Rollback plan prepared

### Launch (T-0)
- [ ] Final health check passed
- [ ] Cleanup job confirmed running
- [ ] Domain DNS propagated
- [ ] SSL certificate valid
- [ ] Analytics configured (if using)
- [ ] Marketing materials ready

### Post-Launch (T+1 hour)
- [ ] Monitor health endpoint
- [ ] Check for errors in Sentry
- [ ] Verify first customer orders
- [ ] Monitor stock operations
- [ ] Check webhook deliveries

### Post-Launch (T+24 hours)
- [ ] Review all orders
- [ ] Check for any errors
- [ ] Verify email delivery rate
- [ ] Review cleanup job logs
- [ ] Check performance metrics

---

## Critical Issues - Immediate Rollback Required

If any of these occur, rollback immediately:

- ❌ Payment webhooks failing (> 10% failure rate)
- ❌ Orders not being created after payment
- ❌ Stock going negative
- ❌ Cleanup job not running
- ❌ Database connection errors
- ❌ > 50% error rate in any API endpoint
- ❌ Security vulnerability discovered

See `PRODUCTION_RUNBOOK.md` for rollback procedure.

---

## Success Metrics

Production is successful when:

- ✅ Health endpoint returns healthy for 24+ hours
- ✅ > 95% payment success rate
- ✅ Zero stock inconsistencies
- ✅ Zero orders created without payment
- ✅ Cleanup job executing successfully every 5 minutes
- ✅ < 1% error rate across all APIs
- ✅ All emails delivered successfully
- ✅ Page load times < 3 seconds
- ✅ No critical errors in monitoring

---

## Automated Verification Script

Run the automated verification script:

```bash
cd scripts
npm install
node verify-production.js
```

This will check:
- Health endpoint
- API connectivity
- Database connection
- Stock operations
- Cleanup job status
- Environment variables

---

## Sign-Off

Complete this sign-off when all verifications pass:

**Verified By:** _________________
**Date:** _________________
**Time:** _________________

**Deployment Ready:** ☐ YES  ☐ NO

**Notes:**
_____________________________________________
_____________________________________________
_____________________________________________

---

**Document Version:** 1.0
**Last Updated:** [Current Date]
**Next Review:** [Launch Date + 1 week]
