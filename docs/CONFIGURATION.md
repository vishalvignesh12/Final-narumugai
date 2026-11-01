# Configuration

Configuration is read from `process.env`. For local development, copy `.env.example` to `.env.local` at the project root.

## Variables

| Variable | Required for | Notes |
|---|---|---|
| `MONGODB_URI` | Database-backed routes | Mongoose connection string used by `lib/databaseConnection.js`. |
| `SECRET_KEY` | JWT authentication | Secret used to sign/verify the `access_token` JWT. Keep stable across instances and private. |
| `NEXT_PUBLIC_BASE_URL` | Canonical/absolute URLs, payment callbacks, client requests | Publicly exposed at build/runtime to browser code. `lib/config.js` defaults to `http://localhost:3000` in development and `https://narumugai.com` in production when unset. |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Client Cloudinary setup | Public Cloudinary cloud identifier. |
| `NEXT_PUBLIC_CLOUDINARY_API_KEY` | Client Cloudinary setup | Public API key; not a secret. |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Browser media upload | Upload preset used by client upload components. |
| `CLOUDINARY_SECRET_KEY` | Signed Cloudinary operations | Server-side secret; keep private. |
| `NODEMAILER_HOST` | Email OTP and transactional email | SMTP server host. Email OTP uses the existing Nodemailer configuration; no SMS or OTP-specific provider secret is needed. |
| `NODEMAILER_PORT` | Transactional email | SMTP port. |
| `NODEMAILER_SECURE` | Transactional email | SMTP secure/TLS mode consumed by Nodemailer configuration; use the value format expected by `lib/sendMail.js`. |
| `NODEMAILER_EMAIL` | Transactional email | Sender/login account, depending on the mail helper. |
| `NODEMAILER_PASSWORD` | Transactional email | SMTP credential; keep private. |
| `ADMIN_ORDER_EMAIL` | Paid order notifications | Recipient address for new paid-order alerts. If empty, the customer confirmation is still sent and the admin alert is skipped. |
| `PAYU_KEY` | PayU checkout | Merchant key. |
| `PAYU_SALT` | PayU checkout | Merchant salt used for request/response hashes; keep private. |
| `PAYU_ENDPOINT` | PayU checkout | Gateway endpoint for the selected environment. |
| `PAYU_PROTOCOL` | PayU callback URL construction | Protocol used to build success/failure callback URLs. |
| `NODE_ENV` | Framework/runtime behavior | Set by Next.js in standard development/production commands. |
| `DEV_SEED_CUSTOMER_PHONE` | Optional development seed | Fixture customer phone; never grants admin access. |
| `DEV_SEED_CUSTOMER_NAME` | Optional development seed | Fixture customer display name. |
| `RESERVATION_EXPIRY_SECRET` | Reservation reconciliation | Secret for the protected reservation expiry endpoint. |

## Example local file

```dotenv
NEXT_PUBLIC_BASE_URL=http://localhost:3000
MONGODB_URI=mongodb://127.0.0.1:27017/narumugai_dev
SECRET_KEY=replace-with-a-long-random-local-secret
PAYU_KEY=
PAYU_SALT=
PAYU_ENDPOINT=https://test.payu.in/_payment
| `RESERVATION_EXPIRY_SECRET` | Reservation reconciliation | Secret for the protected reservation expiry endpoint. |

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_API_KEY=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
CLOUDINARY_SECRET_KEY=

NODEMAILER_HOST=
NODEMAILER_PORT=
NODEMAILER_SECURE=
NODEMAILER_EMAIL=
NODEMAILER_PASSWORD=
ADMIN_ORDER_EMAIL=

PAYU_KEY=
PAYU_SALT=
PAYU_ENDPOINT=
PAYU_PROTOCOL=https
```

This is a template only; leave integrations blank only when not exercising their paths. Do not use the example secret outside local development.

## Environment and URL behavior

`lib/config.js` chooses the base URL using `NODE_ENV` and `NEXT_PUBLIC_BASE_URL`; production has a repository default of `https://narumugai.com`. In network development, set the public base URL to the host/IP that browsers and callbacks can reach. `NEXT_PUBLIC_` values are bundled for browser use and must not contain credentials.

## Secret handling

- Keep `.env.local` out of version control and restrict production secrets to the hosting platform's environment settings.
- Use separate MongoDB databases and gateway credentials for development and production.
- Rotate credentials if they are exposed; do not include them in screenshots, logs, or documentation.
- Configure `SECRET_KEY` consistently across replicas so users do not receive inconsistent token verification.
