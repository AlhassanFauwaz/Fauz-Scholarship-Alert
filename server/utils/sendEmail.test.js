import test from 'node:test';
import assert from 'node:assert/strict';
import { getEmailConfig } from './sendEmail.js';

const baseConfig = {
  EMAIL_HOST: 'smtp.gmail.com',
  EMAIL_PORT: '587',
  EMAIL_USER: 'mailer@gmail.com',
  EMAIL_PASS: 'app-password',
};

test('Gmail SMTP uses the authenticated mailbox instead of an unrelated legacy sender', () => {
  const config = getEmailConfig({ ...baseConfig, FROM_EMAIL: 'noreply@soas.com' });

  assert.equal(config.from, 'mailer@gmail.com');
  assert.equal(config.replyTo, 'mailer@gmail.com');
});

test('non-Gmail SMTP keeps an explicitly configured sender address', () => {
  const config = getEmailConfig({
    ...baseConfig,
    EMAIL_HOST: 'smtp.example-mail.com',
    EMAIL_FROM: 'noreply@soas.com',
  });

  assert.equal(config.from, 'noreply@soas.com');
});
