-- Add source field to PostView table
ALTER TABLE "PostView" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'app';

-- Create index on source field for better query performance
CREATE INDEX "PostView_source_idx" ON "PostView"("source");
