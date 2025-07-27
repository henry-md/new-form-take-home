import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { stopCronJob } from '@/lib/cron-service';
import { Prisma } from '@prisma/client';

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