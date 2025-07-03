/**
 * WorkOS Configuration
 * 
 * This file sets up the WorkOS client for authentication.
 * API keys should be set as environment variables.
 */

const { WorkOS } = require('@workos-inc/node');

// Initialize WorkOS with the API key
const apiKey = process.env.WORKOS_API_KEY || 'sk_test_REPLACE_WITH_YOUR_TEST_KEY'; 
console.log(`Initializing WorkOS with API key: ${apiKey.substring(0, 10)}...`);
const workos = new WorkOS(apiKey);

// Client ID for authentication
const clientId = process.env.WORKOS_CLIENT_ID || 'client_01JZ2V9H5Q15DKY49ESZSY96QK';

// Server port - make sure this matches the actual port the server runs on
const PORT = process.env.PORT || 5000;

// Redirect URI for callbacks
const redirectUri = process.env.NODE_ENV === 'production' 
  ? 'https://api.myapp.com/auth/callback'
  : `http://localhost:${PORT}/auth/callback`;

console.log(`WorkOS redirect URI set to: ${redirectUri}`);

module.exports = {
  workos,
  clientId,
  redirectUri
}; 