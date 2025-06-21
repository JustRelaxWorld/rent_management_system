const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Import controllers
// Note: We'll need to create a user controller, but for now let's just set up the routes
// const { getUsers, getUser, updateUser, deleteUser } = require('../controllers/user.controller');

// Define routes
router.get('/', protect, authorize('admin'), (req, res) => {
  res.status(200).json({ success: true, message: 'Get all users' });
});

router.get('/:id', protect, (req, res) => {
  res.status(200).json({ success: true, message: `Get user with id ${req.params.id}` });
});

router.put('/:id', protect, (req, res) => {
  res.status(200).json({ success: true, message: `Update user with id ${req.params.id}` });
});

router.delete('/:id', protect, authorize('admin'), (req, res) => {
  res.status(200).json({ success: true, message: `Delete user with id ${req.params.id}` });
});

module.exports = router; 