/**
 * WorkOS Authentication Routes
 * 
 * This file defines routes for authentication via WorkOS,
 * including Google, Apple, and Email authentication.
 */

const express = require('express');
const { workos, clientId, redirectUri } = require('../auth/workos');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const { pool } = require('../config/db');

const router = express.Router();

// JWT Secret from auth middleware
const JWT_SECRET = 'rent-management-secret-key';
const JWT_EXPIRE = '30d';

// Client URL for redirects
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

/**
 * Helper function to generate authorization URL
 */
const getAuthorizationUrl = (provider) => {
  return workos.sso.getAuthorizationUrl({
    clientId,
    provider,
    redirectUri,
    // Store the provider in state to retrieve it in the callback
    state: JSON.stringify({ provider }),
  });
};

/**
 * Generic login endpoint that accepts provider as query param
 */
router.get('/login', (req, res) => {
  try {
    const { provider } = req.query;
    if (!provider) {
      return res.status(400).json({
        success: false,
        message: 'Provider parameter is required'
      });
    }

    let authProvider;
    switch(provider.toLowerCase()) {
      case 'google':
        authProvider = 'GoogleOAuth';
        break;
      case 'apple':
        authProvider = 'AppleOAuth';
        break;
      case 'email':
        authProvider = 'MagicLink';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid provider. Use google, apple, or email.'
        });
    }

    console.log(`Starting ${provider} OAuth redirect flow...`);
    const authorizationURL = getAuthorizationUrl(authProvider);
    console.log('Redirecting to:', authorizationURL);
    res.redirect(authorizationURL);
  } catch (error) {
    console.error('Auth redirect error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
});

/**
 * Google authentication redirect
 */
