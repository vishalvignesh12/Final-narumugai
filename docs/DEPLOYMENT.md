# Deployment

## Runtime requirements

This application uses Next.js server rendering, API route handlers, MongoDB, authentication cookies, and third-party integrations. A static-only host cannot provide the full application. Use a Node.js-compatible Next.js host with a supported server runtime and configure all required environment variables there.

## Build and start

```bash
npm ci
npm run build
npm start
```

The project requires Node.js 26.x, as declared in `package.json` and `.nvmrc`. `next.config.js` does not enable static export. Configure the host to run the production Next.js server and route traffic to its listening port.

## Production checklist

- Set `NODE_ENV=production` through the host's runtime.
- Configure `NEXT_PUBLIC_BASE_URL` to the canonical HTTPS site origin. Because it is public and may be compiled into client bundles, set it before building.
- Configure MongoDB, JWT, Cloudinary, email, and PayU values from [Configuration](CONFIGURATION.md). Use production credentials only in the production environment.
- Allow the hosting environment to reach MongoDB and any required external services.
- Configure the payment gateway's callback/return behavior to reach the deployed `/api/payment/verify` route and verify callback URL/protocol construction against the host's proxy setup.
- Set `RESERVATION_EXPIRY_SECRET` to a strong random value. The payment initiation flow also performs an opportunistic sweep of expired reservations. On Vercel Hobby, use an external scheduler or manually call the protected `/api/operations/reservations/expire` endpoint; the five-minute Vercel Cron schedule requires Pro.
- Use HTTPS so authentication cookies and payment flows are protected in transit.
- Restrict or remove test, faker, debug, and migration routes before exposing the deployment.
- Perform a smoke test of registration, email verification, image loading, admin authorization, checkout, payment return, and order status updates.
- For PayU sandbox verification, confirm a successful callback changes the order to `processing`/`paid`, a failed callback restores inventory, repeated success callbacks do not duplicate notifications, and an abandoned pending payment is released by the opportunistic sweep or protected expiry endpoint.

## P0 rollout verification status

The automated P0 verification currently passes:

- `npm run test:commerce` — 25 tests passed.
- `node --test tests/*.test.js` — 44 tests passed.
- `npm run build` — production build passed.

The PayU sandbox scenarios remain a manual deployment check because they require a browser checkout session, sandbox gateway interaction, and test catalog/order data. Run the following against the deployed environment before launch:

1. Remove `variantId` from a persisted cart item and confirm checkout still initiates.
2. Apply a coupon and confirm the charged amount is server-computed and `usedCount` increments once.
3. Exhaust a limited coupon and confirm initiation fails without creating an order.
4. Abandon a gateway checkout and invoke the protected reservation-expiry endpoint after expiry; confirm the order becomes `failed` and inventory is restored.
5. Replay a successful PayU callback; confirm the order remains unchanged and notifications are not duplicated.

## Hosting notes

The archived [legacy deployment notes](archive/LEGACY-DEPLOYMENT.md) contain earlier GoDaddy cPanel and Vercel guidance. Treat provider-specific steps there as historical and confirm current host support and configuration against the chosen provider. No platform adapter or deployment workflow is defined in the application configuration in this repository.

## Rollback and data

Application rollback does not automatically revert MongoDB mutations. Back up production data before schema or migration changes, and review scripts and `/api/debug/migrate-quantity` before use. Keep payment/order reconciliation available when rolling back checkout code.
