-- Drop unused columns: OTPs are stored in Redis, never on the user row.
ALTER TABLE "User" DROP COLUMN IF EXISTS "otpCode";
ALTER TABLE "User" DROP COLUMN IF EXISTS "otpExpires";

-- Postgres does not auto-index foreign keys; these power the dashboard and
-- analytics aggregation queries (findMany by userId, groupBy by linkId).
CREATE INDEX IF NOT EXISTS "Link_userId_idx" ON "Link"("userId");
CREATE INDEX IF NOT EXISTS "Analytics_linkId_idx" ON "Analytics"("linkId");
CREATE INDEX IF NOT EXISTS "Analytics_linkId_timestamp_idx" ON "Analytics"("linkId", "timestamp");
