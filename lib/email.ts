import nodemailer from "nodemailer";

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"WMS Notifications" <${process.env.EMAIL_USER}>`, // Branded sender name
    to,
    subject,
    text,
    html: html || `<p>${text.replace(/\n/g, '<br>')}</p>`, // Convert newlines to <br> for better HTML rendering
    replyTo: process.env.EMAIL_USER, // Set Reply-To for responses
    headers: {
      'X-Priority': '3', // Normal priority
      'X-MSMail-Priority': 'Normal',
      'Importance': 'Normal',
    },
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to send email" };
  }
}