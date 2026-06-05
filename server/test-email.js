import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';

console.log('\n=== Testing Email Service ===\n');

async function testEmailService() {
  try {
    console.log('1. Creating SMTP transporter...');
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 15000,
    });

    console.log('2. Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!\n');

    console.log('3. Sending test email...');
    const info = await transporter.sendMail({
      from: `"Resumind AI Test 👻" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to yourself for testing
      subject: "Test Email from Resumind AI",
      text: "This is a test email to verify the email service is working.",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>✅ Email Service Test</h2>
          <p>This is a test email from Resumind AI.</p>
          <p>If you received this, your email service is configured correctly!</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        </div>
      `,
    });

    console.log('✅ Test email sent successfully!');
    console.log(`Message ID: ${info.messageId}`);
    console.log(`\n✅ Email service is working correctly!\n`);
    return true;

  } catch (error) {
    console.error('❌ Email service test failed:\n');
    console.error('Error:', error.message);
    
    if (error.code) {
      console.error('Error Code:', error.code);
    }
    
    console.error('\nPossible solutions:');
    console.error('1. Check if EMAIL_USER and EMAIL_PASS are correct in .env');
    console.error('2. Make sure you are using Gmail App Password, not regular password');
    console.error('3. Enable "Less secure app access" or use App Password');
    console.error('4. Check your internet connection');
    console.error('5. Gmail might be blocking the connection - check security settings\n');
    
    return false;
  }
}

testEmailService();
