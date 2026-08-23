import cron from 'node-cron';
import Opportunity from '../models/Opportunity.js';
import SavedOpportunity from '../models/SavedOpportunity.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { createNotification } from '../utils/notifications.js';

const REMINDER_DAYS = process.env.REMINDER_DAYS
  ? process.env.REMINDER_DAYS.split(',').map(Number)
  : [14, 7, 3, 1];

export const startDeadlineScheduler = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('⏰ Deadline scheduler running...');

    try {
      const now = new Date();

      // 1. Expire opportunities
      const expiredResult = await Opportunity.updateMany(
        { status: 'published', deadline: { $lte: now } },
        { $set: { status: 'expired' } }
      );
      if (expiredResult.modifiedCount > 0) {
        console.log(`📦 Expired ${expiredResult.modifiedCount} opportunities.`);
      }

      // 2. Send deadline reminders
      for (const days of REMINDER_DAYS) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + days);
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        const opportunities = await Opportunity.find({
          status: 'published',
          deadline: { $gte: startOfDay, $lte: endOfDay },
        });

        for (const opp of opportunities) {
          const savedEntries = await SavedOpportunity.find({ opportunity: opp._id });
          const userIds = savedEntries.map((s) => s.user);

          for (const userId of userIds) {
            const alreadyNotified = await Notification.exists({
              user: userId,
              opportunity: opp._id,
              type: 'deadline_reminder',
              message: { $regex: new RegExp(`in ${days} days`) },
            });
            if (alreadyNotified) continue;

            const user = await User.findById(userId);
            if (!user) continue;

            // createNotification now handles email/SMS automatically
            await createNotification({
              user,   // full user object
              opportunity: opp._id,
              title: `Deadline approaching: ${opp.title}`,
              message: `The opportunity "${opp.title}" closes in ${days} days. Don't miss it!`,
              type: 'deadline_reminder',
            });
          }
        }
      }

      console.log('✅ Deadline scheduler finished.');
    } catch (error) {
      console.error('❌ Deadline scheduler error:', error);
    }
  });

  console.log('🕒 Deadline scheduler initialized (runs daily at midnight).');
};