import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { scheduleCronJob, stopCronJob } from '@/lib/cron-service';
import { DbReportConfig } from '@/types/report';

const prisma = new PrismaClient();

// Create a new report configuration
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('reports/route.ts: body:', body);
    const { platform, metrics, level, dateRange, customDateRange, cadence, delivery, email } = body;
    
    // Validate required fields
    if (!platform || !metrics || !level || !dateRange || !cadence || !delivery) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    if (dateRange === 'custom' && (!customDateRange || !customDateRange.from || !customDateRange.to)) {
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
    const reportConfig = await prisma.reportConfig.create({
      data: {
        platform,
        metrics: Array.isArray(metrics) ? metrics.join(',') : metrics,
        level,
        dateRange,
        cadence,
        delivery,
        email: delivery === 'email' ? email : null,
        ...(dateRange === 'custom' && customDateRange && customDateRange.from && customDateRange.to && {
          customDateFrom: new Date(customDateRange.from),
          customDateTo: new Date(customDateRange.to)
        })
      }
    });
    
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

// Get all report configurations
export async function GET() {
  try {
    const reportConfigs: DbReportConfig[] = await prisma.reportConfig.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json({ reportConfigs });
  } catch (error) {
    console.error('Error fetching report configs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report configurations' },
      { status: 500 }
    );
  }
}

