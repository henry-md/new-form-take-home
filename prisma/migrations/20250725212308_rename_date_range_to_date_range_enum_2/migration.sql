/*
  Warnings:

  - You are about to drop the column `dateRange` on the `GeneratedReport` table. All the data in the column will be lost.
  - You are about to drop the column `dateRange` on the `ReportConfig` table. All the data in the column will be lost.
  - Added the required column `dateRangeEnum` to the `GeneratedReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateRangeEnum` to the `ReportConfig` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GeneratedReport" DROP COLUMN "dateRange",
ADD COLUMN     "dateRangeEnum" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ReportConfig" DROP COLUMN "dateRange",
ADD COLUMN     "dateRangeEnum" TEXT NOT NULL;
