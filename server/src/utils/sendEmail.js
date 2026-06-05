import { Resend } from 'resend';

/**
 * Send email using Resend API
 * Resend is a modern email API that works reliably on all hosting platforms
 * Free tier: 100 emails/day, 3000/month
 * Setup: https://resend.com/docs/send-with-nodejs
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    // Validate Resend API key
    if (!process.env.RESEND_API_KEY) {
      console.error('[EMAIL] RESEND_API_KEY not configured in environment variables');
      throw new Error("Email service not configured. Please add RESEND_API_KEY to environment variables.");
    }

    // Validate recipient email
    if (!to || !to.trim()) {
      throw new Error("Recipient email address is required");
    }

    console.log(`[EMAIL] Attempting to send email to: ${to}`);
    console.log(`[EMAIL] Using Resend API with key: ${process.env.RESEND_API_KEY.substring(0, 10)}...`);

    // Initialize Resend client
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Determine sender email
    // For production, use your verified domain: 'Resumind AI <noreply@yourdomain.com>'
    // For testing, use Resend's test domain: 'onboarding@resend.dev'
    const fromEmail = process.env.EMAIL_FROM || 'Resumind AI <onboarding@resend.dev>';
    
    console.log(`[EMAIL] Sending from: ${fromEmail}`);

    // Send email using Resend API
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: subject,
      text: text, // Plain text fallback
      html: html,
    });

    if (error) {
      console.error('[EMAIL] Resend API error:', {
        message: error.message,
        name: error.name,
        statusCode: error.statusCode,
        details: error
      });
      throw new Error(`Resend API error: ${error.message || JSON.stringify(error)}`);
    }

    console.log(`[EMAIL] ✅ Email sent successfully to ${to}. Message ID: ${data?.id || 'N/A'}`);
    return { 
      success: true,
      messageId: data?.id, 
      ...data 
    };

  } catch (error) {
    console.error(`[EMAIL] ❌ Failed to send email to ${to}:`, {
      error: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack
    });
    
    // Re-throw with clear error message
    throw new Error(`Failed to send email: ${error.message}`);
  }
};
