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
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-3 sm:px-4">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Column: Form */}
          <div className="order-2 xl:order-1">
            <ReportConfigForm onSubmit={onSubmit} />
          </div>

          {/* Right Column: Dashboard */}
          <div className="order-1 xl:order-2">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                <h2 className="text-xl sm:text-2xl font-semibold">📊 Report Dashboard</h2>
                {reportConfigs.length > 0 && (
                  <Button
                    onClick={deleteAllReports}
                    variant="destructive"
                    size="sm"
                    className="self-start sm:self-auto"
                  >
                    Clear All
                  </Button>
                )}
              </div>
              
              {reportConfigs.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  <div className="text-4xl mb-4">📊</div>
                  <p className="text-base sm:text-lg mb-2">No reports yet</p>
                  <p className="text-sm">Create your first report using the form below</p>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {reportConfigs.map((config) => (
                    <div key={config.id} className="border rounded-lg p-4 sm:p-5 hover:bg-gray-50 transition-colors">
                      {/* Header with Title and Actions */}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-3 sm:space-y-0">
                        <div className="flex-1">
                          <div className="font-semibold text-base sm:text-lg">
                            {config.platform.charAt(0).toUpperCase() + config.platform.slice(1)} Report
                          </div>
                          <div className="text-sm text-gray-600">
                            Created: {config.createdAt.toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-3 self-start">
                          <Button
                            onClick={() => runReportNow(config.id)}
                            variant="outline"
                            size="sm"
                            className="bg-blue-50 hover:bg-blue-100 text-xs sm:text-sm px-3 sm:px-4"
                          >
                            ▶️ Run Now
                          </Button>
                          <Button
                            onClick={() => deleteReport(config.id)}
                            variant="destructive"
                            size="sm"
                            className="text-xs sm:text-sm px-3 sm:px-4"
                          >
                            🗑️ Delete
                          </Button>
                        </div>
                      </div>
                      
                      {/* Report Details - Mobile Friendly */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm mb-4">
                        <div className="break-words">
                          <span className="font-medium text-gray-700">Metrics:</span> 
                          <span className="ml-1">{config.metrics.split(',').join(', ')}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Level:</span> 
                          <span className="ml-1">{config.level}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Date Range:</span> 
                          <span className="ml-1">{config.dateRangeEnum}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Cadence:</span> 
                          <span className="ml-1">{formatCadence(config.cadence)}</span>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="font-medium text-gray-700">Delivery:</span> 
                          <span className="ml-1">{config.delivery}</span>
                        </div>
                        {config.email && (
                          <div className="sm:col-span-2 break-all">
                            <span className="font-medium text-gray-700">Email:</span> 
                            <span className="ml-1 text-blue-600">{config.email}</span>
                          </div>
                        )}
                      </div>

                      {/* Last Report Section - Mobile Optimized */}
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 space-y-1 sm:space-y-0">
                          <h4 className="font-semibold text-sm sm:text-base text-gray-900">📄 Last Report</h4>
                          {config.latestReportId && (
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full self-start sm:self-auto">
                              Available
                            </span>
                          )}
                        </div>
                        {config.delivery === 'link' ? (
                          config.latestReportId ? (
                            <div className="space-y-3">
                              <div className="text-xs sm:text-sm text-gray-600">Public URL:</div>
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                                <code className="text-xs bg-gray-100 px-2 py-1 rounded text-blue-600 break-all flex-1 sm:mr-2 font-mono">
                                  {config.signedUrl || `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/view-report/${config.latestReportId}`}
                                </code>
                                <a 
                                  href={config.signedUrl || `/view-report/${config.latestReportId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center px-3 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors whitespace-nowrap"
                                >
                                  🔗 Open Report
                                </a>
                              </div>
                              {config.signedUrl && (
                                <div className="text-xs text-amber-600 flex items-center">
                                  <span className="mr-1">🔒</span>
                                  <span>Secured link expires in 24 hours</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-gray-500 italic text-sm">
                              Click &quot;Run Now&quot; to generate your first report
                            </div>
                          )
                        ) : (
                          <div className="text-gray-600 text-sm">
                            <span className="flex items-center flex-wrap">
                              <span className="mr-1">📧</span>
                              <span>Reports delivered via email to:</span>
                              <span className="font-mono text-blue-600 ml-1 break-all">{config.email}</span>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Next Run Info */}
                      <div className="text-xs text-gray-500 mt-3 flex items-center">
                        <span className="mr-1">⏰</span>
                        <span>Next Run: {formatCadence(config.cadence)}</span>
                      </div>
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
