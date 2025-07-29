import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { stopCronJob } from '@/lib/cron-service';
import { Prisma } from '@prisma/client';
import { DbGeneratedReport, DbReportConfig } from '@/types/report';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idNumber = parseInt(id, 10);
    if (isNaN(idNumber)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    // Stop the cron job if it exists
    stopCronJob(idNumber);

    // Delete the report config from the database
    await prisma.reportConfig.delete({
      where: { id: idNumber },
    });

    return NextResponse.json({ success: true, message: 'Report configuration deleted' });
  } catch (error) {
    console.error('Error deleting report config:', error);
    // Handle case where the record to delete doesn't exist (Prisma error code)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
       return NextResponse.json({ error: 'Report configuration not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Failed to delete report configuration' },
      { status: 500 }
    );
  }
}

// Get a GeneratedReport by id
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    const report: DbGeneratedReport | null = await prisma.generatedReport.findUnique({
      where: { id },
      include: {
        reportConfig: true,
      },
    });
    
    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    );
  }
} 