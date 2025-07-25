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
  cadence: "manual" | "hourly" | "every12h" | "daily";
  delivery: "email" | "link";
  email?: string;
} 

// Database config type (what Prisma returns)
export interface DbReportConfig {
  id: number;
  platform: string;
  metrics: string;
  level: string;
  dateRange: string;
  customDateFrom?: Date | null;
  customDateTo?: Date | null;
  cadence: string;
  delivery: string;
  email?: string | null;
  createdAt: Date;
}
