-- CreateTable
CREATE TABLE "GeneratedReport" (
    "id" TEXT NOT NULL,
    "reportConfigId" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "platform" TEXT NOT NULL,
    "dateRange" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeneratedReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GeneratedReport_reportConfigId_idx" ON "GeneratedReport"("reportConfigId");

-- AddForeignKey
ALTER TABLE "GeneratedReport" ADD CONSTRAINT "GeneratedReport_reportConfigId_fkey" FOREIGN KEY ("reportConfigId") REFERENCES "ReportConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;
