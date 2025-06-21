# Authentication Issues - Troubleshooting Guide

This guide addresses common authentication issues in the Rent Management System, specifically focusing on JWT token validation and API endpoint access.

## Issues Fixed

1. **JWT Secret Consistency**
   - Fixed inconsistent JWT secrets across different files
   - Now using the same JWT secret (`rent-management-secret-key`) in:
     - `middleware/auth.js`
     - `models/User.js`
     - `controllers/auth.controller.js`

2. **API Endpoint Base URL**
   - Updated `PrivateRoute.tsx` to use the API utility with the correct base URL
   - Changed from using direct axios calls to using the configured API utility

## How to Test the Fixes

1. **Test Authentication Flow**
   - Open `http://localhost:5001/public/test-auth.html` in your browser
   - This test page allows you to:
     - Register a new user
     - Login with existing credentials
     - Test the `/api/auth/me` endpoint
     - Examine and decode JWT tokens

2. **Run Diagnostic Script**
   ```bash
   node server/fix-auth-issues.js
   ```
   This script checks for JWT secret consistency and tests token verification.

3. **Test Authentication Endpoints**
   ```bash
   node server/test-auth-me.js
   ```
   This script tests the login and `/api/auth/me` endpoints with a valid token.

## Common Issues and Solutions

### 1. "Invalid Token" or "Not Authorized" Errors

**Possible causes:**
- JWT secret mismatch between token generation and verification
- Token expired or malformed
- Token not included in the Authorization header correctly

**Solutions:**
- Ensure JWT_SECRET is the same in all files (fixed)
- Check token expiration using the Token Tools in the test page
- Verify the token is being sent with the correct format: `Bearer <token>`

### 2. Login Works but Protected Routes Fail

**Possible causes:**
- API base URL mismatch (fixed)
- CORS issues
- Token not being included in requests

**Solutions:**
- Use the API utility with the correct base URL (fixed)
- Check browser console for CORS errors
- Verify that the token is being stored in localStorage and included in requests

### 3. Registration Works but Login Fails

**Possible causes:**
- Password hashing issues
- Case sensitivity in email addresses
- Database connection issues

**Solutions:**
- Verify passwords are being hashed correctly
- Ensure email addresses are case-sensitive and match exactly
- Check database connection and user table structure

## Additional Improvements

Consider implementing these improvements for better security:

1. **Environment Variables for Secrets**
   - Move JWT secret to environment variables
   - Create a `.env` file using the template in `env-template.js`

2. **HTTP-Only Cookies**
   - Store JWT in HTTP-only cookies instead of localStorage
   - Implement CSRF protection

3. **Refresh Tokens**
   - Implement refresh tokens for better security
   - Use shorter expiration times for access tokens

4. **Rate Limiting**
   - Add rate limiting for login attempts to prevent brute force attacks

## Need More Help?

If issues persist:

1. Check server logs for detailed error messages
2. Clear browser localStorage and try logging in again
3. Verify that the server is running on port 5001
4. Check that the database is accessible and the users table has the correct structure 