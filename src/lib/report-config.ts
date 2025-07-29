import * as cron from 'node-cron';
import { Prisma } from '@prisma/client';
import { sendEmail, createReportEmail } from './email';
import { fetchReportData } from './api-client';
import { ReportParams } from '@/types/report';
import { DbReportConfig } from '@/types/report';
import prisma from '@/lib/db';
import { DbGeneratedReport } from '@/types/report';
import { generateReportSummary } from './openai';

export async function buildReportContent(config: DbReportConfig) {
  console.log(`Building report content for config ID: ${config.id}`);

  const reportParams: ReportParams = {
    platform: config.platform as ReportParams['platform'],
    metrics: config.metrics.split(',') as ReportParams['metrics'],
    level: config.level as ReportParams['level'],
    dateRangeEnum: config.dateRangeEnum as ReportParams['dateRangeEnum'],
    cadence: config.cadence as ReportParams['cadence'],
    delivery: config.delivery as ReportParams['delivery'],
    email: config.email || undefined,
  };

  const reportData = await fetchReportData(reportParams);
  console.log(`Report data fetched for config ${config.id}.`);

  const summary = await generateReportSummary(reportData);
  console.log(`Report summary generated for config ${config.id}.`);

  return { reportData, summary };
}

// Function to remove duplicate data objects based on age group and date ranges
export const removeDuplicateDataObjects = (data: unknown[]): unknown[] => {
  if (!Array.isArray(data) || data.length === 0) {
    return data;
  }

  const seen = new Map<string, boolean>();
  const cleanedData: unknown[] = [];

  for (const item of data) {
    if (typeof item !== 'object' || item === null) {
      cleanedData.push(item);
      continue;
    }
    
    // Create a unique key based on age group and date range
    const itemObj = item as Record<string, unknown>;
    const ageGroup = String(itemObj.age || 'Unknown');
    const startDate = String(itemObj.date_start || '');
    const endDate = String(itemObj.date_stop || '');
    
    const key = `${ageGroup}_${startDate}_${endDate}`;
    
    // Only add the first occurrence of each unique combination
    if (!seen.has(key)) {
      seen.set(key, true);
      cleanedData.push(item);
    }
  }

  console.log(`Cleaned data: removed ${data.length - cleanedData.length} duplicate entries`);
  return cleanedData;
};

// Turn DB type into reportParams type to feed to api
// Use the info returned by the api to send email or generate link
export const generateAndSendReport = async (config: DbReportConfig) => {
  try {
    console.log(`Generating report for config ID: ${config.id}`);
    
    const { reportData, summary } = await buildReportContent(config);
    
    // Clean duplicate data objects from the data array
    const dataArray = (reportData as { data?: unknown[] })?.data || [];
    const cleanedDataArray = removeDuplicateDataObjects(dataArray);
    const cleanedReportData = { ...reportData, data: cleanedDataArray };

    // Generate report and save to db
    const generatedReport: DbGeneratedReport = await prisma.generatedReport.create({
      data: {
        reportConfigId: config.id,
        data: cleanedReportData as Prisma.InputJsonValue,
        summary: summary,
        platform: config.platform,
        dateRangeEnum: config.dateRangeEnum,
      },
      include: {
        reportConfig: true,
      },
    });
    console.log(
      `Report generated and saved with ID: ${generatedReport.id} for public link access (config ID: ${config.id})`,
    );

    // Update report config metadata
    await prisma.reportConfig.update({
      where: { id: config.id },
      data: { metadata: { lastRun: new Date().toISOString(), lastError: null } },
    });

    if (config.delivery === 'email' && config.email) {
      // Send email
      const emailHtml = createReportEmail({
        platform: config.platform,
        dateRangeEnum: config.dateRangeEnum,
        data: cleanedDataArray,
        summary: summary,
        reportId: generatedReport.id.toString(),
      });
      
      const result = await sendEmail({
        to: config.email,
        subject: `📊 Your ${config.platform} Report - ${new Date().toLocaleDateString()}`,
        html: emailHtml
      });
      
      if (result.success) {
        console.log(`Report emailed successfully to ${config.email}`);
      } else {
        console.error(`Failed to send email to ${config.email}:`, result.error);
      }
    } else if (config.delivery === 'link') {
      // Public link is automatically available at /view-report/{generatedReport.id}
      console.log(`Report available at public link: /view-report/${generatedReport.id}`);
    }
    
    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error(
      `Error generating report for config ${config.id}:`,
      errorMessage,
    );
    await prisma.reportConfig.update({
      where: { id: config.id },
      data: { metadata: { lastError: errorMessage } },
    });
    return { success: false, error: errorMessage };
  }
};