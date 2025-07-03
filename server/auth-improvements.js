/**
 * Rent Management System - Authentication System Improvements
 * 
 * This file contains recommendations for improving the authentication system
 * based on industry best practices for security, modularity, and scalability.
 */

const authImprovements = {
  securityImprovements: [
    {
      title: "Environment Variables for Secrets",
      description: "Move JWT secret and other sensitive information to environment variables",
      implementation: `
// Use dotenv for environment variables
require('dotenv').config();

// Use environment variables for sensitive data
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';

// Never hardcode secrets in the codebase
// BAD: const JWT_SECRET = 'rent-management-secret-key';
`,
      priority: "High"
    },
    {
      title: "Password Strength Requirements",
      description: "Implement stronger password requirements",
      implementation: `
// Add password validation middleware
const validatePassword = (req, res, next) => {
  const { password } = req.body;
  
  // Password must be at least 8 characters
  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters'
    });
  }
  
  // Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      success: false,
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    });
  }
  
  next();
};

// Use in routes
router.post('/register', validatePassword, register);
`,
      priority: "Medium"
    },
    {
      title: "Rate Limiting for Login Attempts",
      description: "Implement rate limiting to prevent brute force attacks",
      implementation: `
const rateLimit = require('express-rate-limit');

// Create rate limiter for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes'
  }
});

// Apply to login route
router.post('/login', loginLimiter, login);
`,
      priority: "High"
    },
    {
      title: "Secure Cookie Options for JWT",
      description: "Store JWT in HTTP-only cookies instead of localStorage for better security",
      implementation: `
// In auth controller:
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  
  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true, // cookie cannot be accessed by client-side JS
    secure: process.env.NODE_ENV === 'production', // only sent over HTTPS in production
    sameSite: 'strict' // protection against CSRF
  };
  
  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
};

// In server.js:
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// In middleware/auth.js:
// Check for token in cookies first, then headers
if (req.cookies.token) {
  token = req.cookies.token;
} else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
  token = req.headers.authorization.split(' ')[1];
}
`,
      priority: "High"
    },
    {
      title: "CSRF Protection",
      description: "Add CSRF protection for form submissions",
      implementation: `
const csrf = require('csurf');

// Initialize CSRF protection
const csrfProtection = csrf({ cookie: true });

// Apply to routes that handle form submissions
router.post('/login', csrfProtection, login);
router.post('/register', csrfProtection, register);

// In frontend forms, include CSRF token
// Example with React:
// <input type="hidden" name="_csrf" value={csrfToken} />
`,
      priority: "Medium"
    }
  ],
  
  modularityImprovements: [
    {
      title: "Authentication Service Layer",
      description: "Create a dedicated authentication service layer",
      implementation: `
// services/auth.service.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');

class AuthService {
  async register(userData) {
    // Check if user exists
    const existingUser = await User.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }
    
    // Create user
    const user = await User.create(userData);
    return user;
  }
  
  async login(email, password) {
    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }
    
    return user;
  }
  
  generateToken(user) {
    return user.getSignedJwtToken();
  }
}

module.exports = new AuthService();

// In controller:
const authService = require('../services/auth.service');

exports.register = async (req, res) => {
  try {
    const user = await authService.register(req.body);
    const token = authService.generateToken(user);
    
    // Send response
    res.status(201).json({
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
    // Handle errors
  }
};
`,
      priority: "Medium"
    },
    {
      title: "Error Handling Middleware",
      description: "Create centralized error handling middleware",
      implementation: `
// middleware/error.js
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  
  // Log error for debugging
  console.error(err);
  
  // Handle specific errors
  if (err.code === 'ER_DUP_ENTRY') {
    error.message = 'Duplicate field value entered';
    error.statusCode = 400;
  }
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    error.message = messages.join(', ');
    error.statusCode = 400;
  }
  
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error'
  });
};

// In server.js:
app.use(errorHandler);
`,
      priority: "Medium"
    },
    {
      title: "Authentication Response Helper",
      description: "Create a helper function for consistent authentication responses",
      implementation: `
// utils/auth-response.js
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  
  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };
  
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
};

module.exports = sendTokenResponse;
`,
      priority: "Low"
    }
  ],
  
  scalabilityImprovements: [
    {
      title: "Redis for Token Storage and Blacklisting",
      description: "Use Redis to store and manage JWT tokens for logout functionality",
      implementation: `
// Install Redis: npm install redis
const redis = require('redis');
const { promisify } = require('util');

// Create Redis client
const redisClient = redis.createClient(process.env.REDIS_URL);
const setAsync = promisify(redisClient.set).bind(redisClient);
const getAsync = promisify(redisClient.get).bind(redisClient);
const delAsync = promisify(redisClient.del).bind(redisClient);

// Store token in Redis with user ID as key
const storeToken = async (userId, token, expiry) => {
  await setAsync(
    \`auth_\${userId}\`,
    token,
    'EX',
    expiry
  );
};

// Blacklist token on logout
const blacklistToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const userId = decoded.id;
  
  // Remove token from Redis
  await delAsync(\`auth_\${userId}\`);
  
  // Add to blacklist with token as key
  await setAsync(
    \`blacklist_\${token}\`,
    'true',
    'EX',
    24 * 60 * 60 // 24 hours
  );
};

// Check if token is blacklisted in auth middleware
const isTokenBlacklisted = async (token) => {
  const blacklisted = await getAsync(\`blacklist_\${token}\`);
  return blacklisted === 'true';
};

// In auth middleware:
if (await isTokenBlacklisted(token)) {
  return res.status(401).json({
    success: false,
    message: 'Token is no longer valid'
  });
}
`,
      priority: "Medium"
    },
    {
      title: "Refresh Token Implementation",
      description: "Implement refresh tokens for better security and user experience",
      implementation: `
// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
};

// Login response with both tokens
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken(); // Access token with shorter expiry
  const refreshToken = generateRefreshToken(user.id); // Refresh token with longer expiry
  
  // Store refresh token in database or Redis
  storeRefreshToken(user.id, refreshToken);
  
  // Send both tokens
  res.status(statusCode).json({
    success: true,
    token, // Short-lived access token
    refreshToken, // Long-lived refresh token
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};

// Refresh token endpoint
router.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token is required'
    });
  }
  
  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    // Check if refresh token is valid in database/Redis
    const isValidRefreshToken = await validateRefreshToken(decoded.id, refreshToken);
    
    if (!isValidRefreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
    
    // Generate new access token
    const newAccessToken = jwt.sign(
      { id: decoded.id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    res.status(200).json({
      success: true,
      token: newAccessToken
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});
`,
      priority: "High"
    },
    {
      title: "OAuth Integration",
      description: "Add support for OAuth providers (Google, Facebook, etc.)",
      implementation: `
// Install passport: npm install passport passport-google-oauth20
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Configure Passport
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user exists
    let user = await User.findByEmail(profile.emails[0].value);
    
    if (!user) {
      // Create new user
      user = await User.create({
        name: profile.displayName,
        email: profile.emails[0].value,
        password: crypto.randomBytes(20).toString('hex'), // Random password
        role: 'tenant', // Default role
        googleId: profile.id
      });
    } else {
      // Update Google ID if not present
      if (!user.googleId) {
        await User.update(user.id, { googleId: profile.id });
      }
    }
    
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

// OAuth routes
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    // Generate JWT token
    const token = req.user.getSignedJwtToken();
    
    // Redirect to frontend with token
    res.redirect(\`\${process.env.FRONTEND_URL}/oauth-callback?token=\${token}\`);
  }
);
`,
      priority: "Low"
    }
  ]
};

// Export the improvements
module.exports = authImprovements;

// Log summary of improvements
console.log('Authentication System Improvement Recommendations:');
console.log('================================================');

console.log('\nSecurity Improvements:');
authImprovements.securityImprovements.forEach(improvement => {
  console.log(`- ${improvement.title} (Priority: ${improvement.priority})`);
});

console.log('\nModularity Improvements:');
authImprovements.modularityImprovements.forEach(improvement => {
  console.log(`- ${improvement.title} (Priority: ${improvement.priority})`);
});

console.log('\nScalability Improvements:');
authImprovements.scalabilityImprovements.forEach(improvement => {
  console.log(`- ${improvement.title} (Priority: ${improvement.priority})`);
});