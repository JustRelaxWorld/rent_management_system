const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// @desc    Upload user avatar
// @route   POST /api/users/avatar
// @access  Private
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.files || !req.files.avatar) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    const avatarFile = req.files.avatar;

    // Validate file type
    if (!avatarFile.mimetype.startsWith('image')) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file (jpeg, png, webp)'
      });
    }

    // Check file size (max 2MB)
    if (avatarFile.size > 2 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'Image size should be less than 2MB'
      });
    }

    // Create unique filename
    const fileName = `${Date.now()}_${avatarFile.name}`;
    const uploadPath = `uploads/avatars/${fileName}`;
    const fullPath = path.join(process.cwd(), '..', uploadPath);

    // Make sure directory exists
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Move file to upload directory
    await avatarFile.mv(fullPath);

    // Update user in database with avatar path
    await User.update(req.user.id, { avatar: uploadPath });

    // Get updated user
    const updatedUser = await User.findById(req.user.id);

    return res.status(200).json({
      success: true,
      data: {
        avatar: uploadPath
      },
      message: 'Avatar uploaded successfully',
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
    console.error('Avatar upload error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Avatar upload failed',
      error: error.message
    });
  }
};

// @desc    Get user avatar
// @route   GET /api/users/avatar
// @access  Private
exports.getAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (!user.avatar) {
      return res.status(404).json({
        success: false,
        message: 'No avatar found for this user'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: {
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Get avatar error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Could not retrieve avatar',
      error: error.message
    });
  }
};

// @desc    Delete user avatar
// @route   DELETE /api/users/avatar
// @access  Private
exports.deleteAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (!user.avatar) {
      return res.status(404).json({
        success: false,
        message: 'No avatar found for this user'
      });
    }
    
    // Get full path to the avatar file
    const avatarPath = path.join(process.cwd(), '..', user.avatar);
    
    // Delete the file from the filesystem
    if (fs.existsSync(avatarPath)) {
      fs.unlinkSync(avatarPath);
    }
    
    // Update user in database to remove avatar path
    await User.update(req.user.id, { avatar: null });
    
    return res.status(200).json({
      success: true,
      message: 'Avatar removed successfully'
    });
  } catch (error) {
    console.error('Delete avatar error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Could not delete avatar',
      error: error.message
    });
  }
}; 