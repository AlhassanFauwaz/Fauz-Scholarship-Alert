import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  console.log('📧 EMAIL ENV VARS:', {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS ? '(hidden)' : 'MISSING',
    from: process.env.FROM_EMAIL,
  });

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: Number(process.env.EMAIL_PORT) === 465,
    requireTLS: Number(process.env.EMAIL_PORT) === 587,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Gmail SMTP should send from its authenticated mailbox. An unrelated
  // From domain often fails DMARC alignment and is routed to spam.
  const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER;

  const mailOptions = {
    from: `"SOAS" <${fromEmail}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
    replyTo: process.env.EMAIL_REPLY_TO || fromEmail,
  };

  const info = await transporter.sendMail(mailOptions);
  if (!info.accepted?.length) {
    throw new Error('The email provider did not accept the recipient address.');
  }
  console.log(`✅ Email sent to ${options.to} (messageId: ${info.messageId})`);
};

export default sendEmail;
