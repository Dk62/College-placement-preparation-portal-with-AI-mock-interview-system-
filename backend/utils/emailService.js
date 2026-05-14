const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Sanitize inputs for extreme resilience
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASSWORD?.replace(/\s+/g, '').trim(); // Strip spaces automatically from Google App Password blocks
  const smtpPort = Number(process.env.SMTP_PORT) || 587;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: smtpPort,
    secure: smtpPort === 465, // True only for legacy SSL port 465
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      rejectUnauthorized: false // Bypass self-signed local dev certificate handshake blockers
    }
  });

  const message = {
    from: `"AI Placement Recovery" <${smtpUser}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html, // Styled HTML container
  };

  const info = await transporter.sendMail(message);
  console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
