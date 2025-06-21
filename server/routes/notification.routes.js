const express = require('express');
const {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  sendEmailNotification,
  sendSmsNotification
} = require('../controllers/notification.controller');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protected routes
router.use(protect);

// Routes for all authenticated users
router.get('/', getUserNotifications);
router.get('/unread/count', getUnreadCount);
router.put('/:id/read', markAsRead);
router.put('/read/all', markAllAsRead);
router.delete('/:id', deleteNotification);

// Admin only routes
router.post('/', authorize('admin'), createNotification);
router.post('/email', authorize('admin'), sendEmailNotification);
router.post('/sms', authorize('admin'), sendSmsNotification);

module.exports = router; 