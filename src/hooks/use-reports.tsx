import { useState, useEffect } from 'react';
import { DbReportConfigWithLatest } from '@/types/report';
import type { FormValues } from '@/components/ReportConfigForm';
import { toast } from 'sonner';

type ConfirmationState = {
  isOpen: boolean;
  action: 'delete' | 'deleteAll' | null;
  configId?: number;
};


export function useReports() {
  const [reportConfigs, setReportConfigs] = useState<DbReportConfigWithLatest[]>([]);
  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    isOpen: false,
    action: null,
  });

  // Fetch all report configurations from database
  const fetchReportConfigs = async () => {
    try {
      const response = await fetch('/api/reports');
      const data: DbReportConfigWithLatest[] = await response.json();
      if (response.ok) {
        const configsWithDates = data.map(config => ({
          ...config,
          createdAt: new Date(config.createdAt),
          customDateFrom: config.customDateFrom ? new Date(config.customDateFrom) : null,
          customDateTo: config.customDateTo ? new Date(config.customDateTo) : null,
        }));
        setReportConfigs(configsWithDates || []);
      }
    } catch (error) {
      console.error('Error fetching report configs:', error);
    }
  };

  // Create a new report configuration. Passed into onSubmit of form.
  const onSubmit = async (formData: FormValues) => {
    return toast.promise(
      (async () => {
        const response = await fetch('/api/reports', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to save configuration');
        }
        
        await fetchReportConfigs(); // Refresh the list
        return result;
      })(),
      {
        loading: 'Saving report configuration...',
        success: 'Report configuration saved successfully!',
        error: 'Failed to save configuration',
      }
    );
  };

  // Run a report immediately
  const runReportNow = async (configId: number) => {
    toast.promise(
      (async () => {
        const response = await fetch(`/api/reports/${configId}/run`, {
          method: 'POST',
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to run report');
        }
        
        // Refresh the report configs to show the updated latest report
        await fetchReportConfigs();
        
        return result;
      })(),
      {
        loading: 'Running report...',
        success: 'Report generated and sent successfully!',
        error: 'Failed to run report',
      }
    );
  };

  const deleteReport = async (id: number) => {
    setConfirmation({
      isOpen: true,
      action: 'delete',
      configId: id,
    });
  };

  const deleteAllReports = async () => {
    setConfirmation({
      isOpen: true,
      action: 'deleteAll',
    });
  };

  const confirmDelete = async () => {
    if (!confirmation.action) return;

    try {
      if (confirmation.action === 'delete' && confirmation.configId) {
        toast.promise(
          (async () => {
            setReportConfigs(prev => prev.filter(c => c.id !== confirmation.configId)); // Optimistic update
            const response = await fetch(`/api/reports/${confirmation.configId}`, { method: 'DELETE' });
            if (!response.ok) {
              // Revert on failure
              fetchReportConfigs();
              throw new Error('Failed to delete report');
            }
          })(),
          {
            loading: 'Deleting report...',
            success: 'Report deleted successfully',
            error: 'Failed to delete report',
          }
        );
      } else if (confirmation.action === 'deleteAll') {
        toast.promise(
          (async () => {
            setReportConfigs([]); // Optimistic update
            const response = await fetch('/api/reports', { method: 'DELETE' });
            if (!response.ok) {
              // Revert on failure
              fetchReportConfigs();
              throw new Error('Failed to delete all reports');
            }
          })(),
          {
            loading: 'Deleting all reports...',
            success: 'All reports deleted successfully',
            error: 'Failed to delete all reports',
          }
        );
      }
    } catch (error) {
      console.error("Failed to delete report(s)", error);
      fetchReportConfigs();
    } finally {
      setConfirmation({ isOpen: false, action: null });
    }
  };

  const cancelDelete = () => {
    setConfirmation({ isOpen: false, action: null });
  };

  // Load reports on mount
  useEffect(() => {
    fetchReportConfigs();
  }, []);

  return {
    reportConfigs,
    onSubmit,
    runReportNow,
    deleteReport,
    deleteAllReports,
    refreshReports: fetchReportConfigs,
    confirmation,
    confirmDelete,
    cancelDelete,
  };
}; 