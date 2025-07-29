import { notFound } from 'next/navigation';
import { formatCadence } from '@/lib/utils';
import { DbGeneratedReport } from '@/types/report';
import { analyzeData, createSVGChart, createInsightsHTML } from '@/lib/svg-chart';
import { getReport } from '@/lib/generated-report';
import { parseSignedUrlParams } from '@/lib/signed-urls';

export default async function ViewReport({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>; 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const searchParamsResolved = await searchParams;
  
  // Check if this is a signed URL and validate it
  const urlParams = new URLSearchParams();
  Object.entries(searchParamsResolved).forEach(([key, value]) => {
    if (typeof value === 'string') {
      urlParams.set(key, value);
    }
  });
  
  const signedUrlResult = parseSignedUrlParams(id, urlParams);
  
  // If it's a signed URL, validate it
  if (signedUrlResult) {
    if (signedUrlResult.isExpired) {
      return (
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-6xl mb-4">⏰</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Link Expired</h1>
              <p className="text-gray-600 mb-4">
                This report link has expired and is no longer accessible.
              </p>
              <p className="text-sm text-gray-500">
                Please request a new report link from the dashboard.
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    if (!signedUrlResult.isValid) {
      return (
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-6xl mb-4">❌</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h1>
              <p className="text-gray-600 mb-4">
                This report link is invalid or has been tampered with.
              </p>
              <p className="text-sm text-gray-500">
                Please request a new report link from the dashboard.
              </p>
            </div>
          </div>
        </div>
      );
    }
  }
  
  let report: DbGeneratedReport;
  try {
    report = await getReport(id);
  } catch (error) {
    notFound();
  }

  // Analyze data and generate insights
  console.log('Report data:', report.data);
  console.log('Report data type:', typeof report.data);
  console.log('Report data is array:', Array.isArray(report.data));
  
  const { insights, chartData } = analyzeData(report.data);
  const chartSVG = createSVGChart(chartData);
  
  console.log('Chart data:', chartData);
  console.log('Generated SVG length:', chartSVG.length);
  console.log('Generated SVG preview:', chartSVG.substring(0, 200) + '...');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Header */}
          <div className="border-b pb-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              📊 {report.reportConfig.platform.charAt(0).toUpperCase() + report.reportConfig.platform.slice(1)} Report
            </h1>
            <p className="text-gray-600 mt-2">
              Generated on {new Date(report.createdAt).toLocaleString()}
            </p>
          </div>

          {/* Report Summary */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">🤖 AI Summary</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-gray-800 leading-relaxed">{report.summary}</p>
            </div>
          </div>

          {/* Performance Analysis with Chart */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">📈 Performance Analysis</h2>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              {chartData.labels.length > 0 ? (
                <div 
                  className="flex justify-center"
                  dangerouslySetInnerHTML={{ __html: chartSVG }}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-2">No data available for visualization</p>
                  <p className="text-sm text-gray-400">Chart data: {JSON.stringify(chartData)}</p>
                </div>
              )}
            </div>
            
            {/* Insights */}
            {insights.length > 0 && insights[0] !== 'No data available for visualization' ? (
              <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Key Insights</h3>
                <ul className="space-y-2 text-blue-800">
                  {insights.map((insight, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span dangerouslySetInnerHTML={{ __html: insight }} />
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
                <p className="text-gray-500 text-center">No insights available</p>
              </div>
            )}
          </div>

          {/* Report Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">📋 Report Configuration</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Platform:</span> {report.reportConfig.platform}</p>
                <p><span className="font-medium">Metrics:</span> {report.reportConfig.metrics.split(',').join(', ')}</p>
                <p><span className="font-medium">Level:</span> {report.reportConfig.level}</p>
                <p><span className="font-medium">Date Range:</span> {report.reportConfig.dateRangeEnum}</p>
                <p><span className="font-medium">Cadence:</span> {formatCadence(report.reportConfig.cadence)}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">📊 Data Overview</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Data Points:</span> {Array.isArray(report.data) ? report.data.length : 'N/A'}</p>
                <p><span className="font-medium">Report Type:</span> Public Link</p>
                <p><span className="font-medium">Generated:</span> {new Date(report.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Raw Data (for development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">🔧 Raw Data (Development)</h2>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96">
                <pre className="text-xs">{JSON.stringify(report.data, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t pt-6 mt-8 text-center text-gray-500 text-sm">
            <p>Generated by NewForm Scheduled Reports</p>
            <p className="mt-1">Report ID: {report.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 