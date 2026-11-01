DROP TABLE IF EXISTS "auth_rate_limits";
DROP TABLE IF EXISTS "otp_verifications";
DROP TYPE IF EXISTS "OtpPurpose";

DROP TABLE IF EXISTS "admin_bootstrap";
DROP TYPE IF EXISTS "AdminBootstrapStatus";

ALTER TABLE "users" ALTER COLUMN "status" DROP DEFAULT;
CREATE TYPE "UserStatus_new" AS ENUM ('ACTIVE', 'SUSPENDED');
ALTER TABLE "users" ALTER COLUMN "status" TYPE "UserStatus_new"
  USING (CASE WHEN "status" = 'SUSPENDED' THEN 'SUSPENDED' ELSE 'ACTIVE' END)::"UserStatus_new";
DROP TYPE "UserStatus";
ALTER TYPE "UserStatus_new" RENAME TO "UserStatus";
ALTER TABLE "users" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
