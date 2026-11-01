# Testing and verification

## Current test setup

V2 auth, user-profile, catalog, cart, wishlist, coupon, checkout, payment, order, and admin modules use Node's built-in test runner; no Jest, Vitest, Mocha, or Playwright configuration is present. The unit suites inject repositories and services, so they do not require Supabase credentials.

## Available checks

```bash
npm run test:auth
npm run test:users
npm run test:commerce
npx prisma validate
npm run lint
npm run build
```

`test:auth` covers session primitives and route handlers. `test:users` covers self-profile and address validation, owner-scoped persistence, default-address transactions, and route behavior. `test:commerce` covers the isolated business and route-handler suites for commerce modules. These suites do not replace live database integration or HTTP deployment tests.

The lint script is defined as `next lint`; if the installed Next.js release no longer supports that subcommand, use the project's ESLint configuration directly (for example, `npx eslint .`) and record that the package script needs updating. A successful build checks compilation and route integration but does not prove checkout, payment, email, or database behavior.

## Manual smoke-test areas

With a non-production database and test credentials, cover:

1. Public home, category/shop listing, product detail, search/filter, cart, and wishlist.
2. Registration email OTP, email/password plus email OTP sign-in, sign-out, password reset link, and role-based page access.
3. Checkout validation, coupon application, stock lock/unlock, payment initiation/callback, and resulting order status.
4. Admin CRUD for products/variants, categories, coupons, banners/carousels, media, reviews, customers, and orders.
5. Image upload/display, notification email delivery, pagination/export flows, and mobile navigation/layout.

## Test data and safety

Seed scripts and debug/migration endpoints can change persistent data. Use a disposable database, review the script/handler implementation, and avoid enabling debug routes in a public production deployment. Never test payment callbacks with production secrets or real customer data.

## Coverage and CI

No coverage thresholds or CI workflow files are defined in the repository. Add automated tests around checkout totals, authorization, stock concurrency, payment state transitions, and destructive admin operations before relying on those flows for regression protection.
