import dotenv from 'dotenv';
dotenv.config();
import { Resend } from 'resend';

console.log('\n=== Testing Resend Email Service ===\n');

async function testResendService() {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY not found in .env file');
      return false;
    }

    console.log('1. Initializing Resend client...');
    const resend = new Resend(process.env.RESEND_API_KEY);

    console.log('2. Sending test email via Resend...');
    const { data, error } = await resend.emails.send({
      from: 'Resumind AI <onboarding@resend.dev>',
      to: ['kapildahiya308@gmail.com'], // Change to your email
      subject: 'Test Email from Resumind AI - Resend',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>✅ Resend Email Service Test</h2>
          <p>This is a test email from Resumind AI using Resend API.</p>
          <p>If you received this, your Resend integration is working correctly!</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        </div>
      `,
    });

    if (error) {
      console.error('❌ Resend API error:', error);
      return false;
    }

    console.log('✅ Test email sent successfully!');
    console.log(`Email ID: ${data.id}`);
    console.log(`\n✅ Resend email service is working correctly!\n`);
    return true;

  } catch (error) {
    console.error('❌ Resend service test failed:\n');
    console.error('Error:', error.message);
    console.error('\nPossible solutions:');
    console.error('1. Check if RESEND_API_KEY is correct in .env');
    console.error('2. Verify your Resend account is active');
    console.error('3. Check your internet connection\n');
    return false;
  }
}

testResendService();
