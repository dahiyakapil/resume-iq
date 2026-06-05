/**
 * Alternative email service using SendGrid
 * Use this in production if Gmail SMTP is blocked
 * 
 * Installation: npm install @sendgrid/mail
 * 
 * Setup:
 * 1. Sign up at https://sendgrid.com
 * 2. Get API key from Settings > API Keys
 * 3. Add to .env: SENDGRID_API_KEY=your-key-here
 * 4. Update sendEmail import in controllers to use this file
 */

// import sgMail from '@sendgrid/mail';

// if (process.env.SENDGRID_API_KEY) {
//   sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// }

// export const sendEmail = async ({ to, subject, text, html }) => {
//   try {
//     if (!process.env.SENDGRID_API_KEY) {
//       throw new Error("SendGrid API key not configured");
//     }

//     console.log(`[SENDGRID] Sending email to: ${to}`);

//     const msg = {
//       to,
//       from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
//       subject,
//       text,
//       html,
//     };

//     const response = await sgMail.send(msg);
    
//     console.log(`[SENDGRID] Email sent successfully to ${to}`);
//     return response;

//   } catch (error) {
//     console.error('[SENDGRID] Failed to send email:', {
//       error: error.message,
//       code: error.code,
//       response: error.response?.body
//     });
//     throw new Error(`Failed to send email: ${error.message}`);
//   }
// };

/**
 * Alternative: Using Nodemailer with custom SMTP
 * More flexible for different email providers
 */

import nodemailer from 'nodemailer';

export const sendEmailViaSMTP = async ({ to, subject, text, html }) => {
  try {
    // Get SMTP configuration from environment variables
    const smtpConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 15000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
    };

    console.log(`[SMTP] Connecting to ${smtpConfig.host}:${smtpConfig.port}...`);

    const transporter = nodemailer.createTransport(smtpConfig);

    // Verify connection
    await transporter.verify();
    console.log('[SMTP] Connection verified');

    // Send email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"Resumind AI" <${smtpConfig.auth.user}>`,
      to,
      subject,
      text,
      html,
    });

    console.log(`[SMTP] Email sent successfully. MessageId: ${info.messageId}`);
    return info;

  } catch (error) {
    console.error('[SMTP] Failed to send email:', error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Resend API - Modern email service (recommended)
 * Installation: npm install resend
 * Free tier: 100 emails/day, 3000/month
 * Website: https://resend.com
 */

// import { Resend } from 'resend';

// const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// export const sendEmailViaResend = async ({ to, subject, text, html }) => {
//   try {
//     if (!resend) {
//       throw new Error("Resend API key not configured");
//     }

//     console.log(`[RESEND] Sending email to: ${to}`);

//     const { data, error } = await resend.emails.send({
//       from: process.env.EMAIL_FROM || 'Resumind AI <onboarding@resend.dev>',
//       to: [to],
//       subject,
//       html,
//     });

//     if (error) {
//       throw error;
//     }

//     console.log(`[RESEND] Email sent successfully. ID: ${data.id}`);
//     return data;

//   } catch (error) {
//     console.error('[RESEND] Failed to send email:', error.message);
//     throw new Error(`Failed to send email: ${error.message}`);
//   }
// };
