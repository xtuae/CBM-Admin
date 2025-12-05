import nodemailer from 'nodemailer';

// Email service configuration from environment variables
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
  fromName: string;
}

// Get email configuration from environment variables
const getEmailConfig = (): EmailConfig | null => {
  const host = process.env.EMAIL_SMTP_HOST;
  const port = parseInt(process.env.EMAIL_SMTP_PORT || '587');
  const secure = process.env.EMAIL_SMTP_SECURE === 'true';
  const user = process.env.EMAIL_SMTP_USER;
  const pass = process.env.EMAIL_SMTP_PASS;
  const from = process.env.EMAIL_FROM || 'noreply@credits-marketplace.com';
  const fromName = process.env.EMAIL_FROM_NAME || 'Credits Marketplace';

  // Check if all required config is present
  if (!host || !user || !pass) {
    console.warn('Email configuration incomplete. Email features will be disabled.');
    return null;
  }

  return {
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    from,
    fromName,
  };
};

// Create transporter instance
let transporter: nodemailer.Transporter | null = null;

const getTransporter = (): nodemailer.Transporter | null => {
  if (transporter) return transporter;

  const config = getEmailConfig();
  if (!config) return null;

  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
  });

  return transporter;
};

// Email sending function
interface SendEmailParams {
  to: string;
  subject: string;
  text?: string;
  html: string;
}

export const sendEmail = async (params: SendEmailParams): Promise<boolean> => {
  try {
    const transporter = getTransporter();
    if (!transporter) {
      console.error('Email service not configured');
      return false;
    }

    const config = getEmailConfig();
    if (!config) {
      console.error('Email configuration missing');
      return false;
    }

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"${config.fromName}" <${config.from}>`,
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Order confirmation email template
export const sendOrderConfirmationEmail = async (
  userEmail: string,
  userName: string | null,
  orderDetails: {
    orderId: string;
    creditsAdded: number;
    amount: number;
    currency: string;
    orderDate: string;
  }
): Promise<boolean> => {
  const config = getEmailConfig();
  if (!config) return false;

  const { orderId, creditsAdded, amount, currency, orderDate } = orderDetails;

  const subject = `Order Confirmation - ${creditsAdded.toLocaleString()} Credits Added`;
  const greeting = userName ? `Hi ${userName},` : 'Hello,';

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - Credits Marketplace</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f9fafb; color: #111827; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .order-card { background-color: #f3f4f6; border-radius: 8px; padding: 24px; margin: 20px 0; border-left: 4px solid #3b82f6; }
        .order-details { display: table; width: 100%; margin: 20px 0; }
        .order-details div { display: table-row; }
        .order-details span { display: table-cell; padding: 8px 0; }
        .order-details .label { font-weight: 600; color: #6b7280; width: 150px; }
        .order-details .value { color: #111827; }
        .button { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .footer { background-color: #f3f4f6; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
        .credit-highlight { background-color: #dbeafe; border: 2px solid #3b82f6; border-radius: 6px; padding: 20px; margin: 20px 0; text-align: center; }
        .credit-amount { font-size: 28px; font-weight: bold; color: #1e40af; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Payment Successful!</h1>
          <p>Your order has been confirmed and credits have been added to your account.</p>
        </div>

        <div class="content">
          <p style="font-size: 18px; margin-bottom: 30px;">${greeting}</p>

          <p>Thank you for your purchase! Your payment has been processed successfully and credits have been added to your digital services account.</p>

          <div class="credit-highlight">
            <div class="credit-amount">${creditsAdded.toLocaleString()} Credits Added</div>
            <p style="margin: 8px 0 0 0; color: #1e40af;">Available for immediate use</p>
          </div>

          <div class="order-card">
            <h3 style="margin-top: 0; color: #1e40af;">Order Details</h3>
            <div class="order-details">
              <div>
                <span class="label">Order ID:</span>
                <span class="value">${orderId}</span>
              </div>
              <div>
                <span class="label">Order Date:</span>
                <span class="value">${new Date(orderDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              <div>
                <span class="label">Amount Paid:</span>
                <span class="value">$${amount.toFixed(2)} ${currency.toUpperCase()}</span>
              </div>
              <div>
                <span class="label">Credits Added:</span>
                <span class="value" style="color: #059669; font-weight: 600;">${creditsAdded.toLocaleString()} Credits</span>
              </div>
            </div>
          </div>

          <p>Your credits are now available in your dashboard and can be used immediately for any digital service on our platform.</p>

          <p>If you have any questions about your order or need assistance, please don't hesitate to contact our support team.</p>

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'https://credits-marketplace.com'}/dashboard" class="button">
              View Your Dashboard
            </a>
          </div>

          <p style="margin-top: 40px;">Best regards,<br><strong>The Credits Marketplace Team</strong></p>
        </div>

        <div class="footer">
          <p>This is an automated message from Credits Marketplace. Please do not reply to this email.</p>
          <p>© ${new Date().getFullYear()} Credits Marketplace. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Hello ${userName || 'there'},

Thank you for your purchase! Your payment has been processed successfully.

Order Details:
- Order ID: ${orderId}
- Order Date: ${new Date(orderDate).toLocaleDateString()}
- Amount Paid: $${amount.toFixed(2)} ${currency.toUpperCase()}
- Credits Added: ${creditsAdded.toLocaleString()}

Your credits are now available for immediate use on our platform.

Visit your dashboard: ${process.env.FRONTEND_URL || 'https://credits-marketplace.com'}/dashboard

Best regards,
The Credits Marketplace Team
  `.trim();

  return await sendEmail({
    to: userEmail,
    subject,
    text,
    html,
  });
};

// Test email function (for development/testing)
export const sendTestEmail = async (recipientEmail: string): Promise<boolean> => {
  return await sendEmail({
    to: recipientEmail,
    subject: 'Credits Marketplace - Email Test',
    text: 'This is a test email from Credits Marketplace.',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Credits Marketplace - Email Test</h2>
        <p>This is a test email to verify that email functionality is working correctly.</p>
        <p>If you're receiving this, your email configuration is set up properly!</p>
        <p>Sent at: ${new Date().toISOString()}</p>
      </div>
    `,
  });
};

// Health check function for email service
export const checkEmailService = async (): Promise<boolean> => {
  try {
    const transporter = getTransporter();
    if (!transporter) return false;

    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Email service health check failed:', error);
    return false;
  }
};
