const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT Secret - in production this would be in an env variable
const JWT_SECRET = 'rent-management-secret-key';
const JWT_EXPIRE = '30d';

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  try {
    // Get token from header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Format: "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      // Get token from cookie as a fallback
      token = req.cookies.token;
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
        notAuthenticated: true
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Get user from the token
      const user = await User.findById(decoded.id);

      // Check if user exists
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found with this ID',
          notAuthenticated: true
        });
      }

      // Make the user info available for next middleware
      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid or has expired',
        notAuthenticated: true
      });
    }
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error in auth middleware',
      error: err.message
    });
  }
};

// Authorize specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return res.status(401).json({
          success: false,
          message: 'User information not available',
          notAuthenticated: true
        });
      }

      // Check if the user's role is included in the authorized roles
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `User role '${req.user.role}' is not authorized to access this route`
        });
      }

      next();
    } catch (err) {
      console.error('Authorize middleware error:', err);
      return res.status(500).json({
        success: false,
        message: 'Server error in authorization middleware',
        error: err.message
      });
    }
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