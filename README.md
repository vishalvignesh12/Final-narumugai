# Narumugai

Narumugai is a saree e-commerce website with a customer storefront, account and checkout flows, and an administrative catalog and order console.

## Features

- Browse and search products, categories, featured items, and promotional banners.
- Manage a customer cart, wishlist, profile, orders, and product reviews.
- Register and verify by email OTP; sign in with email/password plus an email OTP; reset passwords with an emailed link.
- Place orders through the PayU payment flow, with stock locking and atomic stock deduction.
- Administer products, variants, categories, coupons, media, banners, carousels, customers, orders, and reviews.
- Store product and media records in MongoDB/Mongoose and image assets through Cloudinary.

## Requirements

- Node.js 26.x (declared in `package.json` and `.nvmrc`)
- npm
- A MongoDB database and credentials for the external services used by enabled features

## Quick start

```bash
npm ci
npm run dev
```

Before the first run, copy `.env.example` to `.env.local` and fill in the values described in [docs/CONFIGURATION.md](docs/CONFIGURATION.md). Open `http://localhost:3000`. The storefront requires a reachable MongoDB database.

## Project documentation

- [Getting started](docs/GETTING-STARTED.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Configuration](docs/CONFIGURATION.md)
- [Development](docs/DEVELOPMENT.md)
- [Testing and verification](docs/TESTING.md)
- [API route reference](docs/API.md)
- [Deployment](docs/DEPLOYMENT.md)
- Existing operational and implementation notes: [cart and order management](docs/notes/CART_AND_ORDER_MANAGEMENT.md), [first-come-first-served checkout](docs/notes/FIRST_COME_FIRST_SERVE_CHECKOUT.md), [checkout fixes](docs/notes/CHECKOUT_ERROR_FIXES.md), [product card upgrades](docs/notes/PRODUCT_CARD_UPGRADES.md), [mobile product layout](docs/notes/MOBILE_2_COLUMN_LAYOUT.md), and [category sorting](docs/notes/CATEGORY_SORTING_IMPLEMENTATION.md).
- Existing technical notes: [environment configuration](docs/environment-configuration.md), [Cloudinary image fixes](docs/cloudinary-image-issues-fix.md), [Open Graph implementation](docs/openGraph-implementation.md), and [Open Graph images setup](docs/openGraph-images-setup.md).

## Common commands

```bash
npm run dev       # Development server (Turbopack)
npm run build     # Production build
npm start         # Serve a completed production build
npm run lint      # Invoke the configured Next lint script
```

See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for all package scripts and [docs/TESTING.md](docs/TESTING.md) for the current verification situation.
