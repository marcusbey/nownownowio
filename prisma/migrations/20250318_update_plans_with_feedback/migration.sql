-- Add feedback-related fields to the OrganizationPlan model
ALTER TABLE "OrganizationPlan" ADD COLUMN "hasFeedbackFeature" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "OrganizationPlan" ADD COLUMN "maxFeedbackItems" INTEGER NOT NULL DEFAULT 0;

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
