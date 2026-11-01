# Getting started

## Prerequisites

- Node.js 20.x and npm.
- Git.
- MongoDB access for application data.
- Credentials for the external services needed by the features you intend to exercise (Cloudinary, SMTP, and PayU).

## Install and configure

```bash
git clone <repository-url>
cd Final-narumugai
npm ci
```

Create `.env.local` in the repository root and populate the variables described in [Configuration](CONFIGURATION.md). There is no checked-in `.env.example`. Do not commit real credentials.

## Start locally

```bash
npm run dev
```

Visit `http://localhost:3000`. Set `NEXT_PUBLIC_BASE_URL` to the URL you use to access the app when absolute URLs are needed. MongoDB-backed functionality requires a valid `MONGODB_URI`. For local testing, use a non-production database and gateway credentials.

## Optional data utilities

The package exposes `npm run populate-db` and `npm run populate-via-api`; inspect `scripts/populate-database.js` and `scripts/populate-via-api.js` before running them because they write data. `npm run network` and `npm run localhost` invoke `scripts/set-network-access.js` to change local network-access configuration.

## Common setup issues

- **Database connection failure:** verify `MONGODB_URI`, network access rules on the MongoDB host, and that the database is available to the machine running Next.js.
- **Authentication redirects or invalid JWTs:** set `SECRET_KEY` consistently for the server and use a fresh login after changing it.
- **Email code, verification, or password reset delivery failure:** check the SMTP host, port, TLS setting, email account, and password variables in [Configuration](CONFIGURATION.md).
- **Payment callback returns incorrectly:** ensure `PAYU_KEY`, `PAYU_SALT`, `PAYU_ENDPOINT`, `PAYU_PROTOCOL`, and `NEXT_PUBLIC_BASE_URL` match the selected PayU environment and public URL.
- **Images fail to load/upload:** check Cloudinary credentials and configured upload preset; optimized remote image support is restricted to `res.cloudinary.com` in `next.config.js`.

## Next steps

- Read [Architecture](ARCHITECTURE.md) for page/API/data boundaries.
- Read [Development](DEVELOPMENT.md) before changing code.
- Read [Testing](TESTING.md) for available checks and gaps.
