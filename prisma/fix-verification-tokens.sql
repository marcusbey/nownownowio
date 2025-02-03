-- Drop the failed migration
DROP TABLE IF EXISTS "_prisma_migrations";

-- Drop the failed foreign key if it exists
ALTER TABLE "verificationtokens" DROP CONSTRAINT IF EXISTS "verificationtokens_userId_fkey";

-- Drop the userId column if it exists
ALTER TABLE "verificationtokens" DROP COLUMN IF EXISTS "userId";

-- Add the column as nullable
ALTER TABLE "verificationtokens" ADD COLUMN "userId" TEXT;

-- Update existing tokens with user IDs based on identifier (email)
UPDATE "verificationtokens" vt
SET "userId" = u.id
FROM "User" u
WHERE vt.identifier = u.email;

-- Delete orphaned tokens (those without matching users)
DELETE FROM "verificationtokens"
WHERE "userId" IS NULL;

-- Make the column non-nullable after cleaning up orphaned tokens
ALTER TABLE "verificationtokens" ALTER COLUMN "userId" SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE "verificationtokens" ADD CONSTRAINT "verificationtokens_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
