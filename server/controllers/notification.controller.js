const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getUserNotifications = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    const notifications = await Notification.findByUserId(req.user.id, limit, offset);
    
    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    console.error('Get user notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread/count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(req.user.id);
    
    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Check if user owns this notification
    if (notification.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this notification'
      });
    }
    
    // Mark as read
    await Notification.markAsRead(req.params.id);
    
    res.status(200).json({
      success: true,
      data: { id: req.params.id, is_read: true }
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read/all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    const count = await Notification.markAllAsRead(req.user.id);
    
    res.status(200).json({
      success: true,
      message: `${count} notifications marked as read`,
      count
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Check if user owns this notification
    if (notification.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this notification'
      });
    }
    
    // Delete notification
    await Notification.delete(req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create notification (Admin only)
// @route   POST /api/notifications
// @access  Private (Admin only)
exports.createNotification = async (req, res) => {
  try {
    const { user_id, title, message, type, related_id } = req.body;
    
    // Check if user exists
    const user = await User.findById(user_id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Create notification
    const notification = await Notification.create({
      user_id,
      title,
      message,
      type: type || 'system',
      related_id,
      is_read: false
    });
    
    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Send email notification
// @route   POST /api/notifications/email
// @access  Private (Admin only)
exports.sendEmailNotification = async (req, res) => {
  try {
    const { user_id, title, message } = req.body;
    
    // Check if user exists
    const user = await User.findById(user_id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Create notification in database
    const notification = await Notification.create({
      user_id,
      title,
      message,
      type: 'system',
      is_read: false
    });
    
    // Send email
    const emailSent = await Notification.sendEmailNotification(notification, user);
    
    if (!emailSent) {
      return res.status(400).json({
        success: false,
        message: 'Failed to send email notification'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Email notification sent successfully',
      data: notification
    });
  } catch (error) {
    console.error('Send email notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Send SMS notification
// @route   POST /api/notifications/sms
// @access  Private (Admin only)
exports.sendSmsNotification = async (req, res) => {
  try {
    const { user_id, title, message } = req.body;
    
    // Check if user exists
    const user = await User.findById(user_id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Create notification in database
    const notification = await Notification.create({
      user_id,
      title,
      message,
      type: 'system',
      is_read: false
    });
    
    // Send SMS
    const smsSent = await Notification.sendSmsNotification(notification, user);
    
    if (!smsSent) {
      return res.status(400).json({
        success: false,
        message: 'Failed to send SMS notification'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'SMS notification sent successfully',
      data: notification
    });
  } catch (error) {
    console.error('Send SMS notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 