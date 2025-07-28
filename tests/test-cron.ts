import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { scheduleCronJob, stopCronJob } from '../src/lib/cron-service';
import { DbReportConfigInput, DbReportConfig } from '@/types/report';
import { Prisma } from '@prisma/client';

const prisma = new PrismaClient();
const TEST_EMAIL = "henrymdeutsch@gmail.com";

const testCronJobScheduling = async () => {
  console.log('🧪 Starting cron job scheduling test...');

  let testConfig: DbReportConfig | undefined;

  try {
    // Create a temporary report config in the database
    console.log('📝 Creating temporary report config...');
    const data: DbReportConfigInput = {
      platform: 'meta',
      metrics: 'spend,impressions',
      level: 'campaign',
      dateRangeEnum: 'last7',
      cadence: 'every_minute', // For testing
      delivery: 'email',
      email: TEST_EMAIL,
      metadata: {
        lastRun: new Date().toISOString(),
        lastError: null,
      },
    }
    testConfig = await prisma.reportConfig.create({
      data,
      include: {
        generatedReports: true,
      },
    });
    console.log(`✅ Temporary config created with ID: ${testConfig.id}`);

    // Schedule the cron job
    console.log('⏰ Scheduling the cron job to run every minute...');
    await scheduleCronJob(testConfig.id);

    // Wait to see it run
    console.log('🕒 Waiting for 200 seconds to allow the job to fire at least once...');
    console.log('📬 Check your email at henrymdeutsch@gmail.com for the report.');
    
    await new Promise(resolve => setTimeout(resolve, 200000)); // Wait 200 seconds

    console.log('✅ Test complete. The cron job should have fired.');

  } catch (error) {
    console.error('💥 Test failed with an error:', error);
  } finally {
    // Clean up: stop the cron job and delete the test config
    if (testConfig) {
      console.log('🧹 Cleaning up...');
      stopCronJob(testConfig.id);
      
      await prisma.reportConfig.delete({
        where: { id: testConfig.id },
      });
      console.log(`✅ Temporary config ${testConfig.id} deleted.`);
    }
    await prisma.$disconnect();
    console.log('🏁 Test finished.');
  }
};

// Run the test
testCronJobScheduling(); 