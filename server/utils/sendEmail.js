import nodemailer from 'nodemailer';

const isGmailSmtp = (host) => /(^|\.)gmail\.com$/i.test(host);

export const getEmailConfig = (env = process.env) => {
  const getValue = (...keys) => keys
    .map((key) => env[key]?.trim())
    .find(Boolean);

  const host = getValue('EMAIL_HOST');
  const port = Number(getValue('EMAIL_PORT') || 587);
  const user = getValue('EMAIL_USER');
  const pass = getValue('EMAIL_PASS');
  // FROM_EMAIL is the original project setting; EMAIL_FROM is the Render setting.
  const configuredFrom = getValue('EMAIL_FROM', 'FROM_EMAIL');
  const useAuthenticatedSender = isGmailSmtp(host) && configuredFrom && configuredFrom.toLowerCase() !== user?.toLowerCase();
  const from = useAuthenticatedSender ? user : configuredFrom || user;
  const replyTo = getValue('EMAIL_REPLY_TO', 'REPLY_TO_EMAIL') || from;
  const missing = [!host && 'EMAIL_HOST', !user && 'EMAIL_USER', !pass && 'EMAIL_PASS'].filter(Boolean);

  if (missing.length) {
    throw new Error(`Email is not configured. Set ${missing.join(', ')} in the deployment environment.`);
  }

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('EMAIL_PORT must be a valid SMTP port number.');
  }

  if (useAuthenticatedSender) {
    console.warn('Ignoring EMAIL_FROM/FROM_EMAIL because Gmail SMTP can only send from the authenticated mailbox or a configured Gmail alias.');
  }

  return { host, port, user, pass, from, replyTo };
};

const brandEmail = ({ content, preheader = 'Updates from Fauz Scholarship Alert' }) => `
  <!doctype html><html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><meta name="x-apple-disable-message-reformatting" /><title>Fauz Scholarship Alert</title></head>
  <body style="margin:0;padding:0;background:#f3f7f5;color:#18352a;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${preheader}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f7f5;padding:32px 16px;"><tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 10px 30px rgba(17,54,38,.10);">
        <tr><td style="padding:28px 36px;background:#0a2b3c;color:#ffffff;"><div style="font-size:13px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#bff4d0;">Fauz Scholarship Alert</div><div style="margin-top:8px;font-size:25px;font-weight:800;line-height:1.2;">Opportunities made clearer</div></td></tr>
        <tr><td style="padding:34px 36px;font-size:16px;line-height:1.65;color:#385149;">${content}</td></tr>
        <tr><td style="padding:20px 36px;border-top:1px solid #e6eee9;font-size:12px;line-height:1.55;color:#6b7e76;">You received this email because you have a Fauz Scholarship Alert account.<br />Please do not reply directly to this automated message.</td></tr>
      </table>
    </td></tr></table>
  </body></html>`;

const sendEmail = async (options) => {
  const { host, port, user, pass, from, replyTo } = getEmailConfig();

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    requireTLS: port === 587,
    auth: {
      user,
      pass,
    },
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 30_000,
  });

  // Gmail SMTP should send from its authenticated mailbox. An unrelated
  // From domain often fails DMARC alignment and is routed to spam.
  const fromEmail = from;

  const mailOptions = {
    from: `"Fauz Scholarship Alert" <${fromEmail}>`,
    to: options.to,
    subject: options.subject,
    html: brandEmail({ content: options.html, preheader: options.preheader }),
    text: options.text || 'You have a new update from Fauz Scholarship Alert.',
    replyTo,
  };

  let info;
  try {
    info = await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Email delivery failed for ${options.to}:`, error.code || error.message);
    throw new Error(`Email delivery failed: ${error.message}`, { cause: error });
  }
  if (!info.accepted?.length) {
    throw new Error('The email provider did not accept the recipient address.');
  }
  console.log(`✅ Email sent to ${options.to} (messageId: ${info.messageId})`);
};

export default sendEmail;
