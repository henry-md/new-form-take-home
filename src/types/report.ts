import { Prisma } from "@prisma/client";

// Fields in form
export interface ReportParams {
  platform: "tiktok" | "meta";
  metrics: (
    | "spend"
    | "impressions" 
    | "clicks"
    | "conversions"
    | "cost_per_conversion"
    | "conversion_rate"
    | "ctr"
    | "cpc"
    | "reach"
    | "frequency"
  )[];
  level: (
    | "AUCTION_ADVERTISER" // TikTok
    | "AUCTION_AD"          // TikTok
    | "AUCTION_CAMPAIGN"    // TikTok
    | "account"             // Meta
    | "campaign"            // Meta
    | "ad_group"            // Meta
    | "ad"                  // Meta
  );
  dateRangeEnum: (
    | "last7"
    | "last14"
    | "last30"
    | "lifetime"
    | "custom"
  );
  dateRange?: {
    from: string;  // YYYY-MM-DD
    to: string;    // YYYY-MM-DD
  };
  cadence: (
    | "manual"
    | "every_minute" // For testing
    | "hourly"
    | "every12h"
    | "daily"
  );
  delivery: (
    | "email"
    | "link"
  );
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
