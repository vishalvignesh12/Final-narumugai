# Development

## Local development setup

Use Node.js 26.x and npm. Install the lockfile-defined dependencies with `npm ci`, create `.env.local` using [Configuration](CONFIGURATION.md), and start the hot-reloading server with `npm run dev`. Keep local credentials and test data separate from production.

## Package scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts Next.js with Turbopack. |
| `npm run build` | Creates a production build. |
| `npm start` | Starts the production server; run after a successful build. |
| `npm run lint` | Runs the `next lint` command declared in `package.json`. Check compatibility with the installed Next.js version if it reports an unknown command. |
| `npm run network` | Runs `scripts/set-network-access.js` without arguments. |
| `npm run localhost` | Runs the same script with `localhost`. |
| `npm run populate-db` | Runs `scripts/populate-database.js`; may create or alter database content. |
| `npm run populate-via-api` | Runs `scripts/populate-via-api.js`; may write through the running app's API. |
| `npm run db:validate` / `db:generate` | Validate the Prisma schema or generate the ignored Prisma client. |
| `npm run db:migrate:deploy` / `db:status` | Apply checked-in migrations or report migration status for the configured database. |
| `npm run db:seed` | Run the guarded development PostgreSQL seed. |
| `npm run test:users` / `test:commerce` | Run focused Node test suites that do not need database credentials. |
| `npm run test:auth` | Run the focused auth and session unit tests. |

## Code organization and conventions

- Add route UI using the App Router file conventions under `app/`; route groups such as `(website)` are organizational and omitted from URLs.
- Add API handlers under `app/api/<resource>/.../route.js` and export named HTTP method functions (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
- Keep reusable storefront/admin interface in `components/Application/Website` and `components/Application/Admin`; shared primitives are in `components/ui`.
- Put Mongoose schemas in `models/`, shared server utilities in `lib/`, and Redux state in `store/`.
- Follow neighboring JavaScript/JSX style. ESLint is configured in `eslint.config.mjs`; no formatter configuration is present.
- Validate API authorization in legacy Mongo handlers. Middleware gates `/api/v2/*` when `ENABLE_V2_API` is false and protects admin, account, and auth pages.

## Change workflow

1. Identify the owning page, API route, model, and client state involved in the change.
2. Preserve existing request/response shapes unless the caller is updated at the same time.
3. For checkout or stock changes, examine `docs/notes/FIRST_COME_FIRST_SERVE_CHECKOUT.md`, `docs/notes/CART_AND_ORDER_MANAGEMENT.md`, and the live stock/order handlers together.
4. Run the available lint/build checks described in [Testing](TESTING.md) when appropriate.
5. Update the documentation when route behavior, configuration, data models, or operational steps change.

No branch naming rule, pull-request template, or contribution workflow is defined in the files inspected for this documentation.
