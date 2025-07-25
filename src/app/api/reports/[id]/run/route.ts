import { NextRequest, NextResponse } from 'next/server';
import { runReportNow } from '@/lib/cron-service';

// Run a report now
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const configId = parseInt(id);
    
    if (isNaN(configId)) {
      return NextResponse.json(
        { error: 'Invalid report config ID' },
        { status: 400 }
      );
    }
    
    const result = await runReportNow(configId);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Report generated and sent successfully'
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to generate report' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error running report:', error);
    return NextResponse.json(
      { error: 'Failed to run report' },
      { status: 500 }
    );
  }
}