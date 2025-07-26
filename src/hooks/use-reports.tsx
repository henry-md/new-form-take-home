import { useState, useEffect } from 'react';
import type { FormValues } from '@/components/ReportConfigForm';
import type { DbReportConfig } from '@/types/report';


export function useReports() {
  const [reportConfigs, setReportConfigs] = useState<DbReportConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch all report configurations from database
  const fetchReportConfigs = async () => {
    try {
      const response = await fetch('/api/reports');
      const data: DbReportConfig[] = await response.json();
      if (response.ok) {
        const configsWithDates = data.map(config => ({
          ...config,
          createdAt: new Date(config.createdAt),
          customDateFrom: config.customDateFrom ? new Date(config.customDateFrom) : undefined,
          customDateTo: config.customDateTo ? new Date(config.customDateTo) : undefined,
        }));
        setReportConfigs(configsWithDates || []);
      }
    } catch (error) {
      console.error('Error fetching report configs:', error);
    }
  };

  // Create a new report configuration. Passed into onSubmit of form.
  const onSubmit = async (formData: FormValues) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setSuccess('Report configuration saved and scheduled successfully!');
        await fetchReportConfigs(); // Refresh the list
        return { success: true };
      } else {
        setError(result.error || 'Failed to save configuration');
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Run a report immediately
  const runReportNow = async (configId: number) => {
    try {
      const response = await fetch(`/api/reports/${configId}/run`, {
        method: 'POST',
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setSuccess('Report generated and sent successfully!');
        return { success: true };
      } else {
        setError(result.error || 'Failed to run report');
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Clear messages
  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  // Load reports on mount
  useEffect(() => {
    fetchReportConfigs();
  }, []);

  return {
    reportConfigs,
    loading,
    error,
    success,
    onSubmit,
    runReportNow,
    refreshReports: fetchReportConfigs,
    clearMessages
  };
}; 