import 'dotenv/config';
import { generateReportSummary } from '../src/lib/openai';

async function testGenerateSummary() {
  console.log('Testing OpenAI summary generation...');

  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not set in the environment variables.');
    process.exit(1);
  }

  const mockReportData = [
    {
      spend: 1200.5,
      impressions: 50000,
      clicks: 1500,
      ctr: 0.03,
      conversions: 50,
      cost_per_conversion: 24.01,
      campaign_name: 'Summer Sale Campaign',
    },
    {
      spend: 800.75,
      impressions: 35000,
      clicks: 950,
      ctr: 0.027,
      conversions: 25,
      cost_per_conversion: 32.03,
      campaign_name: 'New Product Launch',
    },
  ];

  try {
    const summary = await generateReportSummary(mockReportData);
    console.log('Successfully generated summary:');
    console.log(summary);
  } catch (error) {
    console.error('Failed to generate summary:', error);
  }
}

testGenerateSummary(); 