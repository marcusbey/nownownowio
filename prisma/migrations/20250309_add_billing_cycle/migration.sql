-- Step 1: Add new enum values in a separate transaction
ALTER TYPE "OrganizationPlanType" ADD VALUE IF NOT EXISTS 'BASIC';
ALTER TYPE "OrganizationPlanType" ADD VALUE IF NOT EXISTS 'PRO';
COMMIT;

-- Step 2: Create BillingCycle enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'billingcycle') THEN
        CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'ANNUAL', 'LIFETIME');
    END IF;
END $$;
COMMIT;

-- Step 3: Modify table structure
BEGIN;
-- Remove unique constraint from type column
ALTER TABLE "OrganizationPlan" DROP CONSTRAINT IF EXISTS "OrganizationPlan_type_key";

-- Add billingCycle column with default value
ALTER TABLE "OrganizationPlan" ADD COLUMN IF NOT EXISTS "billingCycle" "BillingCycle" DEFAULT 'MONTHLY';
COMMIT;

-- Step 4: Update data in separate transactions
BEGIN;
-- Update billing cycles based on plan types
-- Set LIFETIME billing cycle for plans that have LIFETIME in their ID
UPDATE "OrganizationPlan"
SET "billingCycle" = 'LIFETIME'
WHERE "id" LIKE '%LIFETIME%';
COMMIT;

BEGIN;
-- Set ANNUAL billing cycle for plans that have ANNUAL in their ID
UPDATE "OrganizationPlan"
SET "billingCycle" = 'ANNUAL'
WHERE "id" LIKE '%ANNUAL%';
COMMIT;

BEGIN;
-- Update plan types based on our new structure
-- Convert PREMIUM to BASIC
UPDATE "OrganizationPlan"
SET "type" = 'BASIC'
WHERE "type" = 'PREMIUM';
COMMIT;

BEGIN;
-- Convert LIFETIME type to PRO
UPDATE "OrganizationPlan"
SET "type" = 'PRO'
WHERE "type" = 'LIFETIME';
COMMIT;

-- Step 5: Create indexes in a separate transaction
BEGIN;
-- Create index on type and billingCycle for better query performance
CREATE INDEX IF NOT EXISTS "OrganizationPlan_billingCycle_idx" ON "OrganizationPlan"("billingCycle");
CREATE INDEX IF NOT EXISTS "OrganizationPlan_type_billingCycle_idx" ON "OrganizationPlan"("type", "billingCycle");
COMMIT;
