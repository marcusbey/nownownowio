/*
  Warnings:

  - Made the column `type` on table `OrganizationPlan` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "OrganizationPlan" ALTER COLUMN "type" SET NOT NULL;
