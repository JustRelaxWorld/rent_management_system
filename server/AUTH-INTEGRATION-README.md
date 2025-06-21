# Authentication Integration Guide

This guide provides instructions for integrating and testing the authentication system for the Rent Management System web app.

## Prerequisites

- Node.js installed
- MySQL 8.0 installed and running
- MySQL Workbench (for database management)

## Database Connection Details

- **Host:** localhost
- **Port:** 3306
- **User:** root
- **Password:** pass123
- **Database Name:** rent_management

## Authentication Integration Scripts

This directory contains several scripts to help you test and improve the authentication system:

### 1. Database Connection Test

The `test-db-connection.js` script tests the MySQL database connection using the provided credentials. It will:

- Check if the MySQL server is accessible
- Verify if the database exists (and create it if it doesn't)
- Check if the users table exists
- Display the users table structure

**Usage:**
```bash
node test-db-connection.js
```

### 2. Authentication Endpoints Test

The `test-auth-endpoints.js` script tests the backend authentication endpoints. It will:

- Test the registration endpoint (`POST /api/auth/register`)
- Test the login endpoint (`POST /api/auth/login`)
- Test a protected endpoint with the received token
- Verify token contents and expiration

**Usage:**
```bash
node test-auth-endpoints.js
```

### 3. Frontend Integration Test

The `test-frontend-integration.js` script simulates the frontend-backend integration. It will:

- Register test users with different roles (tenant and landlord)
- Test the login flow for different user roles
- Test role-based access control
- Simulate frontend token handling

**Usage:**
```bash
node test-frontend-integration.js
```

### 4. Authentication Improvements

The `auth-improvements.js` script provides recommendations for improving the authentication system. It includes:

- Security improvements
- Modularity improvements
- Scalability improvements

Each recommendation includes a description, sample implementation code, and priority level.

**Usage:**
```bash
node auth-improvements.js
```

### 5. Environment Variables Template

The `env-template.js` script provides a template for the environment variables needed for the authentication system.

**Usage:**
```bash
node env-template.js > .env
```

Then edit the `.env` file to replace placeholder values with your actual values.

### 6. Run All Tests

The `test-auth-integration.js` script runs all the test scripts in sequence.

**Usage:**
```bash
node test-auth-integration.js
```

## Authentication Flow

1. **Registration:**
   - User submits registration form with name, email, password, and role
   - Backend validates input and checks if email is already registered
   - If valid, backend creates a new user with a hashed password
   - Backend generates a JWT token and returns it with user data
   - Frontend stores the token in localStorage and redirects to the appropriate dashboard

2. **Login:**
   - User submits login form with email and password
   - Backend validates credentials
   - If valid, backend generates a JWT token and returns it with user data
   - Frontend stores the token in localStorage and redirects to the appropriate dashboard

3. **Protected Routes:**
   - Frontend includes the token in the Authorization header for API requests
   - Backend middleware verifies the token
   - Backend checks the user role for role-based access control
   - If authorized, backend allows access to the requested resource

## Security Considerations

- Passwords are hashed using bcrypt before storing in the database
- JWTs are used for stateless authentication
- Role-based access control is implemented for different user types
- Token expiration is set to 30 days by default

## Recommended Improvements

See the `auth-improvements.js` file for detailed recommendations on improving the authentication system, including:

- Using environment variables for sensitive information
- Implementing stronger password requirements
- Adding rate limiting for login attempts
- Using HTTP-only cookies instead of localStorage
- Adding CSRF protection
- Implementing refresh tokens
- Adding OAuth integration

## Troubleshooting

### Database Connection Issues

- Ensure MySQL server is running
- Verify the database credentials
- Check if the database exists
- Check if the users table exists with the correct structure

### Authentication Endpoint Issues

- Ensure the server is running
- Check the API routes and controllers
- Verify the JWT secret and expiration settings
- Check the error messages for specific issues

### Frontend Integration Issues

- Ensure the frontend is sending requests to the correct API endpoints
- Check that the token is being stored and retrieved correctly
- Verify that the token is included in the Authorization header
- Check that the user role is being used correctly for conditional rendering 