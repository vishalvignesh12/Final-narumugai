# V2 feature implementation plan

This plan turns the V2 architecture package into an implementation checklist. The existing legacy storefront and APIs remain available while V2 endpoints are introduced.

## Decisions recorded for this implementation

- Currency is INR in integer paise. Shipping and tax are not calculated in this initial V2 slice.
- One coupon may apply per order; coupons do not stack, and a redemption is consumed only after verified payment.
- Inventory reservations expire after 10 minutes. Release only after definitive payment failure or a successful expiry reconciliation.
- Cancellation, refunds, and post-payment restocking require admin approval.
- Wishlists contain products, not variants. V2 authentication is not implemented.
- PayU remains the active payment provider. Payment state changes require server-side verification.
- Reservation expiry is exposed as a secret-protected scheduled handler; deployment must configure a scheduler to invoke it.

## Work breakdown and verification

1. **Relational domain foundation** — add catalog, variant, inventory, cart, wishlist, coupon, order, payment, reservation, and audit models plus additive SQL migration. Verify schema and migration diff.
2. **Catalog and inventory** — implement public category/list/detail APIs, allowlisted filters and pagination, product option/variant response, and authorized inventory adjustment. Test validation, filtering, and authorization.
3. **Cart and wishlist** — implement authenticated and opaque-cookie guest ownership, quantity validation, guest merge at login, and product-level wishlist. Test ownership isolation and merge behavior.
4. **Coupons and checkout** — implement advisory coupon validation and authoritative transactional checkout with idempotency, snapshots, reservation, and payment intent. Test pricing, contention outcomes, coupon limits, and idempotency.
5. **Payments and orders** — verify PayU callbacks, deduplicate events, finalize/release reservations, expose owner-scoped order reads, and implement admin-approved cancellation/refund transitions. Test signatures, replay, ownership, and transitions.
6. **Admin and operations** — add admin-only catalog/coupon/order controls, audit records, and scheduled reservation expiry. Test authorization, state transitions, and expiry retries.
7. **Storefront adoption and migration readiness** — connect V2 user flows where safe, document environment/deployment and dry-run migration gates, and verify regression suites/build.

Production imports, live provider callbacks, and deployment scheduler setup require environment access and are not performed by this code change.
