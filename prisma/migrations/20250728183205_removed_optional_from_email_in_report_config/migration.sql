/*
  Warnings:

  - Made the column `email` on table `ReportConfig` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ReportConfig" ALTER COLUMN "email" SET NOT NULL;
