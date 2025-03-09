-- Add previousPlanId column to Organization table
BEGIN;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "previousPlanId" TEXT;
COMMIT;

-- Add foreign key constraint if it doesn't exist
BEGIN;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Organization_previousPlanId_fkey'
    ) THEN
        ALTER TABLE "Organization" 
        ADD CONSTRAINT "Organization_previousPlanId_fkey" 
        FOREIGN KEY ("previousPlanId") 
        REFERENCES "OrganizationPlan"("id") 
        ON DELETE SET NULL;
    END IF;
END $$;
COMMIT;
