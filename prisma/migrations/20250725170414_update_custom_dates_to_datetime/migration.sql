/*
  Warnings:

  - The `customDateFrom` column on the `ReportConfig` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `customDateTo` column on the `ReportConfig` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ReportConfig" DROP COLUMN "customDateFrom",
ADD COLUMN     "customDateFrom" TIMESTAMP(3),
DROP COLUMN "customDateTo",
ADD COLUMN     "customDateTo" TIMESTAMP(3);
