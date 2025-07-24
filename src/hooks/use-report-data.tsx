import { useState } from 'react';

type FormValues = {
  platform: "meta" | "tiktok";
  metrics: string[];
  level: string;
  dateRange: "last7" | "last14" | "last30";
  cadence: "manual" | "hourly" | "every12h" | "daily";
  delivery: "email" | "link";
  email?: string;
};

type ApiPayload = {
  metrics: string[];
  dimensions?: string[];
  level: string;
  dateRangeEnum: string;  
  reportType?: string;
  breakdowns?: string[];  // Meta-specific
  timeIncrement?: string; // Meta-specific
}

export const useReportData = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ data: unknown[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchReportData = async (formData: FormValues) => {
    setLoading(true);
    try {
      const payload: ApiPayload = {
        metrics: formData.metrics,
        level: formData.level,
        dateRangeEnum: formData.dateRange,
      };

      // Add platform-specific required fields
      if (formData.platform === 'tiktok') {
        payload.dimensions = ["stat_time_day"]; // Default dimension
        payload.reportType = 'BASIC'; // Default report type
      } else if (formData.platform === 'meta') {
        payload.breakdowns = ["age"]; // Default dimension
        payload.timeIncrement = '7'; // Default report type
      }

      const response = await fetch(`https://bizdev.newform.ai/sample-data/${formData.platform}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'NEWFORMCODINGCHALLENGE'
        },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return { fetchReportData, loading, data, error };
};
