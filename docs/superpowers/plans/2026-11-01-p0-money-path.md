# P0 Money Path Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the legacy checkout money path — coupon system, stock reservation expiry, PayU verify hardening, cancellation — without any visual change to the storefront.

**Architecture:** Repair the existing legacy Mongo flow in place. Pure logic is extracted into alias-free `lib/*.js` modules so `node --test` can exercise it; route handlers stay thin and call those modules inside Mongo transactions. Cron-based reservation expiry mirrors the existing v2 secret-guarded route pattern.

**Tech Stack:** Next.js 15 App Router route handlers, Mongoose/MongoDB transactions, Zod, node:test.

**Spec:** `docs/superpowers/specs/2026-11-01-launch-readiness-design.md` (§P0). Plans for P1 (security) and P2 (trust/SEO/ops) will be written after this plan executes, per the spec's rollout gate (PayU sandbox E2E between P0 and P1).

## Global Constraints

- No visual changes to any storefront page; data-layer changes only.
- Legacy V2 code (`src/modules/*`, `app/api/v2/*`) is untouched.
- Lib modules imported by tests must use only relative imports and npm packages — **no `@/...` aliases** (tests run via plain `node --test`, which cannot resolve aliases).
- Money stays as rupee floats; comparisons via `Number(x).toFixed(2)` (paise migration is a documented post-launch debt).
- Mongo transactions via `OrderModel.startSession()`; no external calls (email, PayU) while a transaction is open.
- Keep API responses via existing `response()` / `catchError()` helpers (`lib/helperFunction.js`, `lib/apiResponse.js`).
- Existing test suites (`npm run test:phase2`, `test:commerce`, etc.) must stay green; `npm run build` must pass at every task end.

## Review Focus

1. **Stale localStorage carts from older app versions** (missing `variantId`, string `qty`/prices) must complete checkout, not 400 — pinned by Task 1 tests.
2. **A coupon with `discountPercentage` > 100** must never produce a total ≤ 0 sent to PayU; discount clamps to subtotal — pinned by Task 4 tests.
3. **Duplicate PayU success callbacks** (gateway retries) must not re-send notifications or re-write the order — pinned by Task 8 tests + sandbox E2E (Task 11).
4. **User-cancel of a `processing` (paid) order must not restore stock** — stock returns only after admin refund approval — pinned by Task 10 tests.
5. **Coupon overspend under concurrency** (last redemption of a limited coupon) must fail closed — pinned by Task 4 filter-builder test + conditional `$inc` in Task 5.

---

### Task 1: Checkout contract (shared Zod schemas, alias-free)

**Files:**
- Create: `lib/checkout-contract.js`
- Test: `tests/checkout-contract.test.js`

**Interfaces:**
- Produces: `checkoutProductSchema` (Zod object: `productId: string min 1`, `variantId` preprocessed `v => v ?? null` then `z.string().nullable()`, `name: string min 1`, `qty: z.coerce.number().int().min(1).max(20)`, `mrp: z.coerce.number().nonnegative()`, `sellingPrice: z.coerce.number().nonnegative()`), and `normalizeCheckoutProducts(raw)` → `checkoutProductSchema.array().safeParse(raw)` result passthrough.

- [ ] **Step 1: Write the failing test** `tests/checkout-contract.test.js`

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { checkoutProductSchema } from '../lib/checkout-contract.js'

const valid = { productId: '64b000000000000000000001', name: 'Silk Saree', qty: 1, mrp: 2999, sellingPrice: 1999 }

test('stale cart item with missing variantId parses to null', () => {
  const { variantId } = checkoutProductSchema.parse({ ...valid })
  assert.equal(variantId, null)
})

test('string qty and prices coerce to numbers', () => {
  const parsed = checkoutProductSchema.parse({ ...valid, qty: '2', mrp: '2999.00', sellingPrice: '1999.00', variantId: '64b000000000000000000002' })
  assert.equal(parsed.qty, 2); assert.equal(parsed.mrp, 2999); assert.equal(parsed.sellingPrice, 1999)
})

