-- First, modify the OrganizationPlanType enum to include BASIC and PRO
ALTER TYPE "OrganizationPlanType" ADD VALUE IF NOT EXISTS 'BASIC';
ALTER TYPE "OrganizationPlanType" ADD VALUE IF NOT EXISTS 'PRO';

-- Add billingCycle enum type if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'billingcycle') THEN
        CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'ANNUAL', 'LIFETIME');
    END IF;
END $$;

-- Remove unique constraint from type column
ALTER TABLE "OrganizationPlan" DROP CONSTRAINT IF EXISTS "OrganizationPlan_type_key";

-- Add billingCycle column with default value
ALTER TABLE "OrganizationPlan" ADD COLUMN IF NOT EXISTS "billingCycle" "BillingCycle" DEFAULT 'MONTHLY';

-- Update billing cycles based on plan types
-- Set LIFETIME billing cycle for plans that have LIFETIME in their ID
UPDATE "OrganizationPlan"
SET "billingCycle" = 'LIFETIME'
WHERE "id" LIKE '%LIFETIME%';

-- Set ANNUAL billing cycle for plans that have ANNUAL in their ID
UPDATE "OrganizationPlan"
SET "billingCycle" = 'ANNUAL'
WHERE "id" LIKE '%ANNUAL%';

-- Update plan types based on our new structure
-- Convert PREMIUM to BASIC (only after the enum type has been updated)
UPDATE "OrganizationPlan"
SET "type" = 'BASIC'
WHERE "type" = 'PREMIUM';

-- Convert LIFETIME type to PRO (only after the enum type has been updated)
UPDATE "OrganizationPlan"
SET "type" = 'PRO'
WHERE "type" = 'LIFETIME';

-- Create index on type and billingCycle for better query performance
CREATE INDEX IF NOT EXISTS "OrganizationPlan_billingCycle_idx" ON "OrganizationPlan"("billingCycle");
CREATE INDEX IF NOT EXISTS "OrganizationPlan_type_billingCycle_idx" ON "OrganizationPlan"("type", "billingCycle");
