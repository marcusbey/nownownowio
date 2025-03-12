-- Migration to remove the widgetToken column from the User table
-- This migration aligns the database schema with our code changes
-- that moved widget functionality from user-based to organization-based

-- Check if the column exists before attempting to drop it
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'User' AND column_name = 'widgetToken'
    ) THEN
        ALTER TABLE "User" DROP COLUMN "widgetToken";
    END IF;
END $$;
