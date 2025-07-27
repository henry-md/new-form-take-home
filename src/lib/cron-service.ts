import * as cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { sendEmail, createReportEmail } from './email';
import { fetchReportData } from './api-client';
import { ReportParams } from '@/types/report';
import { DbReportConfig } from '@/types/report';
import prisma from '@/lib/db';

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

// Turn DB type into reportParams type to feed to api
// Use the info returned by the api to send email or generate link
const generateAndSendReport = async (config: DbReportConfig) => {
  try {
    console.log(`Generating report for config ID: ${config.id}`);
    
    // Convert DB config to API params and fetch data
    const reportParams: ReportParams = {
      platform: config.platform as ReportParams['platform'],
      metrics: config.metrics.split(',') as ReportParams['metrics'],
      level: config.level as ReportParams['level'],
      dateRangeEnum: config.dateRangeEnum as ReportParams['dateRangeEnum'],
      cadence: config.cadence as ReportParams['cadence'],
      delivery: config.delivery as ReportParams['delivery'],
      email: config.email || undefined
    };
    const reportData = await fetchReportData(reportParams);

    console.log(`Report data fetched for config ${config.id}:`, reportData);
    
    if (config.delivery === 'email' && config.email) {
      // Send email
      const emailHtml = createReportEmail({
        platform: config.platform,
        dateRangeEnum: config.dateRangeEnum,
        data: reportData
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
      await prisma.generatedReport.create({
        data: reportData,
      });
      console.log(`Report generated and saved for public link access (config ID: ${config.id})`);
    }
    
    return { success: true };
  } catch (error) {
    console.error(`Error generating report for config ${config.id}:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
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
  try {
    await initializeCronJobs();
    console.log('Cron jobs initialized');
  } catch (error) {
    console.error('Error initializing cron jobs:', error);
  }
}