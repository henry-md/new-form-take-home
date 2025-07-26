import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import { DbGeneratedReport } from '@/types/report';

const prisma = new PrismaClient();

async function getReport(id: string) {
  const report: DbGeneratedReport | null = await prisma.generatedReport.findUnique({
    where: { id },
    include: {
      reportConfig: true,
    },
  });

  if (!report) {
    notFound();
  }

  return report;
}

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await getReport(id);
  const dataArr = JSON.parse(report.data as string);

  // Assuming report.data is an array of objects
  const reportData = Array.isArray(dataArr) ? dataArr : [];

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">
        {report.platform.charAt(0).toUpperCase() + report.platform.slice(1)} Report
      </h1>
      <p className="text-gray-600 mb-6">
        Date Range: {report.dateRangeEnum} | Generated on: {new Date(report.createdAt).toLocaleString()}
      </p>

      {reportData.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead className="bg-gray-200">
              <tr>
                {Object.keys(reportData[0]).map(key => (
                  <th key={key} className="py-2 px-4 border-b text-left">{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reportData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-100">
                  {Object.values(row).map((value, i) => (
                    <td key={i} className="py-2 px-4 border-b">{String(value)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No data available for this report.</p>
      )}
    </div>
  );
} 