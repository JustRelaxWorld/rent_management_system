const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getUsers, getUser, updateUser, deleteUser, updateThemePreference } = require('../controllers/user.controller');
const { uploadAvatarMiddleware } = require('../middleware/avatar-upload');
const { uploadAvatar: uploadAvatarController, getAvatar, deleteAvatar } = require('../controllers/avatar.controller');

// User management routes - Admin only
router.get('/', protect, authorize('admin'), getUsers);

// User profile routes
router.get('/me', protect, getUser);
router.put('/me', protect, updateUser);
router.delete('/me', protect, deleteUser);

// Avatar routes
router.post('/avatar', protect, uploadAvatarMiddleware, uploadAvatarController);
router.get('/avatar', protect, getAvatar);
router.delete('/avatar', protect, deleteAvatar);

// Theme preference route
router.post('/theme', protect, updateThemePreference);

module.exports = router; 