# MongoDB to PostgreSQL migration strategy

**Status:** Staged migration plan. Additive PostgreSQL migrations now define the V2 identity/address and commerce schemas; no legacy production data import or traffic cutover has been performed.

## Goals and safety constraints

- Keep the existing storefront working while V2 is introduced feature by feature.
- Avoid a mechanical document-to-table conversion. Normalize current data and add only agreed domain concepts.
- Never dual-write one domain to MongoDB and PostgreSQL as independent authorities.
- Preserve order/payment history and make stock discrepancies visible before cutover.
- Retain the ability to stop before a domain cutover; after V2 accepts writes, rollback needs a defined data reconciliation path.
- No production import or destructive migration without a reviewed backup, dry run, and explicit approval.

## Migration pattern

Use a strangler migration within the existing Next.js deployment:

1. Keep legacy pages/routes intact until a V2 feature is ready.
2. Add V2 modules and versioned API routes alongside legacy behavior.
3. For a given domain, choose one database as its write authority at any point in time.
4. Backfill a consistent Mongo snapshot into PostgreSQL, validate counts/invariants, then switch that domain’s reads and writes to PostgreSQL.
5. Disable legacy mutations for that migrated domain at cutover; do not let old and new endpoints write divergent records.
6. Keep legacy read access only where cross-domain compatibility requires it, with an explicit removal milestone.
7. Remove Mongo models/dependency only after all domains and operational scripts have moved and legacy traffic is observed at zero.

Avoid untracked dual writes. If a future requirement demands overlap, design an explicit durable change-capture/reconciliation mechanism and test it as a separate feature; it is outside this Phase 1 proposal.

## Recommended sequence

1. **Foundation:** PostgreSQL/Prisma connection, schema migrations, constraints, seed strategy, health checks; no customer traffic switch.
2. **Identity:** design and implement email/password authentication, normalize/import users, and resolve duplicate identities before issuing V2 sessions. Preserve legacy email and account linkage.
3. **Addresses:** create user-owned address records and define address snapshot behavior.
4. **Catalog/categories/media:** import categories/products/images with stable source IDs recorded for reconciliation. Keep Cloudinary asset IDs.
5. **Variants/options:** map existing color/size SKUs to configurable options. Create default variants for products with no real variant only after validating physical stock and SKU policy.
6. **Inventory:** reconcile quantities and locks, import one inventory row per sellable variant, and enable transactional reservation only after concurrency tests pass.
7. **Cart/wishlist:** migrate user cart and define guest-cart policy; validate variant references and quantities.
8. **Coupons:** normalize legacy coupon fields and decide usage-limit/consumption rules before import.
9. **Orders/payments:** import immutable order snapshots, external provider references, timestamps, statuses, and payment outcomes. Do not infer missing payment states from browser result pages.
10. **Checkout/payment cutover:** stop creating new legacy checkouts at a planned boundary; allow in-flight legacy transactions to settle or reconcile them before switching.
11. **Admin, notification, and read models:** migrate after customer commerce state is stable.
12. **Legacy removal:** remove MongoDB code, routes, and dependencies only after verification and rollback window are complete.

## Data preparation and mapping

Before each import, record a source snapshot timestamp and counts. Preserve original Mongo `_id` as a `legacy_mongo_id` mapping during transition (either a temporary column per imported aggregate or a controlled mapping table). Make import batches repeatable and idempotent.

| Mongo source | PostgreSQL target | Transformation/validation |
|---|---|---|
| `users` | `users`, optional imported `addresses` | Normalize phone to E.164; detect duplicates/missing phones. Preserve email and define a password migration/reset policy. Review admin roles before import. |
| `categories` | `categories` | Normalize slug uniqueness; preserve soft-delete visibility and parent information only if present/used. |
| `products`, `productvariants` | `products`, option tables, `product_variants`, `inventory` | Resolve products without variants into an approved default SKU; map color/size; check price/quantity validity; identify duplicate SKUs and orphan references. |
| `medias` and product/variant references | `product_images` | Preserve Cloudinary `public_id`, secure URL, alt/title/order; detect missing assets without deleting provider assets. |
| embedded user cart | `carts`, `cart_items` | Validate each referenced product/variant; quarantine malformed, deleted, or non-positive quantities rather than inventing replacements. Guest browser carts are not in Mongo and are not importable. |
| `orders.products[]` | `orders`, `order_items` | Copy immutable names/prices/qty/contact/address values. Convert known currency values to INR paise only after confirming source amounts are INR major units; flag ambiguous or non-finite values. Add available SKU/options snapshots from source only when reliably linked; flag gaps. Normalize legacy status separately from payment status. |
| `coupons` | `coupons`, redemption table if evidence exists | Resolve `validity` versus `expiryDate` and UI field-name mismatch. Do not fabricate usage history or limits. |
| reviews/banners/carousels | later domain tables | Preserve only if included in the agreed initial schema and validate references/soft-delete state. |

## Inventory reconciliation gate

Inventory is not safe to migrate by copying `quantity` alone. Before import:

1. Freeze or record a precise stock snapshot boundary.
2. Compare product-level and variant-level quantities, `lockedQuantity`, order status, and recent payment results.
3. Identify orders whose payment outcome is pending/unknown and keep their stock/payment state out of automatic reconciliation.
4. Produce a per-SKU reconciliation report: source quantity, active reservations inferred (if trustworthy), sold/fulfilled totals, proposed on-hand/reserved, variance, and operator decision.
5. Require business/operations approval of unexplained variances before stock becomes sellable in V2.

Legacy lock fields are not sufficient evidence of a live reservation unless tied to a specific order and expiry. Do not translate every `lockedQuantity` value into a V2 reservation.

## Verification and cutover

For each domain, perform a dry-run import and compare:

- Record counts by type and active/deleted status.
- Unique phones, emails, slugs, SKUs, and order numbers.
- Foreign-key/orphan counts and invalid enum/status values.
- Per-SKU inventory totals and order/payment financial totals.
- Sampled customer, product, variant, cart, and order histories.
- Payment references and unresolved callback/settlement cases.

Cut over only after automated reconciliation assertions and representative manual review pass. During the cutover window, route writes to exactly one authority. Monitor errors, inventory conflicts, checkout completion, callback processing, and reconciliation mismatches.

## Rollback and recovery

- Before PostgreSQL accepts production writes, rollback means return traffic to the legacy path and discard/rebuild V2 data from the source snapshot.
- After PostgreSQL accepts writes, switching back to Mongo without replay would lose new users/orders/inventory changes. Use forward repair by default; any rollback requires an approved reverse export/reconciliation plan and a write freeze or change capture.
- Keep backups and migration/import reports. Test restore and recovery before cutover.
- Do not delete source collections or old code during the cutover period. Remove them only in the final cleanup phase after legacy traffic and reconciliation obligations are closed.

## Migration tooling and operational decisions

Phase 2 should choose a repeatable script/command workflow for dry-run, import, validation, and resume. Production execution must be separately authorized. Determine the deployment’s PostgreSQL connection-pooling approach and migration execution location before hosting rollout; do not run schema migrations on every serverless request/startup.
