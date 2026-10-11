import Notification from '../models/Notification.js';
import User from '../models/User.js';

// @desc    Get notifications for admin (Broadcasts)
// @route   GET /api/notifications
// @access  Private (Admin)
export const getNotifications = async (req, res) => {
  try {
    let notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
    if (notifications.length === 0) {
      await Notification.insertMany([
        {
          title: 'System Security Audit Completed',
          message: 'Automated vulnerability scanning verified all scheme endpoints.',
          type: 'System',
          read: false
        },
        {
          title: 'New Citizen Application Pending',
          message: 'A new application for PM Kisan Samman Nidhi requires verification.',
          type: 'ApplicationUpdate',
          read: false
        },
        {
          title: 'Scheme Rules Updated',
          message: 'Post Matric Scholarship income ceiling was calibrated to ₹2,50,000.',
          type: 'SchemeAlert',
          read: true
        }
      ]);
      notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
    }
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private (Admin)
export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    notification.read = true;
    await notification.save();
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private (Admin)
export const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany({ read: false }, { $set: { read: true } });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a broadcast notification
// @route   POST /api/notifications
// @access  Private (Admin)
export const createNotification = async (req, res) => {
  try {
    const { title, message, type = 'Broadcast', targetAudience } = req.body;
    
    const notification = await Notification.create({
      title,
      message,
      type,
      targetAudience
    });

    if (req.app.get('io')) {
      req.app.get('io').emit('NEW_NOTIFICATION', { notification });
    }

    res.status(201).json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private (Admin)
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    await notification.deleteOne();
    res.json({ success: true, message: 'Notification removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
