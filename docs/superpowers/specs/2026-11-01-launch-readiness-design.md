# Narumugai Launch-Readiness Design (Legacy Professionalization)

**Date:** 2026-11-01
**Status:** Approved design, pending spec review
**Scope:** Professionalize the live legacy (MongoDB) storefront for launch. Front-end visuals unchanged. The dormant V2 PostgreSQL code (`src/modules/*`, `app/api/v2/*`) stays flag-gated and untouched, consistent with `docs/v2/README.md`.

## Context

Four read-only audits (checkout/payments/stock, auth/security, cart/orders/coupons, SEO/perf/ops) found the site unsafe to launch as-is. The storefront is the legacy Mongo app; the V2 migration in `docs/v2/` is incomplete (no identity flow, no cutover) and out of scope. The site is launching soon with real orders.

Ground truths established by audit (do not regress these):

- `initiate-payment` recomputes all prices server-side and decrements stock atomically inside a Mongo transaction; concurrent checkouts of the last unit cannot oversell.
- `payment/verify` checks the PayU SHA-512 hash with `timingSafeEqual` and re-checks the paid amount against the stored order total.
- Order lookup is owner-checked; guests use a signed order-scoped JWT.
- Legacy admin APIs check `isAuthenticated('admin')` per route.

## P0 — Money Path

### P0.1 Checkout payload normalization

Fixes the documented production error: `"Error initiating payment, unlocking stock: Invalid or missing fields."` Root cause: checkout maps items from persisted localStorage carts; older carts lack `variantId` (JSON drops `undefined`), and qty/prices may be strings. Server Zod (`variantId: z.string().nullable()`, `qty: z.number().min(1)`) rejects them → 400.

- Server `app/api/payment/initiate-payment/route.js`: `variantId` via `z.preprocess(v => v ?? null, z.string().nullable())`; `qty`, `mrp`, `sellingPrice` via `z.coerce.number()` (qty keeps `.min(1)` and gets a per-line `.max(20)` cap).
- Client `app/(root)/(website)/checkout/page.jsx`: map `variantId: cartItem.variantId ?? null`, coerce numbers before POST.
- Revalidate the persisted cart before payment: checkout calls the existing `POST /api/cart-verification` and drops items that went out of stock or changed price; show a non-blocking notice if anything was removed.

### P0.2 Coupon system repair

Current state: 100% of couponed orders fail at initiation (`initiate-payment/route.js` queries `expiryDate`; the model field is `validity`).

- Query `validity: { $gte: now }` and `deletedAt: null` (case/whitespace-insensitive code match: trim + lowercase both sides; store codes normalized).
- Clamp `couponDiscountAmount = Math.min(subtotal * pct/100, subtotal)`; reject `totalAmount <= 0` before PayU hashing.
- Model additions: `discountPercentage` gets `max: 100` (and Zod parity), plus `usageLimit` (default unlimited when null), `usedCount`, `perUserLimit` (null = unlimited), and a `redemptions` subdocument set `{orderId, userId, at}` written inside the order-creation transaction; increment `usedCount` with a conditional update (`usedCount: { $lt: usageLimit }` when limited) so concurrent orders cannot overspend a coupon.
- `POST /api/coupon/apply`: require auth, reject deleted/expired coupons, take server-computed subtotal (accept product line items and compute, not a client-supplied amount), return the same validation errors initiate will enforce.

### P0.3 Reservation expiry (abandoned-checkout inventory leak)

Current state: stock is decremented at initiation and restored only via the browser callback; a customer (or griefer) who never returns from PayU drains the catalog permanently, and `/api/orders/cancel` cannot touch `pending-payment` orders.

- `Order.model.js`: add `reservationExpiresAt: Date` (set at initiation, default 15 minutes; indexed, partial on `status: 'pending-payment'`).
- New route `POST /api/operations/reservations/expire`, guarded by `RESERVATION_EXPIRY_SECRET` (header compare, timing-safe) — same pattern as the existing v2 operations route. Expires stale orders: atomic status claim `pending-payment → failed` with reason `reservation_expired`, then stock restore per item (reuse the `unlockStock` variant-aware logic, including its deletedAt guard).
- Vercel Cron hits the route every 5 minutes (`vercel.json` crons entry; document in DEPLOYMENT.md).
- Opportunistic sweep: when `initiate-payment` finds a needed variant at zero available quantity, it first expires any stale reservations holding that stock inside the same transaction before decrementing.
- Expired orders render as "session expired — retry checkout" via the existing order-details lookup; failure-path email to the customer is best-effort.

### P0.4 Payment verify hardening

- Success branch claims atomically: `findOneAndUpdate({ _id, status: 'pending-payment' }, { $set: { status: 'processing', payment_status: 'paid', ... } })`; if the claim matches 0 documents the callback is a duplicate/retry → return success redirect without side effects (idempotent, no duplicate emails).
- Sanitize + length-limit gateway-provided error strings before persisting to `ordernote` (strip control chars, max ~500 chars).
- `payment-success` page stops trusting URL params: server-fetch the order (same owner/guest-token pattern as order-details) and render state from the DB; URL params are display hints only.

### P0.5 Order cancellation

