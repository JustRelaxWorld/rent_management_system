const express = require('express');
const { uploadAvatar, getAvatar, deleteAvatar } = require('../controllers/avatar.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Avatar routes
router.post('/', uploadAvatar);
router.get('/', getAvatar);
router.delete('/', deleteAvatar);

module.exports = router; 