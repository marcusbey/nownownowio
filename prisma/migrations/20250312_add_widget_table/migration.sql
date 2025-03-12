-- CreateTable
CREATE TABLE "Widget" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "widgetToken" TEXT NOT NULL,
  "settings" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Widget_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Widget_organizationId_idx" ON "Widget"("organizationId");

-- CreateIndex
CREATE INDEX "Widget_createdAt_idx" ON "Widget"("createdAt");

-- AddForeignKey
ALTER TABLE "Widget" ADD CONSTRAINT "Widget_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
