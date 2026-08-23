import mongoose from 'mongoose';

const notificationLogSchema = new mongoose.Schema({
  notification: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notification',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  channel: String,
  provider: String, // e.g., 'console', 'sendgrid', 'twilio'
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed'],
    default: 'pending',
  },
  errorMessage: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const NotificationLog = mongoose.model('NotificationLog', notificationLogSchema);

export default NotificationLog;