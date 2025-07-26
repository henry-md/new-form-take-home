import type { ApiPayload, TikTokApi, MetaApi } from '@/types/api';
import type { ReportParams } from '@/types/report';

export const fetchReportData = async (report: ReportParams) => {
  // let apiPayload: { [key: string]: any };
  let apiPayload: ApiPayload;

  if (report.platform === 'tiktok') {
    apiPayload = {
      metrics: report.metrics,
      dimensions: ["stat_time_day"],
      level: report.level as TikTokApi["level"],
      reportType: "BASIC",
      ...(report.dateRangeEnum === "custom"
        ? { dateRange: report.dateRange }
        : { dateRangeEnum: report.dateRangeEnum }
      )
    };
  } else { 
    // Meta
    apiPayload = {
      metrics: report.metrics,
      level: report.level as MetaApi["level"],
      breakdowns: ["age"],
      timeIncrement: "7",
      ...(report.dateRangeEnum === "custom"
        ? { dateRange: report.dateRange }
        : { dateRangeEnum: report.dateRangeEnum }
      )
    };
  }

  const response = await fetch(`https://bizdev.newform.ai/sample-data/${report.platform}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'NEWFORMCODINGCHALLENGE'
    },
    body: JSON.stringify(apiPayload)
  });
  
  return await response.json();
}; 