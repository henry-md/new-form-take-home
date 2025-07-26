import 'dotenv/config';
import { sendEmail, createReportEmail } from '@/lib/email';

const TEST_EMAIL = "henrymdeutsch@gmail.com";

const testEmailSending = async () => {
  console.log(`📧 Sending test email to: ${TEST_EMAIL}`);
  
  try {
    // Create test report data
    const testReportData = {
      platform: 'meta',
      dateRangeEnum: 'last7',
      data: {
        metrics: ['spend', 'impressions', 'clicks'],
        results: [
          { spend: 150.25, impressions: 12500, clicks: 342 },
          { spend: 200.75, impressions: 15200, clicks: 421 }
        ]
      }
    };

    // Generate the HTML email content
    const emailHtml = createReportEmail(testReportData);
    
    console.log('📝 Generated email HTML content');
    
    // Send the test email
    const result = await sendEmail({
      to: TEST_EMAIL,
      subject: '🧪 Test Email - NewForm Report System',
      html: emailHtml
    });
    
    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log(`📬 Message ID: ${result.messageId}`);
      console.log(`\n🎉 Check ${TEST_EMAIL} for the test email!`);
    } else {
      console.error('❌ Email failed to send:');
      console.error(result.error);
    }
    
  } catch (error) {
    console.error('💥 Test failed with error:');
    console.error(error);
  }
};

// Run the test
console.log('🚀 Starting Email Test...\n');
testEmailSending().then(() => {
  console.log('\n🏁 Email test completed');
}).catch((error) => {
  console.error('\n💥 Email test crashed:');
  console.error(error);
}); 
