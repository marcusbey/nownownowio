-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('NEW', 'ACKNOWLEDGED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED');

-- CreateTable
CREATE TABLE "WidgetFeedback" (
  "id" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "email" TEXT,
  "votes" INTEGER NOT NULL DEFAULT 0,
  "status" "FeedbackStatus" NOT NULL DEFAULT 'NEW',
  "organizationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WidgetFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WidgetFeedbackVoter" (
  "id" TEXT NOT NULL,
  "feedbackId" TEXT NOT NULL,
  "ipAddress" TEXT NOT NULL,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WidgetFeedbackVoter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WidgetFeedback_organizationId_idx" ON "WidgetFeedback"("organizationId");

-- CreateIndex
CREATE INDEX "WidgetFeedback_createdAt_idx" ON "WidgetFeedback"("createdAt");

-- CreateIndex
CREATE INDEX "WidgetFeedback_votes_idx" ON "WidgetFeedback"("votes");

-- CreateIndex
CREATE INDEX "WidgetFeedback_status_idx" ON "WidgetFeedback"("status");

-- CreateIndex
CREATE UNIQUE INDEX "WidgetFeedbackVoter_feedbackId_ipAddress_key" ON "WidgetFeedbackVoter"("feedbackId", "ipAddress");

-- CreateIndex
CREATE INDEX "WidgetFeedbackVoter_feedbackId_idx" ON "WidgetFeedbackVoter"("feedbackId");

-- CreateIndex
CREATE INDEX "WidgetFeedbackVoter_ipAddress_idx" ON "WidgetFeedbackVoter"("ipAddress");

-- AddForeignKey
ALTER TABLE "WidgetFeedback" ADD CONSTRAINT "WidgetFeedback_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WidgetFeedbackVoter" ADD CONSTRAINT "WidgetFeedbackVoter_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "WidgetFeedback"("id") ON DELETE CASCADE ON UPDATE CASCADE;
