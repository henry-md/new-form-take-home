import { NextResponse } from 'next/server';
import { getCronJobsStatus } from '@/lib/cron-service';

// Get the status of the cron jobs
export async function GET() {
  try {
    const status = getCronJobsStatus();
    return NextResponse.json({ status });
  } catch (error) {
    console.error('Error getting cron jobs status:', error);
    return NextResponse.json(
      { error: 'Failed to get cron jobs status' },
      { status: 500 }
    );
  }
}