router.get('/google/redirect', (req, res) => {
  try {
    console.log('Starting Google OAuth redirect flow...');
    const authorizationURL = getAuthorizationUrl('GoogleOAuth');
    console.log('Redirecting to:', authorizationURL);
    res.redirect(authorizationURL);
  } catch (error) {
    console.error('Google auth redirect error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
});

/**
 * Apple authentication redirect
 */
router.get('/apple/redirect', (req, res) => {
  try {
    const authorizationURL = getAuthorizationUrl('AppleOAuth');
    res.redirect(authorizationURL);
  } catch (error) {
    console.error('Apple auth redirect error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
});

/**
 * Email authentication redirect
 */
router.get('/email/redirect', (req, res) => {
  try {
    const authorizationURL = getAuthorizationUrl('MagicLink');
    res.redirect(authorizationURL);
  } catch (error) {
    console.error('Email auth redirect error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
});

/**
 * Handle the OAuth callback from WorkOS
 */
router.get('/callback', async (req, res) => {
  try {
    console.log('Received callback from WorkOS');
    console.log('Query parameters:', req.query);
    
    const { code } = req.query;
    
    if (!code) {
      console.error('Missing authorization code in callback');
      return res.status(400).send('Missing authorization code');
    }
    
    // Log the code (but mask it for security)
    const maskedCode = code.substring(0, 4) + '...' + code.substring(code.length - 4);
    console.log(`Received code: ${maskedCode}`);
    console.log(`Using clientId: ${clientId}`);
    
    try {
      // Exchange the authorization code for a profile
      console.log('Attempting to authenticate with code...');
      const profileResponse = await workos.userManagement.authenticateWithCode({
        code,
        clientId
      });
      
      console.log('Auth response structure:', Object.keys(profileResponse));
      
      // Check if the user property exists in the response
      if (!profileResponse.user) {
        console.error('User property not found in WorkOS response. Full response:', profileResponse);
        
        // Try to extract profile from different property if user is not available
        const workosUser = profileResponse.profile || profileResponse.user;
        
        if (!workosUser) {
          return res.status(400).send('Invalid user data received from authentication provider');
        }
      }
      
      // Extract user from response - try user first, fallback to profile
      const workosUser = profileResponse.user || profileResponse.profile;
      
      console.log('Received profile from WorkOS:', JSON.stringify(workosUser, null, 2));
      
      if (!workosUser.email) {
        console.error('Email missing from profile:', workosUser);
        return res.status(400).send('Invalid profile data received from authentication provider: missing email');
      }
      
      // Check if the user already exists with this email
      let user = await User.findByEmail(workosUser.email);
      let isNewUser = false;
      
      if (user) {
        // If user exists but with email auth, inform them they need to use that method
        if (user.auth_provider === 'email' && workosUser.provider_type !== 'email') {
          console.log('User already exists with email authentication:', workosUser.email);
          return res.redirect(`${CLIENT_URL}/login?error=email_exists&message=This email is already registered with a password. Please sign in with email and password instead.`);
        }
        
        // User exists with social auth, update their profile if needed
        console.log('User already exists, updating profile:', user.id);
        
        // Update user data if needed
        const updateData = {};
        if (workosUser.first_name && workosUser.last_name && (!user.name || user.name === workosUser.email)) {
          const fullName = `${workosUser.first_name} ${workosUser.last_name}`.trim();
          updateData.name = fullName;
        }

        // Update auth provider details
        updateData.auth_provider = workosUser.provider_type || 'workos';
        updateData.auth_provider_id = workosUser.id;
        
        // Update the user
        if (Object.keys(updateData).length > 0) {
          console.log('Updating user with data:', updateData);
          await User.update(user.id, updateData);
          // Refresh user data
          user = await User.findById(user.id);
          console.log('User updated, new user data:', user);
        }
      } else {
        // User doesn't exist, create a new user
        isNewUser = true;
        console.log('Creating new user from WorkOS profile');
        
        // Generate a random password for the user (they'll never use it)
        const password = crypto.randomBytes(20).toString('hex');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Create the user with data from the profile
        const newUser = await User.create({
          name: workosUser.first_name && workosUser.last_name 
            ? `${workosUser.first_name} ${workosUser.last_name}`.trim()
            : workosUser.email.split('@')[0], // Use part of email as name if no name provided
          email: workosUser.email,
          password: hashedPassword,
          role: 'tenant', // Default role for new users
          auth_provider: workosUser.provider_type || 'workos',
          auth_provider_id: workosUser.id
        });
        
        // Get the created user
        user = await User.findById(newUser.id);
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          role: user.role,
          authProvider: workosUser.provider_type || 'workos' 
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRE }
      );

      // Determine the right redirect URL based on user role and whether they need to complete their profile
      const isProfileIncomplete = isNewUser && !user.is_profile_complete;
      let redirectUrl;

      if (isProfileIncomplete) {
        // If profile is incomplete, redirect to profile completion page
        redirectUrl = `${CLIENT_URL}/complete-profile?token=${token}`;
      } else {
        // If profile is complete, redirect directly to the appropriate dashboard
        if (user.role === 'tenant') {
          redirectUrl = `${CLIENT_URL}/tenant/dashboard?token=${token}`;
        } else if (user.role === 'landlord') {
          redirectUrl = `${CLIENT_URL}/landlord/dashboard?token=${token}`;
        } else if (user.role === 'admin') {
          redirectUrl = `${CLIENT_URL}/admin/dashboard?token=${token}`;
        } else {
          redirectUrl = `${CLIENT_URL}/?token=${token}`; // Fallback
        }
      }
      
      console.log(`Redirecting to ${isProfileIncomplete ? 'complete profile' : 'dashboard'}: ${redirectUrl}`);
      return res.redirect(redirectUrl);
      
    } catch (authError) {
      console.error('Authentication error:', authError);
      return res.redirect(`${CLIENT_URL}/login?error=auth_failed&message=${encodeURIComponent(authError.message || 'Authentication failed')}`);
    }
  } catch (error) {
    console.error('Callback error:', error);
    return res.redirect(`${CLIENT_URL}/login?error=server_error&message=${encodeURIComponent(error.message || 'Server error')}`);
  }
});

/**
 * Complete registration with phone number
 */
router.post('/complete-registration', async (req, res) => {
  try {
    const { email, phone } = req.body;
    
    if (!email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Email and phone are required'
      });
    }
    
    // Find user by email
    const user = await User.findByEmail(email);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update user with phone number
    await User.update(user.id, { phone });
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );
    
    // Determine the appropriate dashboard URL based on role
    let dashboardUrl = 'http://localhost:3000/dashboard';
    if (user.role === 'landlord') {
      dashboardUrl = 'http://localhost:3000/landlord/dashboard';
    } else if (user.role === 'tenant') {
      dashboardUrl = 'http://localhost:3000/tenant/dashboard';
    } else if (user.role === 'admin') {
      dashboardUrl = 'http://localhost:3000/admin/dashboard';
    }
    
    res.status(200).json({
      success: true,
      message: 'Registration completed successfully',
      token,
      redirectUrl: dashboardUrl
    });
    
  } catch (error) {
    console.error('Complete registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration error',
      error: error.message
    });
  }
});

/**
 * Complete profile setup for WorkOS users
 */
router.post('/complete-profile', async (req, res) => {
  try {
    console.log('Complete profile request received from WorkOS flow');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Files:', req.files ? Object.keys(req.files) : 'No files');
    
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    console.log('Authorization header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token is required'
      });
    }
    
    const token = authHeader.split(' ')[1];
    console.log('Token extracted, verifying...');
    
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log('Token verified, decoded data:', decoded);
    } catch (err) {
      console.error('Token verification failed:', err);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    
    // Get user by ID from token
    const userId = decoded.id;
    console.log('Looking up user with ID:', userId);
    
    const user = await User.findById(userId);
    
    if (!user) {
      console.error('User not found with ID:', userId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log('User found:', user.id, user.email);
    
    // Update user with form data
    const updateData = {
      name: req.body.name || user.name,
      phone: req.body.phone || user.phone,
      role: req.body.role || user.role || 'tenant',  // Default to tenant if no role specified
      theme_preference: req.body.theme_preference || user.theme_preference || 'light'
    };
    
    console.log('Updating user with data:', updateData);
    
    // Update password if provided
    if (req.body.password) {
      console.log('Password provided, hashing...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      updateData.password = hashedPassword;
    }
    
    // Handle avatar upload if file is present
    if (req.files && req.files.avatar) {
      console.log('Avatar file found, uploading...');
      const avatarFile = req.files.avatar;
      const fileName = `${Date.now()}_${avatarFile.name}`;
      const uploadPath = `uploads/avatars/${fileName}`;
      const fullPath = path.join(process.cwd(), '..', uploadPath);
      
      // Create directory if it doesn't exist
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        console.log('Creating directory:', dir);
        fs.mkdirSync(dir, { recursive: true });
      }
      
      try {
        await avatarFile.mv(fullPath);
        console.log('Avatar file moved to:', fullPath);
        updateData.avatar = uploadPath;
      } catch (fileError) {
        console.error('Error uploading avatar file:', fileError);
        // Continue even if avatar upload fails
      }
    }
    
    // Handle role-specific data
    if (req.body.role === 'tenant') {
      console.log('Processing tenant-specific data');
      const idNumber = req.body.idNumber;
      
      if (!idNumber) {
        return res.status(400).json({
          success: false,
          message: 'National ID number is required for tenant registration'
        });
      }
      
      console.log('Updating tenant details with ID number:', idNumber);
      
      // Check if tenant details already exist
      const [existingTenant] = await pool.query(
        'SELECT * FROM tenant_details WHERE user_id = ?',
        [userId]
      );
      
      if (existingTenant && existingTenant.length > 0) {
        // Update existing tenant details
        await pool.query(
          'UPDATE tenant_details SET id_number = ? WHERE user_id = ?',
          [idNumber, userId]
        );
      } else {
        // Create new tenant details
        await pool.query(
          'INSERT INTO tenant_details (user_id, id_number) VALUES (?, ?)',
          [userId, idNumber]
        );
      }
      
      console.log('Tenant details updated successfully');
    } else if (req.body.role === 'landlord') {
      console.log('Processing landlord-specific data');
      
      // Check for ownership document
      if (!req.files || !req.files.ownershipDocument) {
        return res.status(400).json({
          success: false,
          message: 'Property ownership document is required for landlord registration'
        });
      }
      
      console.log('Ownership document found, uploading...');
      const ownershipFile = req.files.ownershipDocument;
      const fileName = `${Date.now()}_${ownershipFile.name}`;
      const uploadPath = `uploads/landlord/${fileName}`;
      const fullPath = path.join(process.cwd(), '..', uploadPath);
      
      // Create directory if it doesn't exist
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        console.log('Creating landlord directory:', dir);
        fs.mkdirSync(dir, { recursive: true });
      }
      
      try {
        await ownershipFile.mv(fullPath);
        console.log('Ownership document moved to:', fullPath);
        
        // Check if landlord details already exist
        const [existingLandlord] = await pool.query(
          'SELECT * FROM landlord_details WHERE user_id = ?',
          [userId]
        );
        
        if (existingLandlord && existingLandlord.length > 0) {
          // Update existing landlord details
          await pool.query(
            'UPDATE landlord_details SET ownership_document_path = ?, mpesa_number = ? WHERE user_id = ?',
            [uploadPath, req.body.phone || user.phone, userId]
          );
        } else {
          // Create new landlord details
          await pool.query(
            'INSERT INTO landlord_details (user_id, ownership_document_path, mpesa_number) VALUES (?, ?, ?)',
            [userId, uploadPath, req.body.phone || user.phone]
          );
        }
        
        console.log('Landlord details updated successfully');
      } catch (fileError) {
        console.error('Error uploading ownership document:', fileError);
        return res.status(500).json({
          success: false,
          message: 'Error uploading ownership document'
        });
      }
    }
    
    // Update user in database
    console.log('Updating user in database...');
    await User.update(userId, updateData);
    
    // Generate a new token with updated user info
    const updatedUser = await User.findById(userId);
    console.log('User updated, new user data:', updatedUser);
    
    const newToken = updatedUser.getSignedJwtToken();
    console.log('New token generated');
    
    // Determine the redirect URL based on user role
    let redirectUrl = '/dashboard'; // Default dashboard
    if (updatedUser.role === 'tenant') {
      redirectUrl = '/tenant/dashboard';
    } else if (updatedUser.role === 'landlord') {
      redirectUrl = '/landlord/dashboard';
    } else if (updatedUser.role === 'admin') {
      redirectUrl = '/admin/dashboard';
    }
    
    console.log('Sending success response with redirect to:', redirectUrl);
    return res.status(200).json({
      success: true,
      message: 'Profile completed successfully',
      token: newToken,
      redirectUrl: redirectUrl,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        theme_preference: updatedUser.theme_preference
      }
    });
  } catch (error) {
    console.error('Complete profile error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
});

module.exports = router; 