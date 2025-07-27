import { useState, useEffect } from 'react';
import type { FormValues } from '@/components/ReportConfigForm';
import type { DbReportConfig } from '@/types/report';

interface Notification {
  id: number;
  type: 'loading' | 'success' | 'error';
  message: string;
}

export function useReports() {
  const [reportConfigs, setReportConfigs] = useState<DbReportConfig[]>([]);
  const [loading, setLoading] = useState(false); // Loading Report Config
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]); // For "Run Now" actions

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
      setSuccess('Report configuration saved and scheduled successfully!');
      setLoading(false);
    }
  };

  // Run a report immediately
  const runReportNow = async (configId: number) => {
    const runId = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id: runId, type: 'loading', message: 'Running report...' }]);

    try {
      const response = await fetch(`/api/reports/${configId}/run`, {
        method: 'POST',
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === runId 
            ? { ...n, type: 'success', message: 'Report generated and sent successfully!' } 
            : n
          )
        );
      } else {
        setNotifications(prev => 
          prev.map(n => n.id === runId 
            ? { ...n, type: 'error', message: result.error || 'Failed to run report' } 
            : n
          )
        );
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setNotifications(prev => 
        prev.map(n => n.id === runId 
          ? { ...n, type: 'error', message: errorMessage } 
          : n
        )
      );
    }
  };

  const dismissNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const deleteReport = async (id: number) => {
    try {
      setReportConfigs(prev => prev.filter(c => c.id !== id)); // Optimistic update
      const response = await fetch(`/api/reports/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        // Revert on failure
        fetchReportConfigs();
      }
    } catch (error) {
      console.error("Failed to delete report", error);
      fetchReportConfigs();
    }
  };

  const deleteAllReports = async () => {
    try {
      setReportConfigs([]); // Optimistic update
      const response = await fetch('/api/reports', { method: 'DELETE' });
      if (!response.ok) {
        // Revert on failure
        fetchReportConfigs();
      }
    } catch (error) {
      console.error("Failed to delete all reports", error);
      fetchReportConfigs();
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
    notifications,
    dismissNotification,
    onSubmit,
    runReportNow,
    deleteReport,
    deleteAllReports,
    refreshReports: fetchReportConfigs,
    clearMessages
  };
}; 