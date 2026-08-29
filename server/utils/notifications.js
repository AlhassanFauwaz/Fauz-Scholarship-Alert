import Notification from '../models/Notification.js';
import NotificationLog from '../models/NotificationLog.js';
import User from '../models/User.js';
import sendEmail from './sendEmail.js';
import sendSMS from './sendSMS.js';
import { clientUrl } from '../config/clientUrl.js';
import { escapeHtml, truncateWords } from './emailContent.js';

/**
 * Create an in-app notification and optionally send an explicitly requested
 * delivery channel, subject to the user's notification preferences.
 */
export const createNotification = async ({
  user,          // user object or user ID
  opportunity,
  title,
  message,
  type = 'new_match',
  channel = 'in-app',
}) => {
  try {
    // Resolve user object if only ID was passed
    const userObj = typeof user === 'object' ? user : await User.findById(user);
    if (!userObj) {
      console.error('Notification skipped – user not found');
      return null;
    }

    // Always create in-app notification
    const notification = await Notification.create({
      user: userObj._id,
      opportunity,
      title,
      message,
      type,
      channel: 'in-app',
      status: 'sent',
      sentAt: new Date(),
    });

    await NotificationLog.create({
      notification: notification._id,
      user: userObj._id,
      channel: 'in-app',
      provider: 'internal',
      status: 'sent',
    });

    // --- Email ---
    if (channel === 'email' && userObj.notificationPreferences?.email) {
      try {
        const emailTitle = truncateWords(title, 30);
        const emailMessage = truncateWords(message, 80);
        await sendEmail({
          to: userObj.email,
          subject: emailTitle,
          preheader: emailMessage,
          html: `<h1 style="margin:0 0 12px;font-size:25px;color:#0a2b3c;">${escapeHtml(emailTitle)}</h1><p style="margin:0 0 22px;">${escapeHtml(emailMessage)}</p>${opportunity ? `<a href="${clientUrl}/opportunity/${opportunity}" style="display:inline-block;padding:12px 18px;border-radius:8px;background:#1c9c4d;color:#ffffff;font-weight:700;text-decoration:none;">View opportunity</a>` : ''}`,
          text: `${emailMessage}${opportunity ? ` View opportunity: ${clientUrl}/opportunity/${opportunity}` : ''}`,
        });
        await NotificationLog.create({
          notification: notification._id,
          user: userObj._id,
          channel: 'email',
          provider: 'nodemailer',
          status: 'sent',
        });
      } catch (err) {
        console.error('Email failed:', err.message);
        await NotificationLog.create({
          notification: notification._id,
          user: userObj._id,
          channel: 'email',
          provider: 'nodemailer',
          status: 'failed',
          errorMessage: err.message,
        });
      }
    }

    // --- SMS ---
    if (channel === 'sms' && userObj.notificationPreferences?.sms && userObj.phone) {
      try {
        await sendSMS(userObj.phone, message);
        await NotificationLog.create({
          notification: notification._id,
          user: userObj._id,
          channel: 'sms',
          provider: 'arkesel',
          status: 'sent',
        });
      } catch (err) {
        console.error('SMS failed:', err.message);
        await NotificationLog.create({
          notification: notification._id,
          user: userObj._id,
          channel: 'sms',
          provider: 'arkesel',
          status: 'failed',
          errorMessage: err.message,
        });
      }
    }

    return notification;
  } catch (error) {
    console.error('Error in createNotification:', error);
    throw error;
  }
};

/**
 * Notify all matching users when a new opportunity is published.
 */
export const notifyMatchingUsers = async (opportunity, matchingUsers) => {
  const notifications = [];
  for (const user of matchingUsers) {
    // user already contains matchScore property, but we only need user object
    const notification = await createNotification({
      user,   // full user object
      opportunity: opportunity._id,
      title: `New Matching Opportunity: ${opportunity.title}`,
      message: `A new ${opportunity.type} "${opportunity.title}" matches your profile (${user.matchScore}% match).`,
      type: 'new_match',
    });
    notifications.push(notification);
  }
  return notifications;
};

/**
 * Create an in-app notification for every registered user when a published
 * opportunity is updated. This intentionally does not send email or SMS,
 * because those channels are broadcast separately by the opportunity flow.
 */
export const broadcastOpportunityUpdateInApp = async (opportunity) => {
  try {
    const users = await User.find({}).select('_id');
    if (!users.length) return;

    const sentAt = new Date();
    const notifications = await Notification.insertMany(
      users.map((user) => ({
        user: user._id,
        opportunity: opportunity._id,
        title: `Opportunity Updated: ${opportunity.title}`,
        message: `An opportunity has been updated: ${opportunity.title}. View it for the latest details.`,
        type: 'opportunity_update',
        channel: 'in-app',
        status: 'sent',
        sentAt,
      }))
    );

    await NotificationLog.insertMany(
      notifications.map((notification) => ({
        notification: notification._id,
        user: notification.user,
        channel: 'in-app',
        provider: 'internal',
        status: 'sent',
      }))
    );

    console.log(`Created in-app update notifications for ${users.length} users: ${opportunity.title}`);
  } catch (error) {
    console.error('Failed to broadcast in-app opportunity update:', error);
    throw error;
  }
};
