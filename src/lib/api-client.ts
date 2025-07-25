import type { ApiPayload, TikTokApi, MetaApi } from '@/types/api';
import type { ReportParams } from '@/types/report';

export const fetchReportData = async (report: ReportParams) => {
  let payload: ApiPayload;

  if (report.platform === 'tiktok') {
    payload = {
      platform: "tiktok",
      metrics: report.metrics as TikTokApi['metrics'],
      dimensions: ["stat_time_day"],
      level: report.level as TikTokApi['level'],
      reportType: "BASIC",
      cadence: report.cadence || "manual",
      delivery: report.delivery || "email",
      email: report.email,
      // Conditionally add either dateRangeEnum OR customDateRange
      ...(report.customDateRange 
        ? { customDateRange: report.customDateRange }
        : { dateRangeEnum: report.dateRangeEnum || "last7" }
      )
    };
  } else {
    payload = {
      platform: "meta",
      metrics: report.metrics as MetaApi['metrics'],
      level: report.level as MetaApi['level'],
      breakdowns: ["age"],
      timeIncrement: ["7"] as MetaApi['timeIncrement'],
      cadence: report.cadence || "manual",
      delivery: report.delivery || "email", 
      email: report.email,
      // Conditionally add either dateRangeEnum OR customDateRange
      ...(report.customDateRange
        ? { customDateRange: report.customDateRange }
        : { dateRangeEnum: report.dateRangeEnum || "last7" }
      )
    };
  }

  const response = await fetch(`https://bizdev.newform.ai/sample-data/${report.platform}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'NEWFORMCODINGCHALLENGE'
    },
    body: JSON.stringify(payload)
  });
  
  return await response.json();
}; 