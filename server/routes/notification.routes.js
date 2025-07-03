const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Notification = require('../models/Notification');

// Protected routes
router.use(protect);

// Get all notifications for a user
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.findByUserId(req.user.id);
    
    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get unread notification count
router.get('/unread-count', async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(req.user.id);
    
    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Check if user owns the notification
    if (notification.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this notification'
      });
    }
    
    const updated = await Notification.markAsRead(req.params.id);
    
    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'Failed to mark notification as read'
      });
    }
    
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
});

// Mark all notifications as read
router.put('/read-all', async (req, res) => {
  try {
    await Notification.markAllAsRead(req.user.id);
    
    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Delete notification
router.delete('/:id', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Check if user owns the notification
    if (notification.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this notification'
      });
    }
    
    const deleted = await Notification.delete(req.params.id);
    
    if (!deleted) {
      return res.status(400).json({
        success: false,
        message: 'Failed to delete notification'
      });
    }
    
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
});

// Admin only routes
router.post('/', authorize('admin'), async (req, res) => {
  try {
    const { user_id, title, message, type, reference_id } = req.body;
    
    const notification = await Notification.create({
      user_id,
      title,
      message,
      type,
      reference_id
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
});

module.exports = router; 