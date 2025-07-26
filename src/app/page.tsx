"use client";

import { ReportConfigForm } from "@/components/ReportConfigForm";
import { Button } from "@/components/ui/button";
import { useReports } from "@/hooks/use-reports";
import { formatCadence } from "@/lib/utils";

export default function Home() {
  const {
    reportConfigs,
    loading,
    error,
    success,
    onSubmit,
    runReportNow,
    clearMessages
  } = useReports();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div>
            <ReportConfigForm onSubmit={onSubmit} />
            
            {/* Status Messages */}
            {loading && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-blue-800">Saving configuration...</div>
              </div>
            )}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-red-800">Error: {error}</div>
                <button 
                  onClick={clearMessages}
                  className="text-red-600 underline text-sm mt-1"
                >
                  Dismiss
                </button>
              </div>
            )}
            {success && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-green-800">{success}</div>
                <button 
                  onClick={clearMessages}
                  className="text-green-600 underline text-sm mt-1"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>

          {/* Dashboard Section */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-6">📊 Report Dashboard</h2>
              
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
                        <Button
                          onClick={() => runReportNow(config.id)}
                          variant="outline"
                          size="sm"
                          className="bg-blue-50 hover:bg-blue-100"
                        >
                          ▶️ Run Now
                        </Button>
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
            
            {/* Instructions */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">📧 Email Setup</h3>
              <p className="text-blue-700 text-sm">
                To receive emails, set up your SMTP credentials in the environment variables:
                <code className="block mt-2 p-2 bg-white rounded text-xs">
                  EMAIL_USER=your-email@gmail.com<br/>
                  EMAIL_PASS=your-app-password<br/>
                  EMAIL_FROM=reports@yourcompany.com
                </code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
