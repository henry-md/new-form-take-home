export interface BaseApi {
  dateRangeEnum?: "last7" | "last14" | "last30" | "lifetime" | "custom";
  customDateRange?: {
    from: string;  // YYYY-MM-DD
    to: string;    // YYYY-MM-DD
  };
  cadence: "manual" | "every_minute" | "hourly" | "every12h" | "daily";
  delivery: "email" | "link";
  email?: string;
}

export interface TikTokApi extends BaseApi {
  platform: "tiktok";
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
    | "skan_app_install"
    | "skan_cost_per_app_install"
    | "skan_purchase"
    | "skan_cost_per_purchase"
  )[];
  dimensions?: (
    | "ad_id"
    | "campaign_id"
    | "adgroup_id"
    | "advertiser_id"
    | "stat_time_day"
    | "campaign_name"
    | "adgroup_name"
    | "ad_name"
    | "country_code"
    | "age"
    | "gender"
    | "province_id"
    | "dma_id"
  )[];
  level: (
    | "AUCTION_ADVERTISER"
    | "AUCTION_AD"
    | "AUCTION_CAMPAIGN"
  );
  reportType?: "BASIC" | "AUDIENCE";
}

export interface MetaApi extends BaseApi {
  platform: "meta";
  metrics: (
    | "spend"
    | "impressions"
    | "clicks"
    | "ctr"
    | "cpc"
    | "reach"
    | "frequency"
    | "conversions"
    | "cost_per_conversion"
    | "conversion_rate"
    | "actions"
    | "cost_per_action_type"
  )[];
  level: (
    | "account"
    | "campaign"
    | "adset"
    | "ad"
  );
  breakdowns: (
    | "age"
    | "gender"
    | "country"
    | "region"
    | "dma"
    | "impression_device"
    | "platform_position"
    | "publisher_platform"
  )[];
  timeIncrement?: (
    | "1"
    | "7"
    | "28"
    | "monthly"
    | "quarterly"
    | "yearly"
    | "all_days"
  )[];
}

export type ApiPayload = TikTokApi | MetaApi;