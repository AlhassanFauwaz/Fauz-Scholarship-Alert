const DEFAULT_CLIENT_URL = 'https://fauz-scholarship-alert-1-ghxp.onrender.com';

const configuredClientUrl = process.env.CLIENT_URL?.trim();

const isLocalUrl = (value) => {
  try {
    const { hostname } = new URL(value);
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
  } catch {
    return true;
  }
};

/**
 * Public frontend URL used in email and SMS links. A localhost value saved in
 * an environment variable is deliberately ignored so production emails never
 * link to a recipient's phone or computer.
 */
export const clientUrl = (!configuredClientUrl || isLocalUrl(configuredClientUrl)
  ? DEFAULT_CLIENT_URL
  : configuredClientUrl
).replace(/\/$/, '');
