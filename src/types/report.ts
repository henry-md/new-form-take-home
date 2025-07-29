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

// Use Prisma.validator to create a reusable query shape for type generation
export const reportConfigWithIncludes = Prisma.validator<Prisma.ReportConfigDefaultArgs>()({
  include: { generatedReports: true }, // One to many
});

export const generatedReportWithIncludes = Prisma.validator<Prisma.GeneratedReportDefaultArgs>()({
  include: { reportConfig: true }, // One to one
});

// Input type for creating a report config in the DB
// This ensures we match exactly what Prisma's `create` method expects.
export type DbReportConfigInput = Omit<Prisma.ReportConfigCreateInput, 'generatedReports' | 'createdAt'>;

// Database config type (what Prisma returns)
// This generates a precise type based on the schema and the includes.
export type DbReportConfig = Prisma.ReportConfigGetPayload<typeof reportConfigWithIncludes>;

// Report config type as returned by the API (includes latestReportId)
export type DbReportConfigWithLatest = Omit<DbReportConfig, 'generatedReports'> & {
  latestReportId: string | null;
  signedUrl: string | null;
};

export type DbGeneratedReport = Prisma.GeneratedReportGetPayload<typeof generatedReportWithIncludes>;
