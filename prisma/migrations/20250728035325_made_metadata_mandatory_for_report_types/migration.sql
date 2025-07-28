/*
  Warnings:

  - Made the column `metadata` on table `ReportConfig` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ReportConfig" ALTER COLUMN "metadata" SET NOT NULL;
