import User from '../models/User.js';
import sendEmail from './sendEmail.js';
import { clientUrl } from '../config/clientUrl.js';
import { escapeHtml, truncateWords } from './emailContent.js';

/**
 * Send an email only to active, verified users who explicitly enabled email
 * notifications.
 * @param {Object} opportunity - The opportunity object
 * @param {string} action - 'created' or 'updated'
 */
export const broadcastOpportunityEmail = async (opportunity, action = 'created') => {
  try {
    // The visible email copy stays under 150 words, even for long listings.
    const opportunityTitle = truncateWords(opportunity.title, 30);
    const opportunityDescription = truncateWords(opportunity.description, 80);
    const users = await User.find({
      accountStatus: 'active',
      emailVerified: true,
      'notificationPreferences.email': true,
    }).select('email fullName');

    const subject =
      action === 'updated'
        ? `Opportunity Updated: ${opportunityTitle}`
        : `New Opportunity: ${opportunityTitle}`;

    const html = `
      <h1 style="margin:0 0 12px;font-size:27px;line-height:1.25;color:#0a2b3c;">${action === 'updated' ? 'An opportunity was updated' : 'A new opportunity is available'}</h1>
      <p style="margin:0 0 8px;font-size:19px;font-weight:700;color:#18352a;">${escapeHtml(opportunityTitle)}</p>
      <p style="margin:0 0 24px;">${escapeHtml(opportunityDescription)}</p>
      <a href="${clientUrl}/opportunity/${opportunity._id}" style="display:inline-block;padding:12px 18px;border-radius:8px;background:#1c9c4d;color:#ffffff;font-weight:700;text-decoration:none;">View opportunity</a>
    `;

    for (const user of users) {
      await sendEmail({ to: user.email, subject, preheader: `${opportunityTitle} is ready to explore.`, html, text: `${subject}: ${opportunityDescription}. ${clientUrl}/opportunity/${opportunity._id}` });
    }

    console.log(`📧 Broadcast email sent to ${users.length} users for ${action} opportunity: ${opportunity.title}`);
  } catch (error) {
    console.error('❌ Broadcast email failed:', error);
  }
};
