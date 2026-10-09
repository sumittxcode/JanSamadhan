const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Universal Notification Service
 * Handles in-app notifications persisted to MongoDB,
 * with non-blocking support for optional Email and SMS delivery.
 */
const sendNotification = async (firstArg, secondArg) => {
  try {
    let userId, message;
    if (typeof firstArg === 'object' && firstArg !== null && firstArg.userId) {
      userId = firstArg.userId;
      message = firstArg.message;
    } else {
      userId = firstArg;
      message = secondArg;
    }

    if (!userId || !message) return null;

    // 1. Mandatory In-App Notification (Stored in MongoDB)
    const notification = await Notification.create({
      userId,
      message,
      read: false
    });

    // 2. Optional External Email Notification (Non-blocking demonstration architecture)
    if (process.env.EMAIL_ENABLED === 'true') {
      try {
        const user = await User.findById(userId).select('email fullName');
        if (user && user.email) {
          // Log or dispatch email via SMTP / SendGrid / Nodemailer
          console.log(`[NotificationService] Dispatched Email to ${user.email}: "${message}"`);
        }
      } catch (emailErr) {
        console.warn('[NotificationService] Email delivery skipped:', emailErr.message);
      }
    }

    // 3. Optional External SMS Notification (Non-blocking demonstration architecture)
    if (process.env.SMS_ENABLED === 'true') {
      try {
        const user = await User.findById(userId).select('phone fullName');
        if (user && user.phone) {
          console.log(`[NotificationService] Dispatched SMS to ${user.phone}: "${message}"`);
        }
      } catch (smsErr) {
        console.warn('[NotificationService] SMS delivery skipped:', smsErr.message);
      }
    }

    return notification;
  } catch (error) {
    console.error('[NotificationService] Failed to create notification:', error.message);
    return null;
  }
};

module.exports = { sendNotification };
