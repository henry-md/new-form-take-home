-- AlterTable
ALTER TABLE "GeneratedReport" ALTER COLUMN "metadata" SET DEFAULT '{}';

-- AlterTable
ALTER TABLE "ReportConfig" ADD COLUMN     "metadata" JSONB;
