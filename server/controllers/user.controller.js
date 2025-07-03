const User = require('../models/User');
const { pool } = require('../config/db');
const fs = require('fs');
const path = require('path');

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
        avatar: user.avatar,
        theme_preference: user.theme_preference,
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
    
    const { name, email, phone, role, theme_preference, id_number, ownership_document } = req.body;
    
    // Build update object
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (theme_preference) updateData.theme_preference = theme_preference;
    
    // Only admin can update role
    if (role && req.user.role === 'admin') {
      updateData.role = role;
    }
    
    // Check for immutable fields based on user role
    if (user.role === 'tenant') {
      // For tenants, id_number is immutable once set
      const tenantDetails = await pool.query(
        'SELECT * FROM tenant_details WHERE user_id = ?',
        [user.id]
      );
      
      if (tenantDetails.length > 0 && tenantDetails[0].id_number && id_number && id_number !== tenantDetails[0].id_number) {
        return res.status(400).json({
          success: false,
          message: 'National ID number cannot be changed once set'
        });
      }
    } else if (user.role === 'landlord') {
      // For landlords, ownership_document is immutable once set
      const landlordDetails = await pool.query(
        'SELECT * FROM landlord_details WHERE user_id = ?',
        [user.id]
      );
      
      if (landlordDetails.length > 0 && landlordDetails[0].ownership_document_path && ownership_document) {
        return res.status(400).json({
          success: false,
          message: 'Property ownership document cannot be changed once set'
        });
      }
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
        avatar: updatedUser.avatar,
        theme_preference: updatedUser.theme_preference,
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

// @desc    Upload avatar
// @route   POST /api/users/:id/avatar
// @access  Private (Admin or user themselves)
exports.uploadAvatar = async (req, res) => {
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
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an avatar image'
      });
    }
    
    // Delete previous avatar if it exists
    if (user.avatar) {
      const previousAvatarPath = path.join(__dirname, '..', user.avatar);
      if (fs.existsSync(previousAvatarPath)) {
        fs.unlinkSync(previousAvatarPath);
      }
    }
    
    // Update user with new avatar path
    const avatarPath = req.file.path.replace(/\\/g, '/'); // Normalize path for Windows
    
    const updated = await User.update(user.id, { avatar: avatarPath });
    
    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update avatar'
      });
    }
    
    // Get updated user
    const updatedUser = await User.findById(user.id);
    
    res.status(200).json({
      success: true,
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        avatar: updatedUser.avatar
      },
      message: 'Avatar uploaded successfully'
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
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

// @desc    Update user theme preference
// @route   POST /api/users/theme
// @access  Private
exports.updateThemePreference = async (req, res) => {
  try {
    const { theme_preference } = req.body;

    // Validate theme preference
    if (!theme_preference || !['light', 'dark'].includes(theme_preference)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid theme preference (light or dark)'
      });
    }

    // Update user's theme preference
    await User.update(req.user.id, { theme_preference });

    // Get updated user
    const updatedUser = await User.findById(req.user.id);

    return res.status(200).json({
      success: true,
      data: {
        theme_preference: updatedUser.theme_preference
      },
      message: 'Theme preference updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        theme_preference: updatedUser.theme_preference
      }
    });
  } catch (error) {
    console.error('Update theme preference error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Could not update theme preference',
      error: error.message
    });
  }
}; 