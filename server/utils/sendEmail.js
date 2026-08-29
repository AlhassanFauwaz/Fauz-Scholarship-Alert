import { Resend } from 'resend';

export const getEmailConfig = (env = process.env) => {
  const apiKey = env.RESEND_API_KEY?.trim();
  const from = env.EMAIL_FROM?.trim();
  const replyTo = env.EMAIL_REPLY_TO?.trim();

  const missing = [
    !apiKey && 'RESEND_API_KEY',
    !from && 'EMAIL_FROM',
  ].filter(Boolean);

  if (missing.length) {
    throw new Error(
      `Email is not configured. Set ${missing.join(', ')} in the deployment environment.`
    );
  }

  return {
    apiKey,
    from,
    replyTo,
  };
};

const brandEmail = ({
  content,
  preheader = 'Updates from Fauz Scholarship Alert',
}) => `
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1"
      />
      <meta
        name="x-apple-disable-message-reformatting"
      />
      <title>Fauz Scholarship Alert</title>
    </head>

    <body
      style="
        margin:0;
        padding:0;
        background:#f3f7f5;
        color:#18352a;
        font-family:Arial,Helvetica,sans-serif;
      "
    >

      <div
        style="
          display:none;
          max-height:0;
          overflow:hidden;
          opacity:0;
          color:transparent;
        "
      >
        ${preheader}
      </div>

      <table
        role="presentation"
        width="100%"
        cellspacing="0"
        cellpadding="0"
        style="background:#f3f7f5;padding:32px 16px;"
      >
        <tr>
          <td align="center">

            <table
              role="presentation"
              width="100%"
              cellspacing="0"
              cellpadding="0"
              style="
                max-width:600px;
                background:#ffffff;
                border-radius:20px;
                overflow:hidden;
                box-shadow:0 10px 30px rgba(17,54,38,.10);
              "
            >

              <tr>
                <td
                  style="
                    padding:28px 36px;
                    background:#0a2b3c;
                    color:#ffffff;
                  "
                >
                  <div
                    style="
                      font-size:13px;
                      font-weight:700;
                      letter-spacing:1.6px;
                      text-transform:uppercase;
                      color:#bff4d0;
                    "
                  >
                    Fauz Scholarship Alert
                  </div>

                  <div
                    style="
                      margin-top:8px;
                      font-size:25px;
                      font-weight:800;
                      line-height:1.2;
                    "
                  >
                    Opportunities made clearer
                  </div>
                </td>
              </tr>

              <tr>
                <td
                  style="
                    padding:34px 36px;
                    font-size:16px;
                    line-height:1.65;
                    color:#385149;
                  "
                >
                  ${content}
                </td>
              </tr>

              <tr>
                <td
                  style="
                    padding:20px 36px;
                    border-top:1px solid #e6eee9;
                    font-size:12px;
                    line-height:1.55;
                    color:#6b7e76;
                  "
                >
                  You received this email because you have a
                  Fauz Scholarship Alert account.
                  <br />
                  Please do not reply directly to this automated message.
                </td>
              </tr>

            </table>

          </td>
        </tr>
      </table>

    </body>
  </html>
`;

const sendEmail = async (options) => {
  const {
    apiKey,
    from,
    replyTo,
  } = getEmailConfig();

  const resend = new Resend(apiKey);

  const emailData = {
    from,
    to: [options.to],
    subject: options.subject,
    html: brandEmail({
      content: options.html,
      preheader: options.preheader,
    }),
    text:
      options.text ||
      'You have a new update from Fauz Scholarship Alert.',
  };

  if (replyTo) {
    emailData.replyTo = replyTo;
  }

  try {
    const { data, error } = await resend.emails.send(emailData);

    if (error) {
      throw new Error(
        `Email delivery failed: ${error.message}`
      );
    }

    if (!data?.id) {
      throw new Error(
        'Resend did not return an email ID.'
      );
    }

    console.log(
      `✅ Email sent to ${options.to} (Resend ID: ${data.id})`
    );

    return data;

  } catch (error) {
    console.error(
      `Email delivery failed for ${options.to}:`,
      error
    );

    throw error.message.startsWith('Email delivery failed:')
      ? error
      : new Error(`Email delivery failed: ${error.message}`, { cause: error });
  }
};

export default sendEmail;
