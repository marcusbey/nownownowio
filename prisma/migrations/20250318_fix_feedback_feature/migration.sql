-- Add feedback-related fields to the OrganizationPlan model if they don't exist
DO $$ 
BEGIN
    -- Check if hasFeedbackFeature column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'OrganizationPlan' 
        AND column_name = 'hasFeedbackFeature'
    ) THEN
        -- Add the column if it doesn't exist
        ALTER TABLE "OrganizationPlan" ADD COLUMN "hasFeedbackFeature" BOOLEAN NOT NULL DEFAULT false;
    END IF;

    -- Check if maxFeedbackItems column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'OrganizationPlan' 
        AND column_name = 'maxFeedbackItems'
    ) THEN
        -- Add the column if it doesn't exist
        ALTER TABLE "OrganizationPlan" ADD COLUMN "maxFeedbackItems" INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;

-- Update existing plans to enable feedback features based on plan type
UPDATE "OrganizationPlan" SET 
  "hasFeedbackFeature" = true,
  "maxFeedbackItems" = 100
WHERE "type" = 'PRO';

UPDATE "OrganizationPlan" SET 
  "hasFeedbackFeature" = true,
  "maxFeedbackItems" = 20
WHERE "type" = 'BASIC';

UPDATE "OrganizationPlan" SET 
  "hasFeedbackFeature" = false,
  "maxFeedbackItems" = 5
WHERE "type" = 'FREE';
