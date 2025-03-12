-- Remove widgetToken from User model
ALTER TABLE "User" DROP COLUMN IF EXISTS "widgetToken";
