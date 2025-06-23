const User = require('../models/User');
const LandlordDetails = require('../models/LandlordDetails');
const TenantDetails = require('../models/TenantDetails');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      console.log('Email already registered:', email);
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
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
      if (!req.body.mpesaNumber) {
        return res.status(400).json({
          success: false,
          message: 'M-Pesa number is required for landlords'
        });
      }
      
      if (!req.file && (!req.files || !req.files.ownershipDocument)) {
        return res.status(400).json({
          success: false,
          message: 'Property ownership document is required for landlords'
        });
      }
    } else if (role === 'tenant') {
      if (!req.body.idNumber) {
        return res.status(400).json({
          success: false,
          message: 'ID number is required for tenants'
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
      role: role || 'tenant'
    });

    console.log('User created successfully:', user);

    // Create role-specific details
    try {
      if (role === 'landlord') {
        const docPath = req.file ? req.file.path : 
          (req.files && req.files.ownershipDocument ? req.files.ownershipDocument[0].path : '');
          
        await LandlordDetails.create({
          user_id: user.id,
          mpesa_number: req.body.mpesaNumber,
          ownership_document_path: docPath
        });
        console.log('Landlord details created successfully');
      } else if (role === 'tenant') {
        const leasePath = req.file ? req.file.path : 
          (req.files && req.files.leaseAgreement ? req.files.leaseAgreement[0].path : null);
          
        await TenantDetails.create({
          user_id: user.id,
          id_number: req.body.idNumber,
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

    // Generate token
    sendTokenResponse(user, 200, res);
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
    
    // Get role-specific details
    let roleDetails = null;
    if (user.role === 'landlord') {
      roleDetails = await LandlordDetails.findByUserId(user.id);
    } else if (user.role === 'tenant') {
      roleDetails = await TenantDetails.findByUserId(user.id);
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
        roleDetails
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