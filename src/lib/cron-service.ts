import * as cron from 'node-cron';
import { PrismaClient, Prisma } from '@prisma/client';
import { sendEmail, createReportEmail } from './email';
import { fetchReportData } from './api-client';
import { ReportParams } from '@/types/report';
import { DbReportConfig } from '@/types/report';
import prisma from '@/lib/db';
import { generateReportSummary } from './openai';
import { DbGeneratedReport } from '@/types/report';

// Store active cron jobs in memory, mapping db id to cron.ScheduledTask object
const activeJobs = new Map<number, cron.ScheduledTask>();

// Convert cadence to cron expression
const getCronExpression = (cadence: string): string => {
  switch (cadence) {
    case 'every_minute':
    case 'test-minute':
      return '* * * * *'; // Every minute for testing
    case 'hourly':
      return '0 * * * *'; // Every hour
    case 'every12h':
      return '0 */12 * * *'; // Every 12 hours
    case 'daily':
      return '0 0 * * *'; // Daily at midnight
    case 'manual':
    default:
      return ''; // No automatic scheduling
  }
};

async function buildReportContent(config: DbReportConfig) {
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

// Turn DB type into reportParams type to feed to api
// Use the info returned by the api to send email or generate link
const generateAndSendReport = async (config: DbReportConfig) => {
  try {
    console.log(`Generating report for config ID: ${config.id}`);
    
    const { reportData, summary } = await buildReportContent(config);
    
    // Clean duplicate data objects based on age group and date ranges
    const cleanedData = removeDuplicateDataObjects(reportData);

    // Generate report and save to db
    const generatedReport: DbGeneratedReport = await prisma.generatedReport.create({
      data: {
        reportConfigId: config.id,
        data: cleanedData as Prisma.InputJsonValue,
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
        data: reportData,
        summary: summary,
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
      // TODO: Save report and generate public link
      
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

// Function to remove duplicate data objects based on age group and date ranges
const removeDuplicateDataObjects = (data: unknown[]): unknown[] => {
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
    const ageGroup = String(itemObj.age);
    const startDate = String(itemObj.date_start);
    const endDate = String(itemObj.date_end);
    
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

// Schedule or restart a cron job that exists in the database
export const scheduleCronJob = async (configId: number) => {
  try {
    // Get the config from database
    const config: DbReportConfig | null = await prisma.reportConfig.findUnique({
      where: { id: configId },
      include: {
        generatedReports: true,
      },
    });
    
    if (!config) {
      throw new Error(`Report config with ID ${configId} not found`);
    }
    
    // Delete cron job locally in activeJobs map
    stopCronJob(configId);
    
    if (config.cadence === 'manual') {
      console.log(`Config ${configId} is set to manual, no cron job scheduled`);
      return;
    }
    
    const cronExpression = getCronExpression(config.cadence);
    if (!cronExpression) {
      throw new Error(`Invalid cadence: ${config.cadence}`);
    }
    
    // Create and start the cron job
    const task = cron.schedule(cronExpression, async () => {
      await generateAndSendReport(config);
    }, {
      timezone: "UTC"
    });
    
    // Store the job reference
    activeJobs.set(configId, task);
    
    console.log(`Cron job scheduled for config ${configId} with cadence: ${config.cadence}`);
    
  } catch (error) {
    console.error(`Error scheduling cron job for config ${configId}:`, error);
    throw error;
  }
};

// Stop a cron job
export const stopCronJob = (configId: number) => {
  const existingJob = activeJobs.get(configId);
  if (existingJob) {
    existingJob.stop();
    activeJobs.delete(configId);
    console.log(`Cron job stopped for config ${configId}`);
  }
};

// Run a report immediately (manual trigger)
export const runReportNow = async (configId: number) => {
  try {
    const config: DbReportConfig | null = await prisma.reportConfig.findUnique({
      where: { id: configId },
      include: {
        generatedReports: true,
      },
    });
    
    if (!config) {
      throw new Error(`Report config with ID ${configId} not found`);
    }
    
    return await generateAndSendReport(config);
  } catch (error) {
    console.error(`Error running report now for config ${configId}:`, error);
    throw error;
  }
};

// Initialize all active cron jobs on server start
export const initializeCronJobs = async () => {
  try {
    const configs = await prisma.reportConfig.findMany({
      where: {
        cadence: {
          not: 'manual'
        }
      }
    });
    
    for (const config of configs) {
      await scheduleCronJob(config.id);
    }
    
    console.log(`Initialized ${configs.length} cron jobs`);
  } catch (error) {
    console.error('Error initializing cron jobs:', error);
  }
};

// Get status of all active jobs
export const getCronJobsStatus = () => {
  const status = Array.from(activeJobs.entries()).map(([configId, task]) => ({
    configId,
    isRunning: true  // If it's in the map, it's active
  }));
  
  return status;
};

// Auto-initialize in production or when explicitly requested
if (process.env.NODE_ENV === 'production' || process.env.INIT_CRON === 'true') {
  (async () => {
    try {
      await initializeCronJobs();
      console.log('Cron jobs initialized');
    } catch (error) {
      console.error('Error initializing cron jobs:', error);
    }
  })();
}