/**
 * Environment Variables Template
 * 
 * Copy this file to .env in the server directory and fill in your values
 */

const envTemplate = `
# Server Configuration
NODE_ENV=development
PORT=5001

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=pass123
DB_NAME=rent_management

# JWT Configuration
JWT_SECRET=your-jwt-secret-key-change-in-production
JWT_EXPIRE=30d
REFRESH_TOKEN_SECRET=your-refresh-token-secret-key-change-in-production

# Cookie Configuration
COOKIE_EXPIRE=30

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
LOGIN_RATE_LIMIT_MAX=5

# Redis Configuration (for token management)
# REDIS_URL=redis://localhost:6379

# OAuth Configuration
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret
# FACEBOOK_APP_ID=your-facebook-app-id
# FACEBOOK_APP_SECRET=your-facebook-app-secret

# Frontend URL (for OAuth redirects)
FRONTEND_URL=http://localhost:3000

# M-Pesa API Configuration
MPESA_CONSUMER_KEY=your-mpesa-consumer-key
MPESA_CONSUMER_SECRET=your-mpesa-consumer-secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_CALLBACK_URL=https://your-domain.com/api/mpesa/callback
`;

console.log('Environment Variables Template:');
console.log(envTemplate);

console.log('\nTo use this template:');
console.log('1. Create a new file named .env in the server directory');
console.log('2. Copy the above template into the .env file');
console.log('3. Replace the placeholder values with your actual values');
console.log('4. Make sure to keep the .env file secure and never commit it to version control');

module.exports = envTemplate; 