-- The OTP verification table was created by the identity foundation migration;
-- this adds durable request-limit counters without storing raw IPs or phones.
CREATE TABLE "auth_rate_limits" (
    "subjectHash" CHAR(64) NOT NULL,
    "windowStartedAt" TIMESTAMPTZ(3) NOT NULL,
    "requestCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "auth_rate_limits_pkey" PRIMARY KEY ("subjectHash"),
    CONSTRAINT "auth_rate_limits_hash_format_check" CHECK ("subjectHash" ~ '^[a-f0-9]{64}$'),
    CONSTRAINT "auth_rate_limits_count_nonnegative_check" CHECK ("requestCount" >= 0)
);

CREATE INDEX "auth_rate_limits_windowStartedAt_idx"
    ON "auth_rate_limits"("windowStartedAt");
