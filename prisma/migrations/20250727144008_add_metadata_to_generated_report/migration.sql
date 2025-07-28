/*
  Warnings:

  - Added the required column `metadata` to the `GeneratedReport` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GeneratedReport" ADD COLUMN     "metadata" JSONB NOT NULL;
