const DEFAULT_CLIENT_URL = 'https://fauz-scholarship-alert-1-ghxp.onrender.com';

/** Public frontend URL used in links sent by email and SMS. */
export const clientUrl = (process.env.CLIENT_URL || DEFAULT_CLIENT_URL).replace(/\/$/, '');
