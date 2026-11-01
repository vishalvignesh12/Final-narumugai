-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING_PHONE_VERIFICATION', 'ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('SIGN_IN', 'ADMIN_ACTIVATION', 'PHONE_CHANGE');

-- CreateEnum
CREATE TYPE "AdminBootstrapStatus" AS ENUM ('PENDING_PHONE_VERIFICATION', 'ACTIVATED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "phone" VARCHAR(16) NOT NULL,
    "email" VARCHAR(320),
    "displayName" VARCHAR(120) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING_PHONE_VERIFICATION',
    "phoneVerifiedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" CHAR(64) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMPTZ(3),
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "revokedAt" TIMESTAMPTZ(3),

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_verifications" (
    "id" UUID NOT NULL,
    "phone" VARCHAR(16) NOT NULL,
    "purpose" "OtpPurpose" NOT NULL,
    "otpHash" VARCHAR(255) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "verifiedAt" TIMESTAMPTZ(3),
    "consumedAt" TIMESTAMPTZ(3),

    CONSTRAINT "otp_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_bootstrap" (
    "key" VARCHAR(16) NOT NULL DEFAULT 'initial',
    "userId" UUID NOT NULL,
    "status" "AdminBootstrapStatus" NOT NULL DEFAULT 'PENDING_PHONE_VERIFICATION',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMPTZ(3),

    CONSTRAINT "admin_bootstrap_pkey" PRIMARY KEY ("key")
);

-- Keep normalized phone numbers and OTP attempt counters valid even if a future
-- write path bypasses application validation.
ALTER TABLE "users"
    ADD CONSTRAINT "users_phone_e164_check"
    CHECK ("phone" ~ '^\+[1-9][0-9]{7,14}$');

ALTER TABLE "otp_verifications"
    ADD CONSTRAINT "otp_verifications_phone_e164_check"
    CHECK ("phone" ~ '^\+[1-9][0-9]{7,14}$'),
    ADD CONSTRAINT "otp_verifications_attempts_nonnegative_check"
    CHECK ("attempts" >= 0),
    ADD CONSTRAINT "otp_verifications_expiry_after_creation_check"
    CHECK ("expiresAt" > "createdAt");

ALTER TABLE "admin_bootstrap"
    ADD CONSTRAINT "admin_bootstrap_singleton_key_check"
    CHECK ("key" = 'initial');

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_status_idx" ON "users"("role", "status");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_tokenHash_key" ON "sessions"("tokenHash");

-- CreateIndex
CREATE INDEX "sessions_userId_expiresAt_idx" ON "sessions"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "sessions_expiresAt_idx" ON "sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "otp_verifications_phone_purpose_createdAt_idx" ON "otp_verifications"("phone", "purpose", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "otp_verifications_expiresAt_idx" ON "otp_verifications"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "admin_bootstrap_userId_key" ON "admin_bootstrap"("userId");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_bootstrap" ADD CONSTRAINT "admin_bootstrap_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
