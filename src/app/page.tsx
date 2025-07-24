"use client";

import { ReportConfigForm, type FormValues } from "@/components/ReportConfigForm";
import { useReportData } from "@/hooks/use-report-data";

export default function Home() {
  const { fetchReportData, loading, data, error } = useReportData();

  const handleSubmit = async (formData: FormValues) => {
    console.log('Form data:', formData);
    await fetchReportData(formData);
    console.log('Response data:', data);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full p-0 mx-auto">
      <ReportConfigForm onSubmit={handleSubmit} />
      
      {loading && <div className="mt-4">Loading...</div>}
      {error && <div className="mt-4 text-red-500">Error: {error}</div>}
    </div>
  );
}
