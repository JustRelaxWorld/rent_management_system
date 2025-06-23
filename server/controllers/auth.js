const User = require('../models/User');
const LandlordDetails = require('../models/LandlordDetails');
const TenantDetails = require('../models/TenantDetails');
const { generateToken } = require('../middleware/auth');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    // Check if user already exists
    const userExists = await User.findByEmail(email);

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
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
    const user = new User({
      name,
      email,
      phone,
      password,
      role
    });
    
    const userId = await user.save();

    // Create role-specific details
    try {
      if (role === 'landlord') {
        const docPath = req.file ? req.file.path : 
          (req.files && req.files.ownershipDocument ? req.files.ownershipDocument[0].path : '');
          
        await LandlordDetails.create({
          user_id: userId,
          mpesa_number: req.body.mpesaNumber,
          ownership_document_path: docPath
        });
      } else if (role === 'tenant') {
        const leasePath = req.file ? req.file.path : 
          (req.files && req.files.leaseAgreement ? req.files.leaseAgreement[0].path : null);
          
        await TenantDetails.create({
          user_id: userId,
          id_number: req.body.idNumber,
          lease_agreement_path: leasePath
        });
      }
    } catch (detailsError) {
      console.error('Error creating role-specific details:', detailsError);
    }

    // Generate token
    const token = generateToken(userId);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
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
    const isMatch = await User.matchPassword(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user.id);

    res.status(200).json({
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
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 