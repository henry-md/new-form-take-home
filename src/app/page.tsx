"use client";

import { ReportConfigForm } from "@/components/ReportConfigForm";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { useReports } from "@/hooks/use-reports";
import { formatCadence } from "@/lib/utils";

export default function Home() {
  const {
    reportConfigs,
    onSubmit,
    runReportNow,
    deleteReport,
    deleteAllReports,
    confirmation,
    confirmDelete,
    cancelDelete,
  } = useReports();

  const getConfirmationProps = () => {
    if (confirmation.action === 'delete') {
      return {
        title: 'Delete Report Configuration',
        description: 'Are you sure you want to delete this report configuration? This action cannot be undone.',
        actionText: 'Delete',
      };
    } else if (confirmation.action === 'deleteAll') {
      return {
        title: 'Delete All Report Configurations',
        description: `Are you sure you want to delete all ${reportConfigs.length} report configurations? This action cannot be undone.`,
        actionText: 'Delete All',
      };
    }
    return {
      title: '',
      description: '',
      actionText: 'Confirm',
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Form */}
          <div>
            <ReportConfigForm onSubmit={onSubmit} />
          </div>

          {/* Right Column: Dashboard */}
          <div className="mt-8 lg:mt-0">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">📊 Report Dashboard</h2>
                {reportConfigs.length > 0 && (
                  <Button
                    onClick={deleteAllReports}
                    variant="destructive"
                    size="sm"
                  >
                    Clear All
                  </Button>
                )}
              </div>
              
              {reportConfigs.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  No report configurations yet. Create one using the form on the left.
                </div>
              ) : (
                <div className="space-y-4">
                  {reportConfigs.map((config) => (
                    <div key={config.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-semibold text-lg">
                            {config.platform.charAt(0).toUpperCase() + config.platform.slice(1)} Report
                          </div>
                          <div className="text-sm text-gray-600">
                            Created: {config.createdAt.toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => runReportNow(config.id)}
                            variant="outline"
                            size="sm"
                            className="bg-blue-50 hover:bg-blue-100"
                          >
                            Run Now
                          </Button>
                          <Button
                            onClick={() => deleteReport(config.id)}
                            variant="destructive"
                            size="sm"
                            
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Metrics:</span> {config.metrics.split(',').join(', ')}
                        </div>
                        <div>
                          <span className="font-medium">Level:</span> {config.level}
                        </div>
                        <div>
                          <span className="font-medium">Date Range:</span> {config.dateRangeEnum}
                        </div>
                        <div>
                          <span className="font-medium">Cadence:</span> {formatCadence(config.cadence)}
                        </div>
                        <div>
                          <span className="font-medium">Delivery:</span> {config.delivery}
                        </div>
                        {config.email && (
                          <div>
                            <span className="font-medium">Email:</span> {config.email}
                          </div>
                        )}
                      </div>
                      
                      {/* Last Report Section - Prominent */}
                      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-base text-gray-900">Last Report</h4>
                          {config.latestReportId && (
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                              Available
                            </span>
                          )}
                        </div>
                        
                        {config.delivery === 'link' ? (
                          config.latestReportId ? (
                            <div className="space-y-2">
                              <div className="text-sm text-gray-600 mb-1">Public URL:</div>
                              <div className="flex items-center justify-between">
                                <code className="text-sm bg-gray-100 px-2 py-1 rounded text-blue-600 break-all">
                                  {typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/view-report/{config.latestReportId}
                                </code>
                                <a 
                                  href={`/view-report/${config.latestReportId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-2 flex-shrink-0 inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                                >
                                  🔗 Open
                                </a>
                              </div>
                            </div>
                          ) : (
                            <div className="text-gray-500 italic">
                              [none] - Click &quot;Run Now&quot; to generate your first report
                            </div>
                          )
                        ) : (
                          <div className="text-gray-600">
                            Reports delivered via email to: <span className="font-mono">{config.email}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Show active reports */}
                      {config.cadence !== 'manual' && (
                        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                          🕒 Scheduled: {formatCadence(config.cadence)}
                        </div>
                      )}
                      
                      <p className="text-sm text-gray-500 mt-3">
                        Next Run: {config.cadence !== 'manual' ? 'Scheduled' : 'Manual'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmation.isOpen}
        title={getConfirmationProps().title}
        description={getConfirmationProps().description}
        actionText={getConfirmationProps().actionText}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}
