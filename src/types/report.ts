import { Prisma } from "@prisma/client";

// Fields in form
export interface ReportParams {
  platform: "tiktok" | "meta";
  metrics: string[];
  level: string;
  dateRangeEnum: "last7" | "last14" | "last30" | "lifetime" | "custom";
  customDateRange?: {
    from: string;  // YYYY-MM-DD
    to: string;    // YYYY-MM-DD
  };
  cadence: "manual" | "hourly" | "every12h" | "daily" | "every_minute";
  delivery: "email" | "link";
  email?: string;
}

// Input type for creating a report config in the DB
export type DbReportConfigInput = Omit<DbReportConfig, "id" | "createdAt" | "generatedReports">;

// Database config type (what Prisma returns)
export interface DbReportConfig {
  id: number;
  platform: string;
  metrics: string;
  level: string;
  dateRangeEnum: string;
  customDateFrom?: Date | null;
  customDateTo?: Date | null;
  cadence: string;
  delivery: string;
  email?: string | null;
  generatedReports: DbGeneratedReport[];
  createdAt: Date;
}

export interface DbGeneratedReport {
  id: string;
  reportConfigId: number;
  data: Prisma.JsonValue; // Api returns data as array of objects, which we store as a stringified value.
  platform: string;
  dateRangeEnum: string;
  createdAt: Date;
}
