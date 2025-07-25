"use client";

import { ReportConfigForm } from "@/components/ReportConfigForm";
// import { Button } from "@/components/ui/button";
import { useReports } from "@/hooks/use-reports";
// import { formatCadence } from "@/lib/utils";

export default function Home() {
  const {
    // reportConfigs,
    loading,
    error,
    // success,
    onSubmit,
    // runReportNow,
    // clearMessages
  } = useReports();

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full p-0 mx-auto">
      <ReportConfigForm onSubmit={onSubmit} />
      {loading && <div className="mt-4">Loading...</div>}
      {error && <div className="mt-4 text-red-500">Error: {error}</div>}
    </div>
  );
}
