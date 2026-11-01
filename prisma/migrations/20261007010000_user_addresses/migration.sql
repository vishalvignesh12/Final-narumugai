-- CreateTable
CREATE TABLE "addresses" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "recipientName" VARCHAR(120) NOT NULL,
    "phone" VARCHAR(16) NOT NULL,
    "line1" VARCHAR(240) NOT NULL,
    "line2" VARCHAR(240),
    "landmark" VARCHAR(120),
    "city" VARCHAR(120) NOT NULL,
    "state" VARCHAR(120) NOT NULL,
    "postalCode" CHAR(6) NOT NULL,
    "countryCode" CHAR(2) NOT NULL DEFAULT 'IN',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- Keep the V2 address scope within India and enforce valid delivery contact/PIN values.
ALTER TABLE "addresses"
    ADD CONSTRAINT "addresses_phone_india_e164_check"
        CHECK ("phone" ~ '^\+91[6-9][0-9]{9}$'),
    ADD CONSTRAINT "addresses_postal_code_india_check"
        CHECK ("postalCode" ~ '^[1-9][0-9]{5}$'),
    ADD CONSTRAINT "addresses_country_india_check"
        CHECK ("countryCode" = 'IN');

-- CreateIndex
CREATE INDEX "addresses_userId_createdAt_idx" ON "addresses"("userId", "createdAt");

-- At most one address per user can be selected as the default. Zero is allowed.
CREATE UNIQUE INDEX "addresses_one_default_per_user_key"
    ON "addresses"("userId") WHERE ("isDefault" = true);

-- AddForeignKey
ALTER TABLE "addresses"
    ADD CONSTRAINT "addresses_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
