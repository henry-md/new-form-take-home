"use client";

import { ReportConfigForm } from "@/components/ReportConfigForm";
import { Button } from "@/components/ui/button";
import { useReports } from "@/hooks/use-reports";
import { formatCadence } from "@/lib/utils";

export default function Home() {
  const {
    reportConfigs,
    loading,              // Creating a Report Config
    error,
    success,
    notifications,        // Executing one/many report configs that already exist
    dismissNotification,
    onSubmit,
    runReportNow,
    deleteReport,
    deleteAllReports,
    clearMessages
  } = useReports();

  const getNotificationStyle = (type: 'loading' | 'success' | 'error') => {
    switch (type) {
      case 'loading':
        return 'bg-yellow-100 border-yellow-400 text-yellow-700';
      case 'success':
        return 'bg-green-100 border-green-400 text-green-700';
      case 'error':
        return 'bg-red-100 border-red-400 text-red-700';
    }
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
            <div className="space-y-2 mb-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border rounded relative ${getNotificationStyle(notification.type)}`}
                  role="alert"
                >
                  <span className="block sm:inline">{notification.message}</span>
                  {notification.type !== 'loading' && (
                    <button
                      onClick={() => dismissNotification(notification.id)}
                      className="absolute top-0 bottom-0 right-0 px-4 py-3"
                    >
                      <span className="text-2xl">×</span>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {loading && (
              <div
              className="mb-4 p-4 bg-yellow-100 border-yellow-400 text-yellow-700 rounded relative"
              role="alert"
              >
                <span className="block sm:inline">Loading configurations...</span>
              </div>
            )}

            {success && (
              <div
                className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded relative"
                role="alert"
              >
                <span className="block sm:inline">{success}</span>
                <button
                  onClick={clearMessages}
                  className="absolute top-0 bottom-0 right-0 px-4 py-3"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            )}
            
            {error && <p className="text-red-500">{error}</p>}

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
                            ▶️ Run Now
                          </Button>
                          <Button
                            onClick={() => deleteReport(config.id)}
                            variant="destructive"
                            size="sm"
                            
                          >
                            🗑️ Delete
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
                      
                      {/* Show active reports */}
                      {config.cadence !== 'manual' && (
                        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                          🕒 Scheduled: {formatCadence(config.cadence)}
                        </div>
                      )}
                      <p className="text-sm text-gray-500">
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
    </div>
  );
}
