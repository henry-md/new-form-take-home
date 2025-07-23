-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportConfig" (
    "id" SERIAL NOT NULL,
    "platform" TEXT NOT NULL,
    "metrics" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "dateRange" TEXT NOT NULL,
    "cadence" TEXT NOT NULL,
    "delivery" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
