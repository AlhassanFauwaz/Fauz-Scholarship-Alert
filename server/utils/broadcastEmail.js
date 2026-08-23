import User from '../models/User.js';
import sendEmail from './sendEmail.js';

/**
 * Send an email only to active, verified users who explicitly enabled email
 * notifications.
 * @param {Object} opportunity - The opportunity object
 * @param {string} action - 'created' or 'updated'
 */
export const broadcastOpportunityEmail = async (opportunity, action = 'created') => {
  try {
    const users = await User.find({
      accountStatus: 'active',
      emailVerified: true,
      'notificationPreferences.email': true,
    }).select('email fullName');

    const subject =
      action === 'updated'
        ? `Opportunity Updated: ${opportunity.title}`
        : `New Opportunity: ${opportunity.title}`;

    const html = `
      <h2>${action === 'updated' ? 'An opportunity has been updated' : 'A new opportunity is available'}</h2>
      <p><strong>${opportunity.title}</strong></p>
      <p>${opportunity.description}</p>
      <p><a href="${process.env.CLIENT_URL}/opportunity/${opportunity._id}">View Opportunity</a></p>
    `;

    for (const user of users) {
      await sendEmail({ to: user.email, subject, html });
    }

    console.log(`📧 Broadcast email sent to ${users.length} users for ${action} opportunity: ${opportunity.title}`);
  } catch (error) {
    console.error('❌ Broadcast email failed:', error);
  }
};