test('qty 0, qty 21, and qty 1.5 are rejected', () => {
  assert.equal(checkoutProductSchema.safeParse({ ...valid, qty: 0 }).success, false)
  assert.equal(checkoutProductSchema.safeParse({ ...valid, qty: 21 }).success, false)
  assert.equal(checkoutProductSchema.safeParse({ ...valid, qty: 1.5 }).success, false)
})

test('variantId "null" string stays a string (legacy sentinel handled by pricing)', () => {
  assert.equal(checkoutProductSchema.parse({ ...valid, variantId: 'null' }).variantId, 'null')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/checkout-contract.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `lib/checkout-contract.js`**

Export `checkoutProductSchema` exactly as in Interfaces (use `z.preprocess(v => v ?? null, z.string().nullable())` for `variantId`; `z.coerce.number()` for qty/mrp/sellingPrice). Only import `zod`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/checkout-contract.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/checkout-contract.js tests/checkout-contract.test.js
git commit -m "feat(checkout): alias-free checkout product contract with stale-cart coercion"
```

---

### Task 2: Wire the contract into initiate-payment and the checkout page

**Files:**
- Modify: `app/api/payment/initiate-payment/route.js:14-21` (replace inline `productSchema` with import; keep `orderSchema` composition)
- Modify: `app/(root)/(website)/checkout/page.jsx` (payload map at ~line 199; cart map effect at ~line 46)

**Interfaces:**
- Consumes: `checkoutProductSchema` from Task 1.
- Produces: server accepts stale carts; client always sends `variantId: cartItem.variantId ?? null`, `qty: Number(cartItem.qty || 1)`, `mrp: Number(cartItem.mrp || 0)`, `sellingPrice: Number(cartItem.sellingPrice || 0)`.

- [ ] **Step 1: Write the failing test** — extend `tests/checkout-contract.test.js`

```js
test('order payload fixture from a stale cart passes full product array validation', () => {
  const staleCart = [{ productId: '64b000000000000000000001', name: 'Saree', qty: undefined, mrp: '999', sellingPrice: '499' }]
  const payload = { products: staleCart.map(i => ({ ...i, variantId: i.variantId ?? null, qty: Number(i.qty || 1), mrp: Number(i.mrp || 0), sellingPrice: Number(i.sellingPrice || 0) })) }
  assert.equal(checkoutProductSchema.array().safeParse(payload.products).success, true)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/checkout-contract.test.js`
Expected: FAIL — `normalizeCheckoutProducts`/mapping not yet used (this test validates the client-side mapping contract; the assertion is the spec for the page change).

- [ ] **Step 3: Implement**

Route: replace inline `productSchema` with `checkoutProductSchema` import (alias import `@/lib/checkout-contract` is fine in route code) and delete the old inline definition. Page: in the cart-map effect and in `placeOrder`, apply the mapping from Interfaces.

- [ ] **Step 4: Verify**

Run: `node --test tests/checkout-contract.test.js && npm run test:phase2`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/api/payment/initiate-payment/route.js "app/(root)/(website)/checkout/page.jsx" tests/checkout-contract.test.js
git commit -m "fix(checkout): accept stale localStorage carts via shared contract"
```

---

### Task 3: Cart revalidation before payment (product AND variant lines)

**Files:**
- Modify: `app/api/cart-verification/route.js` (currently drops product-level lines — `ProductVariantModel.findById(null)` returns null and the item vanishes)
- Modify: `app/(root)/(website)/checkout/page.jsx` (`placeOrder` calls verification before building payload)

**Interfaces:**
- Produces: `POST /api/cart-verification` accepts `[{ productId, variantId, qty }]` where `variantId` may be null or `fallback-<id>`; returns verified lines in the existing shape `{ productId, variantId, name, url, size, color, mrp, sellingPrice, media, qty }`, dropping lines whose product/variant is deleted or missing, and clamping `qty` to available stock.
- Consumes: `isProductInventoryLine` from `lib/orderInventory.js` (existing).

- [ ] **Step 1: Write the failing test** `tests/cart-verification-contract.test.js` (pure mapping helper)

Create `lib/cartVerificationContract.js` (alias-free, pure): `mapVerifiedLine({ source, dbLine })` and `clampQty(requested, available)`.
Test: `clampQty(5, 3) === 3`; `clampQty(5, 0) === 0`; a `fallback-`/null `variantId` line maps with `variantId: null` and the product's prices; a variant line maps with variant prices.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/cart-verification-contract.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Route: branch on `isProductInventoryLine(item)` — product lines resolve via `ProductModel.findById` (name, slug, mrp, sellingPrice, quantity, deletedAt), variant lines as today; drop deleted/missing; clamp qty. Page: before building the order payload, POST the cart lines to `/api/cart-verification`, replace `verifiedCartData` with the response, and `showToast('info', 'Some items were removed or updated to match current availability.')` when the count shrinks.

- [ ] **Step 4: Verify**

Run: `node --test tests/cart-verification-contract.test.js && npm run build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/api/cart-verification/route.js lib/cartVerificationContract.js tests/cart-verification-contract.test.js "app/(root)/(website)/checkout/page.jsx"
git commit -m "feat(checkout): revalidate persisted cart (both inventory types) before payment"
```

---

### Task 4: Coupon math and model upgrade (pure core)

**Files:**
- Create: `lib/coupons.js` (alias-free, pure)
- Modify: `models/Coupon.model.js` (schema only)
- Modify: `lib/zodSchema.js` (admin coupon schema parity: `discountPercentage` max 100)
- Test: `tests/coupon-math.test.js`

**Interfaces:**
- Produces:
  - `normalizeCouponCode(code)` → `String(code).trim().toLowerCase()`
  - `escapeRegex(str)` → regex-metacharacter-escaped string
  - `couponCodeFilter(code)` → `{ $regex: '^(escaped)$', $options: 'i' }`
  - `computeCouponState({ coupon, subtotal })` → `{ valid: true, discountAmount }` (discount = `Math.min(subtotal * pct / 100, subtotal)`, rounded to 2dp) or `{ valid: false, reason }` where reason ∈ `'invalid' | 'expired' | 'deleted' | 'min_purchase'`; validates `coupon.discountPercentage` ∈ (0, 100].
  - `couponConsumedFilter(coupon)` → conditional filter for the atomic `$inc` (`{ usedCount: { $lt: coupon.usageLimit } }` only when `usageLimit != null`, else `{}`)
- Coupon model gains: `usageLimit: Number, min 1, default null`; `usedCount: Number, min 0, default 0`; `perUserLimit: Number, min 1, default null`; `redemptions: [{ orderId: ObjectId, userId: ObjectId, at: Date }]`; `discountPercentage` gets `min: 0, max: 100`.

- [ ] **Step 1: Write the failing test** `tests/coupon-math.test.js`

```js
test('discount clamps to subtotal', () => {
  const state = computeCouponState({ coupon: { discountPercentage: 150, minShoppingAmount: 0, validity: FUTURE, deletedAt: null }, subtotal: 1000 })
  assert.equal(state.valid, true); assert.equal(state.discountAmount, 1000)
})
test('expired/deleted/min-purchase/invalid-pct reasons', () => { /* one assert per reason */ })
test('couponConsumedFilter omits condition when unlimited', () => {
  assert.deepEqual(couponConsumedFilter({ usageLimit: null }), {})
  assert.deepEqual(couponConsumedFilter({ usageLimit: 5 }), { usedCount: { $lt: 5 } })
})
test('code filter escapes regex metacharacters', () => {
  assert.equal(couponCodeFilter('SAVE.10*').$regex, '^save\\.10\\*$')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/coupon-math.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement** `lib/coupons.js` + model fields exactly per Interfaces. Model edits are additive (no migration needed; new fields default on read).

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/coupon-math.test.js && npm run test:phase2`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/coupons.js tests/coupon-math.test.js models/Coupon.model.js lib/zodSchema.js
git commit -m "feat(coupons): clamped pure coupon math, usage-limit fields, regex-safe lookup"
```

---

### Task 5: Repair coupon validation in initiate-payment + align /api/coupon/apply

**Files:**
- Modify: `app/api/payment/initiate-payment/route.js:82-101` (validation block) and transaction block (~line 143, coupon consumption after order lines, before commit)
- Modify: `app/api/coupon/apply/route.js` (require auth; server-computed subtotal; use `computeCouponState`)

**Interfaces:**
- Consumes: `computeCouponState`, `couponCodeFilter`, `couponConsumedFilter`, `normalizeCouponCode` from Task 4.
- Produces: initiate-payment rejects `totalAmount <= 0` with `'Order total must be greater than zero.'` before any DB write; coupon consumption is a conditional update inside the order-creation transaction: `CouponModel.updateOne({ _id, ...couponConsumedFilter(coupon) }, { $inc: { usedCount: 1 }, $push: { redemptions: { orderId, userId, at } } }, { session })`; a matched count of 0 aborts with `'Coupon usage limit reached.'`

- [ ] **Step 1: Write the failing test** (extends `tests/coupon-math.test.js` — the state/limits logic is pinned there; this task's testable surface is the zero-total rejection message constant)

Create `lib/checkout-contract.js` export addition: `CHECKOUT_ERRORS = { nonPositiveTotal: 'Order total must be greater than zero.', couponLimit: 'Coupon usage limit reached.' }`; test asserts the constants exist and are non-empty.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/checkout-contract.test.js`
Expected: FAIL — constants not defined.

- [ ] **Step 3: Implement**

initiate-payment: in `calculateServerTotal`, replace the `expiryDate` lookup with `couponCodeFilter` + `validity: { $gte: now }` + `deletedAt: null`, use `computeCouponState` for the discount, and return early with `CHECKOUT_ERRORS.nonPositiveTotal` if `totalAmount <= 0` (throw, so the existing catch/abort handles it). Inside the transaction after `newOrder.save`, consume the coupon per Interfaces when `couponCode` was applied. `/api/coupon/apply`: require `isAuthenticated('user')`, accept `code` + `products` lines, compute subtotal from DB prices (variant/product lookup, same rules as initiate's line loop), return `computeCouponState` result or 400 with its reason.

- [ ] **Step 4: Verify**

Run: `node --test tests/coupon-math.test.js tests/checkout-contract.test.js && npm run build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/api/payment/initiate-payment/route.js app/api/coupon/apply/route.js lib/checkout-contract.js tests/checkout-contract.test.js
git commit -m "fix(coupons): validity-field lookup, clamped discount, transactional usage limits"
```

---

### Task 6: Reservation expiry field + shared stock-restore module

**Files:**
- Modify: `models/Order.model.js` (add `reservationExpiresAt: Date, default null` + partial index on `{ reservationExpiresAt: 1 }` where `status: 'pending-payment'`)
- Create: `lib/inventoryRestore.js` (move `unlockStock` from `app/api/payment/verify/route.js:13-45`; same signature `unlockStock(order, session = null)`)
- Modify: `app/api/payment/verify/route.js` (import `unlockStock` instead of local definition); `app/api/orders/cancel/route.js` (import for reuse in Task 8)
- Test: none new (behavior-preserving move) — existing suites + build are the gate.

- [ ] **Step 1: Move the code** — `unlockStock` verbatim into `lib/inventoryRestore.js` with relative imports (`@/` aliases are fine here: this module is not node-test-imported; verify no test imports it).

- [ ] **Step 2: Verify**

Run: `npm run test:phase2 && npm run test:phase5 && npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add lib/inventoryRestore.js models/Order.model.js app/api/payment/verify/route.js app/api/orders/cancel/route.js
git commit -m "refactor(inventory): shared unlockStock module; order reservationExpiresAt field"
```

---

### Task 7: Expiry job — secret-guarded route, cron, opportunistic sweep

**Files:**
- Create: `lib/reservationState.js` (alias-free, pure): `isExpiredReservation(order, now)` → `order.status === 'pending-payment' && order.reservationExpiresAt != null && order.reservationExpiresAt < now`; `schedulerAuthorized(authHeader, secret)` → `secret != null && authHeader === \`Bearer ${secret}\``
- Create: `lib/reservationExpiry.js` (DB-bound): `expireStaleReservations({ now = new Date(), session = null })` → claims each candidate atomically (`findOneAndUpdate({ _id, status: 'pending-payment', reservationExpiresAt: { $lt: now } }, { $set: { status: 'failed', payment_status: 'failed', cancellationReason: 'Reservation expired.' } })`), then `unlockStock(order, session)` per claim; returns `{ expiredCount }`
- Create: `app/api/operations/reservations/expire/route.js` (POST; guard via `schedulerAuthorized(request.headers.get('authorization'), process.env.RESERVATION_EXPIRY_SECRET)`; 401 JSON on failure; calls `expireStaleReservations()`; `RESERVATION_EXPIRY_SECRET` already exists in `.env.example`)
- Create: `vercel.json` — `{ "crons": [{ "path": "/api/operations/reservations/expire", "schedule": "*/5 * * * *" }] }`
- Modify: `app/api/payment/initiate-payment/route.js` — set `reservationExpiresAt: new Date(Date.now() + 15 * 60 * 1000)` on `newOrder`; opportunistic sweep: in the catch path of the stock loop, when a decrement fails because quantity is insufficient, call `expireStaleReservations({ session })` once and retry that decrement before throwing the availability error
- Test: `tests/reservation-state.test.js`

- [ ] **Step 1: Write the failing test** `tests/reservation-state.test.js`

```js
test('isExpiredReservation matches only stale pending-payment orders', () => {
  const now = new Date('2026-11-01T10:00:00Z')
  const base = { status: 'pending-payment', reservationExpiresAt: new Date('2026-11-01T09:59:00Z') }
  assert.equal(isExpiredReservation(base, now), true)
  assert.equal(isExpiredReservation({ ...base, reservationExpiresAt: new Date('2026-11-01T10:01:00Z') }, now), false)
  assert.equal(isExpiredReservation({ ...base, status: 'processing' }, now), false)
  assert.equal(isExpiredReservation({ ...base, reservationExpiresAt: null }, now), false)
})
test('schedulerAuthorized requires configured secret and Bearer match', () => {
  assert.equal(schedulerAuthorized('Bearer s3cret', 's3cret'), true)
  assert.equal(schedulerAuthorized('Bearer wrong', 's3cret'), false)
  assert.equal(schedulerAuthorized('Bearer s3cret', undefined), false)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/reservation-state.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement** per Files. The route mirrors `app/api/v2/operations/reservations/expire/route.js`'s guard shape but claims Mongoose orders via `expireStaleReservations`. The cron path serves the legacy flow only.

- [ ] **Step 4: Run test to verify it passes + build**

Run: `node --test tests/reservation-state.test.js && npm run build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/reservationState.js lib/reservationExpiry.js app/api/operations/reservations/expire/route.js vercel.json app/api/payment/initiate-payment/route.js tests/reservation-state.test.js
git commit -m "feat(orders): reservation expiry job with cron + opportunistic sweep"
```

---

### Task 8: Payment verify hardening — atomic claim + sanitized failure notes

**Files:**
- Modify: `app/api/payment/verify/route.js:87-140` (success branch) and `:162-179` (failure note)
- Create: `lib/sanitize.js` (alias-free, pure): `sanitizeGatewayText(value, max = 500)` → `String(value ?? '').replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, max) || 'Unknown'`
- Test: `tests/sanitize.test.js`

**Interfaces:**
- Produces: success branch claims via `OrderModel.findOneAndUpdate({ _id: order._id, status: 'pending-payment' }, { $set: { status: 'processing', payment_status: 'paid', payment_method: 'PayU', payment_id: data.mihpayid } }, { new: true, session })`; when the claim returns null, redirect to the existing already-processed redirect (line 79-83 path) with NO notifications and NO writes — idempotent.
- Consumes: `sanitizeGatewayText` for `data.error_Message` in the failure `ordernote` and in the failure redirect query param.

- [ ] **Step 1: Write the failing test** `tests/sanitize.test.js`

```js
test('control chars stripped, length capped, empty becomes Unknown', () => {
  assert.equal(sanitizeGatewayText('bad\x00\x1Fvalue'.padEnd(600, 'x')).length, 500)
  assert.equal(sanitizeGatewayText('clean reason'), 'clean reason')
  assert.equal(sanitizeGatewayText(undefined), 'Unknown')
  assert.equal(sanitizeGatewayText('\n\r\t'), 'Unknown')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/sanitize.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement** — success branch: use the atomic claim; `if (!claimedOrder)` return the already-processed success redirect from lines 79-83 (token re-issue allowed, zero side effects). All subsequent notification/redirect code uses `claimedOrder`. Failure branch: wrap `data.error_Message` in `sanitizeGatewayText`. Also sanitize the value interpolated into the redirect URL.

- [ ] **Step 4: Verify**

Run: `node --test tests/sanitize.test.js && npm run test:phase5 && npm run build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/api/payment/verify/route.js lib/sanitize.js tests/sanitize.test.js
git commit -m "fix(payu): idempotent success claim via atomic status transition; sanitize gateway text"
```

---

### Task 9: payment-success page renders from DB, not URL params

**Files:**
- Modify: `app/(root)/(website)/payment-success/page.jsx` (currently `'use client'` rendering "Payment Successful 🎉" and amount from search params at lines 11-15, 74-77)

**Interfaces:**
- Produces: async server component; reads `searchParams` (`orderId`); loads the order via `OrderModel.findOne({ order_id })` selecting `status, payment_status, totalAmount, order_id, transaction_id, createdAt`; renders the existing success UI only when `payment_status === 'paid'` (values from the DB); otherwise `redirect('/payment-failed?error=unverified_payment')`. URL params remain display hints only.

- [ ] **Step 1: Implement** — convert to an async server component (Next 15: `await searchParams`). Keep the existing JSX/visual structure; replace data sources. If the page's interactive parts require client components, keep them as leaves fed by server props.

- [ ] **Step 2: Verify**

Run: `npm run build`
Expected: PASS (this page has no unit-test surface; sandbox E2E in Task 11 exercises it).

- [ ] **Step 3: Commit**

```bash
git add "app/(root)/(website)/payment-success/page.jsx"
git commit -m "fix(payments): payment-success renders verified DB state, not URL params"
```

---

### Task 10: Order transitions — cancellation, transition map, statusHistory

**Files:**
- Create: `lib/orderTransitions.js` (alias-free, pure)
- Modify: `models/Order.model.js` (status enum gains `'cancel-requested'`; add `statusHistory: [{ at: Date, from: String, to: String, actorId: ObjectId ref User, note: String }]`)
- Modify: `app/api/orders/cancel/route.js:30-38` (allowed-source statuses)
- Modify: `app/api/orders/update-status/route.js` (full rewrite of the body)
- Test: `tests/order-transitions.test.js`

**Interfaces:**
- Produces (`lib/orderTransitions.js`):
  - `ALLOWED_TRANSITIONS` map: `pending-payment → [failed, cancelled, processing, cancel-requested]`; `processing → [shipped, cancelled, cancel-requested]`; `cancel-requested → [cancelled, refunded, processing]`; `shipped → [delivered, cancelled]`; `delivered → [refunded]`; `failed → []`; `cancelled → []`; `refunded → []`
  - `canTransition(from, to)` → boolean
  - `TRANSITION_EFFECTS = { cancelled: { restoreStock: true }, refunded: { restoreStock: true } }` — restore happens ONLY for these targets and only when `payment_status === 'paid'`
  - `PAYMENT_STATUS_SYNC = { cancelled: 'failed', refunded: 'refunded', failed: 'failed', processing: 'paid' }`
- Cancel route: claim filter gains `status: 'pending-payment'` (replacing `'pending'`); on success restore stock via `lib/inventoryRestore.js` (as today). For `processing` orders the route instead performs the `processing → cancel-requested` claim (no stock restore; stores reason; response message: 'Cancellation requested. Our team will process your refund.').
- Update-status route: Zod `{ _id: string length 24, status: z.enum([...all statuses]) }`; reject `!canTransition(order.status, status)` with 409 `'Illegal status transition.'`; append `{ at: new Date(), from, to, actorId: auth.userId, note }` to `statusHistory`; apply `PAYMENT_STATUS_SYNC`; restore stock when `TRANSITION_EFFECTS[to].restoreStock && order.payment_status === 'paid'` (guarded atomic claim first, restore inside the same transaction; reuse `lib/inventoryRestore.js`).

- [ ] **Step 1: Write the failing test** `tests/order-transitions.test.js`

```js
test('legal and illegal transitions', () => {
  assert.equal(canTransition('processing', 'shipped'), true)
  assert.equal(canTransition('delivered', 'processing'), false)
  assert.equal(canTransition('cancel-requested', 'refunded'), true)
  assert.equal(canTransition('failed', 'processing'), false)
})
test('stock restore only for paid cancelled/refunded', () => {
  assert.equal(TRANSITION_EFFECTS.cancelled.restoreStock, true)
  assert.equal(TRANSITION_EFFECTS.shipped?.restoreStock, undefined)
})
test('payment status sync map', () => {
  assert.equal(PAYMENT_STATUS_SYNC.refunded, 'refunded')
  assert.equal(PAYMENT_STATUS_SYNC.cancelled, 'failed')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/order-transitions.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement** per Files/Interfaces. Wrap the cancel route's new `processing` branch and update-status's restore path in a session transaction like the existing code.

- [ ] **Step 4: Verify**

Run: `node --test tests/order-transitions.test.js && npm run test:phase2 && npm run build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/orderTransitions.js models/Order.model.js app/api/orders/cancel/route.js app/api/orders/update-status/route.js tests/order-transitions.test.js
git commit -m "feat(orders): transition map, cancel-requested flow, statusHistory audit"
```

---

### Task 11: P0 rollout gate — PayU sandbox end-to-end + full suite

**Files:**
- Modify: `docs/DEPLOYMENT.md` (PayU sandbox verification checklist; `RESERVATION_EXPIRY_SECRET` + cron note; correct the Razorpay references)

- [ ] **Step 1: Run every suite**

Run: `npm run test:phase2 && npm run test:commerce && node --test tests/*.test.js && npm run build`
Expected: all PASS.

- [ ] **Step 2: Sandbox E2E (requires `PAYU_*` test credentials in `.env`)** — execute manually and record results in `docs/DEPLOYMENT.md`:
  1. Checkout with a stale-format cart (manually edit a localStorage cart item to remove `variantId`) → order initiates.
  2. Apply a coupon → discounted total → pay in sandbox → order `processing`, coupon `usedCount` incremented.
  3. Force a coupon failure (usage limit) → clean error, no order.
  4. Abandon at the gateway → wait ~20 min (or invoke the expire route with the Bearer secret) → order `failed`, stock restored.
  5. Replay the success callback (re-POST the surl form) → no duplicate email, no status change.

- [ ] **Step 3: Commit**

```bash
git add docs/DEPLOYMENT.md
git commit -m "docs(deployment): P0 sandbox verification checklist and cron setup"
```
