import { NextResponse } from 'next/server';
import { scheduleCronJob, stopCronJob } from '@/lib/cron-service';
import { DbReportConfig, DbReportConfigInput } from '@/types/report';
import { NextRequest } from 'next/server';
import { ReportParams } from '@/types/report';
import prisma from '@/lib/db';

// const prisma = new PrismaClient();

// Get all report configurations
export async function GET() {
  try {
    const configs = await prisma.reportConfig.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        generatedReports: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { id: true },
        },
      },
    });

    const configsWithLatestReport = configs.map(config => ({
      ...config,
      latestReportId: config.generatedReports.length > 0 ? config.generatedReports[0].id : null,
    }));

    return NextResponse.json(configsWithLatestReport);
  } catch (error) {
    console.error('Failed to fetch report configs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report configurations' },
      { status: 500 }
    );
  }
}

// Create a new report configuration
export async function POST(request: NextRequest) {
  try {
    const body: ReportParams = await request.json();
    console.log('Creating a new report with form values:', body);
    const { platform, metrics, level, dateRangeEnum, dateRange, cadence, delivery, email } = body;
    
    // Validate required fields
    if (!platform || !metrics || !level || !dateRangeEnum || !cadence || !delivery) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    if (dateRangeEnum === 'custom' && (!dateRange || !dateRange.from || !dateRange.to)) {
      return NextResponse.json(
        { error: 'Custom date range requires from and to dates' },
        { status: 400 }
      );
    }
    
    if (delivery === 'email' && !email) {
      return NextResponse.json(
        { error: 'Email is required when delivery method is email' },
        { status: 400 }
      );
    }
    
    // Create the report config
    const reportConfigInput: DbReportConfigInput = {
      platform,
      metrics: Array.isArray(metrics) ? metrics.join(',') : metrics,
      level,
      dateRangeEnum,
      cadence,
      delivery,
      email: delivery === 'email' ? email : null,
      ...(dateRangeEnum === 'custom' && dateRange && dateRange.from && dateRange.to && {
        customDateFrom: new Date(dateRange.from),
        customDateTo: new Date(dateRange.to)
      }),
      metadata: {}
    };

    const reportConfig: DbReportConfig = await prisma.reportConfig.create({
      data: reportConfigInput,
      include: {
        generatedReports: true,
      },
    });

    console.log('Created report config in database [type DbReportConfig]:', reportConfig);
    
    // Schedule the cron job if not manual
    if (cadence !== 'manual') {
      await scheduleCronJob(reportConfig.id);
    }
    
    return NextResponse.json({
      success: true,
      reportConfig,
      message: 'Report configuration created and scheduled successfully'
    });
    
  } catch (error) {
    console.error('Error creating report config:', error);
    return NextResponse.json(
      { error: 'Failed to create report configuration' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const configs = await prisma.reportConfig.findMany({
      select: { id: true }
    });

    for (const config of configs) {
      stopCronJob(config.id);
    }

    await prisma.reportConfig.deleteMany({});

    return NextResponse.json({ success: true, message: 'All report configurations deleted' });
  } catch (error) {
    console.error('Error deleting all report configurations:', error);
    return NextResponse.json(
      { error: 'Failed to delete all report configurations' },
      { status: 500 }
    );
  }
}
