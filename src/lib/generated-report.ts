import { DbGeneratedReport } from "@/types/report";

export async function getReport(id: string): Promise<DbGeneratedReport> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/reports/${id}`, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error('Report not found');
  }
  
  return response.json();
}