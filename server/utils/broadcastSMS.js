import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import sendSMS from './sendSMS.js';

/**
 * Send an SMS to active users who opted in through their profile or an active
 * subscription's SMS channel.
 * @param {Object} opportunity - The opportunity object
 * @param {string} action - 'created' or 'updated'
 */
export const broadcastOpportunitySMS = async (opportunity, action = 'created') => {
  try {
    const subscriptionUserIds = await Subscription.distinct('user', {
      active: { $ne: false },
      'notificationChannels.sms': true,
    });

    const users = await User.find({
      phone: { $type: 'string', $regex: /\S/ },
      accountStatus: 'active',
      $or: [
        { 'notificationPreferences.sms': true },
        { _id: { $in: subscriptionUserIds } },
      ],
    }).select('phone');

    const message =
      action === 'updated'
        ? `SOAS: An opportunity you follow was updated: ${opportunity.title}. Manage SMS alerts in your SOAS profile.`
        : `SOAS: New ${opportunity.type}: ${opportunity.title}. Manage SMS alerts in your SOAS profile.`;

    for (const user of users) {
      try {
        await sendSMS(user.phone, message);
      } catch (smsError) {
        console.error(`Failed to send SMS to ${user.phone}`, smsError.message);
      }
    }

    console.log(`📱 Broadcast SMS sent to ${users.length} users for ${action} opportunity: ${opportunity.title}`);
  } catch (error) {
    console.error('❌ Broadcast SMS failed:', error);
  }
};
