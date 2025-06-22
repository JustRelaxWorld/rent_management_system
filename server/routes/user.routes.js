const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getUsers, getUser, updateUser, deleteUser } = require('../controllers/user.controller');

// Get all users - allow both admin and landlord to access
router.get('/', protect, authorize('admin', 'landlord'), getUsers);

// Get single user
router.get('/:id', protect, getUser);

// Update user
router.put('/:id', protect, updateUser);

// Delete user - admin only
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router; 