- User cancel allowed for `pending-payment` (restore stock immediately, mark `cancelled`) and `processing` (mark `cancel-requested` pending admin refund approval; admin completes via transition rules below). Owner-checked as today. The Order status enum gains `cancel-requested`; the P0.6 transition map includes `processing → cancel-requested` and `cancel-requested → cancelled/refunded` (admin-only).

### P0.6 Order status transition rules (admin)

- Whitelisted transition map (e.g. `processing → shipped → delivered`, `processing → cancelled`, no `delivered → processing`); Zod enum on status; `payment_status` synced by rule (refund-ish transitions require explicit refund flow); paid-order cancel/refund restores stock atomically; every transition appends `{at, from, to, actorId, note}` to a new `order.statusHistory` array.

## P1 — Security

### P1.1 OTP brute-force protection

- OTP model: add `attemptCount`, `lastAttemptAt`; verify increments atomically and rejects (deletes) the OTP after 5 failed attempts.
- OTPs stored as sha256 hashes (same pattern as existing password-reset tokens); compare hashed.
- `lib/rateLimit.js`: in-memory sliding-window limiter, per-IP + per-identifier keys. Applied to `login`, `resend-otp`, `verify-otp`, `register`, `initiate-payment`. Call sites unchanged if we later move to Upstash. (Serverless caveat: per-instance memory; accepted for launch, documented.)

### P1.2 Exposed endpoint lockdown

- `cloudinary-signature`: `isAuthenticated('admin')`; whitelist signable params (`folder`, `public_id`, `timestamp`); reject others.
- `dashboard/admin/count`: `isAuthenticated('admin')`.
- Delete `app/api/test/route.js`.

### P1.3 JWT revocation

- Add `tokenVersion: Number` to User (default 0); `isAuthenticated` verifies the JWT's `tokenVersion` claim matches the user's current value; bump on password change and password reset. Logout unchanged.

### P1.4 Auth flow integrity

- `review/create`: derive `userId` from session (`auth.userId`); ignore client-sent value.
- `register`: generic success regardless of prior registration (no enumeration leak); OTP email sent only for genuinely new accounts.
- `profile/change-password`: fix `auth.user._id` → `auth.userId` (route currently always fails).
- Email-verification tokens: sign with `purpose: 'email-verify'` claim; verify requires it.

### P1.5 Security headers

`next.config.js` site-wide: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, HSTS in production, `frame-ancestors 'none'` on `/admin`. Strict CSP deferred (inline-script nonce work; post-launch).

### P1.6 Admin input hardening

- Zod on `orders/update-status` (enum + transition map), `profile/update` (formData), and escape `$regex` metacharacters in admin datatable filter paths (`app/api/product`, product-variant, customers, review).

## P2 — Trust, SEO & Operations

### P2.1 Server-render money pages

- Homepage: async server component querying featured products/banners from Mongo directly (pattern: existing PDP); carousels remain client components receiving server data. Visual output unchanged.
- Shop + categories: server-render initial results; filters/sort remain client-side (react-query) over the server-provided base.
- `ProductBox.jsx`: raw `<img>` → `next/image` (`fill`, `sizes`, Cloudinary transforms).
- Product-not-found → `notFound()` (kills soft-404s).
- Sitemap: category URLs target the server-rendered category pages (no query-string URLs).

### P2.2 Resilience boundaries

- `app/(root)/(website)/error.jsx` + `loading.jsx` (branded states).
- Consolidate cart hydration to redux-persist only (remove the parallel `persistedCart` localStorage read).

### P2.3 Monitoring & analytics

- Sentry (`@sentry/nextjs`), server + client.
- Vercel Analytics on storefront pages.
- `GET /api/health`: db ping + app version, no secrets.

### P2.4 Ops hygiene

- Update DEPLOYMENT.md (PayU, cron setup, remove static-export guidance).
- Remove dead `razorpay` dependency, unused `/api/cart` route, `CartProvider` dead code.
- Restrict `dangerouslyAllowSVG`.

## Testing & rollout

- Existing node:test suites (`tests/phase*.test.js`, `src/modules/**/*.test.js`) stay green; `npm run build` must pass.
- New tests: coupon math (clamping, expiry, usage limits, concurrency), reservation expiry job, transition map, OTP attempt limiting, PayU verify claim atomicity, checkout payload normalization (stale-cart fixtures).
- Rollout: phase-per-commit-series on `main`. P0 ends with a PayU sandbox end-to-end test (initiate → sandbox pay → verify → order `processing`) before P1 begins. Production deploy after full suite + build pass.
- Deliberately out of scope (documented debts): integer-paise money migration, category route restructure, react-slick/MUI bundle slimming, V2 activation, strict CSP.

## Audit findings consciously deferred

- Money as integer paise (M1) — float arithmetic guarded by `toFixed(2)` comparisons today; migrate post-launch.
- Email queue/retry for order notifications (M3) — best-effort inline send retained; `emailSentAt` flag deferred.
- Register OTP email-bombing beyond rate limiting; per-email daily caps deferred to rate-limit tuning.
- react-slick/MUI bundle slimming, `revalidate` on newly server-rendered pages (tune after launch metrics).
