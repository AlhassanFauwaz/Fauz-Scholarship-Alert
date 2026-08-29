import test from 'node:test';
import assert from 'node:assert/strict';
import { getEmailConfig } from './sendEmail.js';

const baseConfig = {
  RESEND_API_KEY: 're_test_key',
  EMAIL_FROM: 'Fauz Scholarship Alert <onboarding@resend.dev>',
};

test('reads the Resend API key and sender address', () => {
  const config = getEmailConfig({
    ...baseConfig,
    EMAIL_REPLY_TO: 'support@soas.com',
  });

  assert.equal(config.apiKey, 're_test_key');
  assert.equal(config.from, 'Fauz Scholarship Alert <onboarding@resend.dev>');
  assert.equal(config.replyTo, 'support@soas.com');
});

test('requires the Resend API key and sender address', () => {
  assert.throws(
    () => getEmailConfig({}),
    /RESEND_API_KEY, EMAIL_FROM/
  );
});

test('does not require a reply-to address', () => {
  const config = getEmailConfig(baseConfig);

  assert.equal(config.replyTo, undefined);
});
