const express = require('express');
const {
  register,
  login,
  getMe,
  logout,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
  updateProfile,
  uploadAvatar,
  checkAuthProvider,
  workosResetPassword,
  completeProfile
} = require('../controllers/auth.controller');

const { protect } = require('../middleware/auth');
const uploadMiddleware = require('../middleware/upload');
const avatarUpload = require('../middleware/avatar-upload');

const router = express.Router();

// Public routes
router.post('/register', uploadMiddleware.uploadRoleDocument.single('document'), register);
router.post('/login', login);
router.post('/email-login', login); // Alias for direct email login (without WorkOS)
router.post('/email-register', uploadMiddleware.uploadRoleDocument.single('document'), register); // Alias for direct email registration (without WorkOS)
router.post('/check-auth-provider', checkAuthProvider);
router.post('/workos-reset', workosResetPassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);
router.put('/details', protect, updateDetails);
router.put('/password', protect, updatePassword);
router.put('/profile', protect, updateProfile);
router.post('/avatar', protect, avatarUpload.single('avatar'), uploadAvatar);
router.post('/complete-profile', protect, completeProfile);

module.exports = router; 