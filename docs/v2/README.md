# Narumugai V2 architecture package

**Status:** PostgreSQL V2 profile/address and commerce foundations are implemented alongside the legacy MongoDB storefront. OTP authentication and the V2 admin bootstrap were removed; V2 authenticated APIs have no public session-creation flow, and customer traffic/data have not been cut over.

The MongoDB storefront is the only active commerce application. Middleware returns 404 for `/api/v2/*` unless `ENABLE_V2_API=true`; keep the flag unset/false until the documented migration and identity cutover are approved.

## Documents

- [System architecture](SYSTEM-ARCHITECTURE.md): deployment shape, trust boundaries, and request flow.
- [Relational data model](DATA-MODEL.md): proposed PostgreSQL entities, relationships, constraints, and indexes.
- [Modules and API architecture](MODULES-AND-API.md): ownership boundaries and route/service/repository contracts.
- [Commerce state machines](COMMERCE-STATE-MACHINES.md): order, inventory reservation, checkout, and payment transitions.
- [Migration strategy](MIGRATION-STRATEGY.md): incremental MongoDB-to-PostgreSQL rollout and rollback controls.
- [Supabase setup](SUPABASE-SETUP.md): connection variables, local commands, migrations, and seeding.
- [Authentication status](AUTHENTICATION.md): phone/OTP login was removed; V2 has no public session-creation flow.

## Design principles

1. Keep one Next.js modular monolith; modules are code boundaries, not separate services.
2. PostgreSQL is the sole source of truth for each migrated domain after its cutover.
3. Derive identity, prices, discounts, stock, and payment state on the server.
4. Use database constraints and transactions for correctness across concurrent requests.
5. Keep provider-specific code behind narrow adapters; start with the existing PayU integration unless the payment-provider decision below changes.
6. Do not remove MongoDB behavior until the corresponding V2 flow has passed migration checks and production acceptance.

## Implementation decisions

The following schema-level choices are resolved for planning:

- **Currency:** INR only for the initial V2 release; store all amounts as integer paise and include `currency = INR` on orders and payments. Multi-currency is out of scope until explicitly required.
- **Guest checkout:** supported. A guest cart is server-owned through a high-entropy opaque token in a Secure, HttpOnly, SameSite cookie; store only its hash. Guest orders have no user FK and carry the same immutable contact/address snapshots. On login, merge the guest cart by variant under server rules and revalidate quantities/availability. Order lookup must use an authenticated owner or a separate high-entropy guest access token; order number alone is never authorization.
- **V2 administrator provisioning:** unavailable until a supported V2 authentication flow is designed and implemented. Use the active legacy admin login for current operations.
- **Addresses:** V2 shipping addresses are India-only. The user sets the default address explicitly; a new address is never selected automatically, and deleting a default leaves no default until the user selects one.

These decisions are implemented in the V2 foundation and commerce modules. Production readiness still depends on external account and policy checks:

- V2 PostgreSQL authentication remains unavailable until an email/password login and identity migration are implemented.
- Shipping and tax remain zero in this initial slice; confirm business rules before enabling production checkout.
- Coupon stacking is disabled; global/per-customer limits are stored per coupon, and redemption is consumed only after verified payment.
- Reservations expire after 10 minutes. Configure and monitor a production scheduler for the protected reconciliation endpoint.
- Refunds and post-payment restocking require admin approval; confirm the operating procedure and provider refund reconciliation before launch.
- PayU is implemented as the V2 provider. Verify merchant callback and reconciliation behavior with the account before live use.
- Decide the V2 administrator authentication policy before production access.

The resolved choices above are architecture decisions for V2 planning. Implementation must still validate their security and migration details in the relevant feature plan.
