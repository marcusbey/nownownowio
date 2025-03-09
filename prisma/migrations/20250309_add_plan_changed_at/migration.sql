-- Add planChangedAt column to Organization table
BEGIN;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "planChangedAt" TIMESTAMP(6);
COMMIT;
