const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT Secret - hardcoded for simplicity as requested
const JWT_SECRET = 'rent-management-secret-key';
const JWT_EXPIRE = '30d';

// Protect routes
exports.protect = async (req, res, next) => {
  let token;
  console.log(`[AUTH] Protecting route: ${req.method} ${req.originalUrl}`);

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
    console.log('[AUTH] Token found in Authorization header');
  } 
  // Check if token exists in cookies
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
    console.log('[AUTH] Token found in cookies');
  }

  // Make sure token exists
  if (!token) {
    console.log('[AUTH] No token provided');
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token - IMPORTANT: Use the same secret as used for token generation
    // The User model uses process.env.JWT_SECRET || 'secret'
    // But generateToken function uses JWT_SECRET constant
    // We need to use the same secret for both
    console.log('[AUTH] Verifying token');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(`[AUTH] Token decoded, user ID: ${decoded.id}`);

    // Get user from the token
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      console.log(`[AUTH] User with ID ${decoded.id} not found in database`);
      return res.status(401).json({
        success: false,
        message: 'User no longer exists'
      });
    }

    console.log(`[AUTH] User authenticated: ID ${req.user.id}, Role: ${req.user.role}`);
    next();
  } catch (error) {
    console.error('[AUTH] JWT Verification error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    
    next();
  };
};

// Check if user is owner of resource
exports.checkOwnership = (resourceModel, resourceIdParam) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdParam];
      const resource = await resourceModel.findById(resourceId);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      // Check if user is admin (admins can access all resources)
      if (req.user.role === 'admin') {
        return next();
      }

      // Check if user is landlord and owns the property
      if (req.user.role === 'landlord' && resource.landlord_id === req.user.id) {
        return next();
      }

      // Check if user is tenant and is associated with the resource
      if (req.user.role === 'tenant' && resource.tenant_id === req.user.id) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this resource'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };
};

// Generate JWT Token
exports.generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE
  });
}; 