# Narumugai

Narumugai is a full-stack saree e-commerce application built with Next.js. It provides a customer storefront, authentication and account management, cart and checkout flows, and an admin console for managing the catalogue, orders, customers, and content.

## What the project includes

- Product browsing, search, category pages, product details, cart, wishlist, and reviews.
- Customer registration, email verification, password login, email OTP login, and password reset.
- Checkout with PayU payment integration, coupon application, stock locking, and order management.
- Admin management for products, product variants, categories, coupons, media, banners, carousels, customers, orders, and reviews.
- MongoDB persistence through Mongoose and Cloudinary-backed media uploads.
- Responsive storefront and admin interfaces using React, Tailwind CSS, Radix UI, and Material UI.

## Technology stack

- **Framework:** Next.js 16 App Router
- **Runtime:** Node.js 26.x
- **Language:** JavaScript and JSX
- **UI:** React 19, Tailwind CSS, Radix UI, Material UI
- **Data:** MongoDB and Mongoose
- **Authentication:** JWT cookies with role-based access control
- **Integrations:** Cloudinary, Nodemailer/SMTP, and PayU
- **Testing:** Node.js built-in test runner

## Requirements

- Node.js 26.x and npm
- MongoDB
- Cloudinary credentials for media uploads
- SMTP credentials for email features
- PayU credentials for payment testing

## Getting started

### 1. Install dependencies

```bash
git clone <repository-url>
cd Final-narumugai
npm ci
```

### 2. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

At minimum, configure `MONGODB_URI`, `SECRET_KEY`, and `NEXT_PUBLIC_BASE_URL`. Add Cloudinary, SMTP, PayU, and reservation settings when using those features.

See [Configuration](docs/CONFIGURATION.md) for the complete variable reference. Never commit `.env.local` or real credentials.

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server with Turbopack. |
| `npm run build` | Create a production build. |
| `npm start` | Serve the production build. |
| `npm run lint` | Run ESLint. |
| `npm run test:auth` | Run authentication and session tests. |
| `npm run test:commerce` | Run the commerce test suite. |
| `npm run test:phase1` through `npm run test:phase6` | Run focused project test phases. |
| `npm run populate-db` | Seed sample data directly into MongoDB. |
| `npm run populate-via-api` | Seed data through the running application API. |
| `npm run network` | Configure network access for development. |
| `npm run localhost` | Configure the app for localhost development. |

Use seed and migration utilities only with a disposable or explicitly selected database.

## Project structure

```text
app/
  (root)/(website)/     Customer-facing pages
  (root)/(admin)/       Protected admin pages
  api/                  Next.js API route handlers
components/             Shared, storefront, and admin UI components
hooks/                  Reusable React hooks
lib/                    Database, authentication, validation, and utility modules
models/                 Mongoose schemas
routes/                 Centralized application route constants
scripts/                Development and data utilities
store/                  Client-side Redux state
tests/                  Node.js test suites
docs/                   Architecture, setup, API, deployment, and testing notes
```

## Authentication and access

The middleware protects `/admin`, `/my-account`, and `/auth` routes. Admin pages require an authenticated user with the `admin` role; customer account pages require the `user` role. API handlers perform their own authentication and authorization checks.

## Documentation

- [Getting started](docs/GETTING-STARTED.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Configuration](docs/CONFIGURATION.md)
- [Development guide](docs/DEVELOPMENT.md)
- [API reference](docs/API.md)
- [Testing and verification](docs/TESTING.md)
- [Deployment](docs/DEPLOYMENT.md)

Additional implementation notes are available under [`docs/notes/`](docs/notes/).

## Testing and production checks

Run the relevant checks before shipping changes:

```bash
npm run lint
npm run test:commerce
npm run build
```

Use test credentials, a non-production database, and a test payment environment when validating checkout or integrations. The automated tests do not replace live database, email, Cloudinary, or payment smoke tests.

## Security notes

- Keep all secrets in environment configuration, never in source control.
- Use separate databases and third-party credentials for development and production.
- Do not expose debug, seed, or migration routes in a public production deployment.
- Rotate credentials immediately if they are exposed.
