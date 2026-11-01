# Authentication status

SMS and V2 phone OTP authentication has been removed. The active legacy storefront retains email OTP for email verification and sign-in, with password reset links sent by email.

V2 PostgreSQL sessions, profile, and commerce modules may still exist, but there is currently no public login path that creates those sessions. Do not expose V2 authenticated features until an email/password authentication flow and identity migration are implemented.
