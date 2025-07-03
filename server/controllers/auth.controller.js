const User = require('../models/User');
const LandlordDetails = require('../models/LandlordDetails');
const TenantDetails = require('../models/TenantDetails');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Use the same JWT secret as in middleware/auth.js
const JWT_SECRET = 'rent-management-secret-key';
const JWT_EXPIRE = '30d';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    console.log('Register request received:');
    console.log('Body:', req.body);
    console.log('Files:', req.files);
    console.log('File:', req.file);
    
    const { name, email, phone, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      console.log('Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    // Check if user already exists with this email (regardless of auth method)
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      console.log('Email already registered:', email);
      return res.status(400).json({
        success: false,
        message: 'Email already registered. Please use a different email or login with your existing account.'
      });
    }

    // Also check if the email exists in WorkOS auth
    const [workosUsers] = await pool.execute(
      'SELECT * FROM users WHERE email = ? AND auth_provider IS NOT NULL',
      [email]
    );
    
    if (workosUsers && workosUsers.length > 0) {
      console.log('Email already registered with social auth:', email);
      return res.status(400).json({
        success: false,
        message: 'This email is already registered with Google or Apple. Please sign in with that method instead.'
      });
    }

    // Validate role
    const allowedRoles = ['tenant', 'landlord'];
    if (role && !allowedRoles.includes(role)) {
      console.log('Invalid role:', role);
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    // Validate role-specific required fields
    if (role === 'landlord') {
      // Only for landlords, phone will be used as mpesaNumber
      if (!phone) {
        return res.status(400).json({
          success: false,
          message: 'Phone number is required for landlords'
        });
      }
      
      // Check for ownership document using express-fileupload's structure
      if (!req.files || !req.files.ownershipDocument) {
        return res.status(400).json({
          success: false,
          message: 'Property ownership document is required for landlords'
        });
      }
    } else if (role === 'tenant') {
      // Only require National ID for tenants
      if (!req.body.idNumber) {
        return res.status(400).json({
          success: false,
          message: 'National ID number is required for tenants'
        });
      }
    }

    // Create user
    console.log('Creating user with data:', { name, email, phone, role: role || 'tenant' });
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: role || 'tenant',
      auth_provider: 'email' // Set auth provider to email for direct registrations
    });

    console.log('User created successfully:', user);

    // Create role-specific details
    try {
      if (role === 'landlord') {
        // Handle ownership document with express-fileupload
        let docPath = '';
        
        if (req.files && req.files.ownershipDocument) {
          const ownershipFile = req.files.ownershipDocument;
          const fileName = `${Date.now()}_${ownershipFile.name}`;
          const uploadPath = `uploads/landlord/${fileName}`;
          const fullPath = `${process.cwd()}/../${uploadPath}`;
          
          // Move the file
          await ownershipFile.mv(fullPath);
          docPath = uploadPath;
          console.log('Ownership document uploaded to:', docPath);
        }
          
        await LandlordDetails.create({
          user_id: user.id,
          mpesa_number: phone, // Use phone directly as mpesa_number
          ownership_document_path: docPath
        });
        console.log('Landlord details created successfully');
      } else if (role === 'tenant') {
        let leasePath = null;
        
        // Handle lease agreement if provided
        if (req.files && req.files.leaseAgreement) {
          const leaseFile = req.files.leaseAgreement;
          const fileName = `${Date.now()}_${leaseFile.name}`;
          const uploadPath = `uploads/tenant/${fileName}`;
          const fullPath = `${process.cwd()}/../${uploadPath}`;
          
          // Move the file
          await leaseFile.mv(fullPath);
          leasePath = uploadPath;
        }
          
        await TenantDetails.create({
          user_id: user.id,
          id_number: req.body.idNumber, // Use provided idNumber
          lease_agreement_path: leasePath
        });
        console.log('Tenant details created successfully');
      }
    } catch (detailsError) {
      console.error('Error creating role-specific details:', detailsError);
      // Consider whether to delete the user if details creation fails
    }

    // Generate token manually if method is missing
    if (typeof user.getSignedJwtToken !== 'function') {
      console.log('Using manual token generation');
      const token = jwt.sign(
        { id: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRE }
      );

      return res.status(201).json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }

    // Generate token using method
    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password'
      });
    }

    // Check for user
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Create token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        theme_preference: user.theme_preference
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        theme_preference: user.theme_preference
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully'
  });
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(
      key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    // Check if email is being updated and if it already exists
    if (fieldsToUpdate.email && fieldsToUpdate.email !== req.user.email) {
      const existingUser = await User.findByEmail(fieldsToUpdate.email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
    }

    const updated = await User.update(req.user.id, fieldsToUpdate);

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update user details'
      });
    }

    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Check current password
    const user = await User.findById(req.user.id);
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    const updated = await User.update(req.user.id, { password: newPassword });

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update password'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Check user authentication provider
// @route   POST /api/auth/check-auth-provider
// @access  Public
exports.checkAuthProvider = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if the user exists
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email'
      });
    }

    // Return the auth provider for this user
    return res.status(200).json({
      success: true,
      authProvider: user.auth_provider || 'email'
    });
  } catch (error) {
    console.error('Check auth provider error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Initiate WorkOS password reset
// @route   POST /api/auth/workos-reset
// @access  Public
exports.workosResetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if user exists
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email'
      });
    }

    // Check if user is authenticated with WorkOS
    if (user.auth_provider !== 'workos' && 
        user.auth_provider !== 'google' && 
        user.auth_provider !== 'apple') {
      return res.status(400).json({
        success: false,
        message: 'This account does not use social sign-in'
      });
    }

    // Import WorkOS configuration
    const { workos } = require('../auth/workos');

    // Create a password reset email
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/reset-password`;
    
    try {
      // Send password reset email via WorkOS
      await workos.passwordReset.createPasswordReset({
        email: email,
        returnUrl: resetUrl
      });

      return res.status(200).json({
        success: true,
        message: 'Password reset link has been sent to your email'
      });
    } catch (workosError) {
      console.error('WorkOS password reset error:', workosError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send password reset email',
        error: workosError.message
      });
    }
  } catch (error) {
    console.error('WorkOS reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Send verification code for password reset
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    // Check if user exists
    const user = await User.findByEmail(email);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email'
      });
    }
    
    // Generate a random 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    
    // Store the reset code in the database
    const updateQuery = `
      UPDATE users
      SET reset_code = ?, reset_expires = ?
      WHERE email = ?
    `;
    
    await pool.execute(updateQuery, [resetCode, resetExpires, email]);
    
    // Send email with reset code
    // In production, you would use nodemailer or a similar service
    console.log(`Reset code for ${email}: ${resetCode}`);
    
    res.status(200).json({
      success: true,
      message: 'Verification code has been sent to your email'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Verify reset code
// @route   POST /api/auth/verify-reset-code
// @access  Public
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email and code are required'
      });
    }
    
    // Check if code is valid
    const [rows] = await pool.execute(
      'SELECT reset_code, reset_expires FROM users WHERE email = ?',
      [email]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const { reset_code, reset_expires } = rows[0];
    
    if (!reset_code) {
      return res.status(400).json({
        success: false,
        message: 'No reset code found for this user'
      });
    }
    
    if (reset_expires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Reset code has expired'
      });
    }
    
    if (reset_code !== code) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset code'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Reset code verified successfully'
    });
  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, password } = req.body;
    
    if (!email || !code || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email, code and password are required'
      });
    }
    
    // Check if code is valid
    const [rows] = await pool.execute(
      'SELECT reset_code, reset_expires FROM users WHERE email = ?',
      [email]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const { reset_code, reset_expires } = rows[0];
    
    if (!reset_code) {
      return res.status(400).json({
        success: false,
        message: 'No reset code found for this user'
      });
    }
    
    if (reset_expires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Reset code has expired'
      });
    }
    
    if (reset_code !== code) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset code'
      });
    }
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Update the password and clear reset fields
    await pool.execute(
      'UPDATE users SET password = ?, reset_code = NULL, reset_expires = NULL WHERE email = ?',
      [hashedPassword, email]
    );
    
    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { phone, password, theme_preference } = req.body;
    
    const updateData = {};
    
    // Add fields to update object if they are provided
    if (phone) updateData.phone = phone;
    if (theme_preference) updateData.theme_preference = theme_preference;
    
    // If password is provided, hash it before storing
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    
    // Update user in database
    if (Object.keys(updateData).length > 0) {
      await User.update(userId, updateData);
    }
    
    // Get updated user data
    const updatedUser = await User.findById(userId);
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Return updated user data
    res.status(200).json({
      success: true,
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        theme_preference: updatedUser.theme_preference
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// @desc    Upload user avatar
// @route   POST /api/auth/avatar
// @access  Private
exports.uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an avatar image'
      });
    }
    
    // Get relative path for database storage
    const relativePath = `uploads/avatars/${req.file.filename}`;
    
    // Update user avatar in database
    await User.update(userId, { avatar: relativePath });
    
    // Get updated user data
    const updatedUser = await User.findById(userId);
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Return success with the new avatar path
    res.status(200).json({
      success: true,
      data: {
        avatar: relativePath
      },
      message: 'Avatar uploaded successfully'
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload avatar',
      error: error.message
    });
  }
};

// @desc    Complete user profile after registration
// @route   POST /api/auth/complete-profile
// @access  Private
exports.completeProfile = async (req, res) => {
  try {
    console.log('Complete profile request received');
    
    // Get user from middleware auth
    const userId = req.user.id;

    // Extract data from request
    const { phone, theme_preference } = req.body;
    const password = req.body.password || null;

    // Validate required fields
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Prepare update data
    const updateData = {
      phone,
      theme_preference: theme_preference || 'light'
    };

    // Add password if provided
    if (password) {
      updateData.password = password;
    }

    // Update user profile
    const updated = await User.update(userId, updateData);

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update user profile'
      });
    }

    // Handle avatar upload if file is included
    if (req.files && req.files.avatar) {
      const avatarFile = req.files.avatar;
      const fileName = `${Date.now()}_${avatarFile.name}`;
      const uploadPath = `uploads/avatars/${fileName}`;
      const fullPath = `${process.cwd()}/../${uploadPath}`;
      
      try {
        // Move the file to uploads directory
        await avatarFile.mv(fullPath);
        
        // Update user with avatar path
        await User.update(userId, { avatar: uploadPath });
        console.log('Avatar uploaded successfully:', uploadPath);
      } catch (uploadError) {
        console.error('Avatar upload failed:', uploadError);
        // We continue even if avatar upload fails
      }
    }

    // Get the updated user data to return
    const user = await User.findById(userId);

    // Generate fresh token with updated user data
    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );

    res.status(200).json({
      success: true,
      message: 'Profile completed successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        theme_preference: user.theme_preference
      }
    });
  } catch (error) {
    console.error('Complete profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  try {
    console.log('Generating token for user:', user);
    
    // Create token
    const token = user.getSignedJwtToken();
    console.log('Token generated successfully');
    
    const options = {
      expires: new Date(
        Date.now() + (process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000
      ),
      httpOnly: true
    };
    
    // Use secure flag in production
    if (process.env.NODE_ENV === 'production') {
      options.secure = true;
    }
    
    // Send response with token
    console.log('Sending response with token');
    res
      .status(statusCode)
      .cookie('token', token, options)
      .json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
  } catch (error) {
    console.error('Error in sendTokenResponse:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating token',
      error: error.message
    });
  }
}; 