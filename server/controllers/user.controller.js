const User = require('../models/User');
const { pool } = require('../config/db');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin, Landlord)
exports.getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    
    // If role is specified, filter by role
    if (role) {
      // Check if valid role
      const validRoles = ['tenant', 'landlord', 'admin'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role specified'
        });
      }
      
      // Get users by role
      const [rows] = await pool.execute(
        'SELECT id, name, email, phone, role, createdAt FROM users WHERE role = ?',
        [role]
      );
      
      return res.status(200).json({
        success: true,
        count: rows.length,
        data: rows
      });
    }
    
    // Otherwise, get all users
    const [rows] = await pool.execute(
      'SELECT id, name, email, phone, role, createdAt FROM users'
    );
    
    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // If user is not admin and not the user themselves, deny access
    if (req.user.role !== 'admin' && req.user.id !== user.id && req.user.role !== 'landlord') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this user'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin or user themselves)
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // If user is not admin and not the user themselves, deny access
    if (req.user.role !== 'admin' && req.user.id !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user'
      });
    }
    
    const { name, email, phone, role } = req.body;
    
    // Build update object
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    
    // Only admin can update role
    if (role && req.user.role === 'admin') {
      updateData.role = role;
    }
    
    // Update user
    const updated = await User.update(user.id, updateData);
    
    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update user'
      });
    }
    
    // Get updated user
    const updatedUser = await User.findById(user.id);
    
    res.status(200).json({
      success: true,
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Delete user
    const deleted = await User.delete(user.id);
    
    if (!deleted) {
      return res.status(400).json({
        success: false,
        message: 'Failed to delete user'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 