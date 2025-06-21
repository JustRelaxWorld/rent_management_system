const axios = require('axios');
const jwt = require('jsonwebtoken');

// Use the same JWT secret as in middleware/auth.js
const JWT_SECRET = 'rent-management-secret-key';
const JWT_EXPIRE = '30d';

const API_URL = 'http://localhost:5001/api';

// Test credentials
const TEST_USER = {
  email: 'testuser@example.com',
  password: 'password123'
};

async function testAuthMe() {
  console.log('Testing /api/auth/me endpoint');
  console.log('============================');
  
  try {
    // Step 1: Login to get a valid token
    console.log('\nStep 1: Login to get a valid token');
    console.log(`POST ${API_URL}/auth/login`);
    console.log('Request Body:', { email: TEST_USER.email, password: TEST_USER.password });
    
    const loginResponse = await axios.post(`${API_URL}/auth/login`, TEST_USER);
    
    console.log('Login Response Status:', loginResponse.status);
    console.log('Login Response Data:', JSON.stringify(loginResponse.data, null, 2));
    
    if (!loginResponse.data.token) {
      console.error('❌ No token received from login');
      return;
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Token received:', token.substring(0, 20) + '...');
    
    // Decode token to verify contents
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('✅ Token verified successfully');
      console.log('Token payload:', decoded);
    } catch (error) {
      console.error('❌ Token verification failed:', error.message);
      // Continue anyway to see what happens with the /me endpoint
    }
    
    // Step 2: Call /me endpoint with the token
    console.log('\nStep 2: Call /me endpoint with the token');
    console.log(`GET ${API_URL}/auth/me`);
    console.log('Authorization: Bearer', token.substring(0, 20) + '...');
    
    const meResponse = await axios.get(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Me Response Status:', meResponse.status);
    console.log('Me Response Data:', JSON.stringify(meResponse.data, null, 2));
    
    console.log('\n✅ /me endpoint test passed!');
    
  } catch (error) {
    console.error('\n❌ Test failed:');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`Status: ${error.response.status}`);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
  }
}

testAuthMe().catch(console.error); 