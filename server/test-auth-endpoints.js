const axios = require('axios');

const API_URL = 'http://localhost:5001/api';
const TEST_USER = {
  name: 'Test User',
  email: 'testuser@example.com',
  password: 'password123',
  role: 'tenant'
};

async function testAuthEndpoints() {
  console.log('Testing Authentication Endpoints');
  console.log('===============================');
  
  let token = null;
  let userId = null;
  
  try {
    // Step 1: Test registration endpoint
    console.log('\n1. Testing Registration Endpoint');
    console.log('-------------------------------');
    console.log(`POST ${API_URL}/auth/register`);
    console.log('Request Body:', TEST_USER);
    
    try {
      const registerResponse = await axios.post(`${API_URL}/auth/register`, TEST_USER);
      
      console.log('Response Status:', registerResponse.status);
      console.log('Response Data:', JSON.stringify(registerResponse.data, null, 2));
      
      if (registerResponse.data.token) {
        console.log('✓ Registration successful - Token received');
        token = registerResponse.data.token;
        userId = registerResponse.data.user.id;
      } else {
        console.log('✗ Registration failed - No token received');
      }
    } catch (error) {
      if (error.response && error.response.data.message === 'Email already registered') {
        console.log('✓ User already exists (expected error for duplicate registration)');
      } else {
        console.error('✗ Registration error:', error.response ? error.response.data : error.message);
      }
    }
    
    // Step 2: Test login endpoint
    console.log('\n2. Testing Login Endpoint');
    console.log('------------------------');
    console.log(`POST ${API_URL}/auth/login`);
    console.log('Request Body:', { email: TEST_USER.email, password: TEST_USER.password });
    
    try {
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: TEST_USER.email,
        password: TEST_USER.password
      });
      
      console.log('Response Status:', loginResponse.status);
      console.log('Response Data:', JSON.stringify(loginResponse.data, null, 2));
      
      if (loginResponse.data.token) {
        console.log('✓ Login successful - Token received');
        token = loginResponse.data.token;
        userId = loginResponse.data.user.id;
        
        // Decode token to verify contents (without validation)
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
          console.log('Token payload:', payload);
          
          if (payload.id === userId) {
            console.log('✓ Token contains correct user ID');
          } else {
            console.log('✗ Token user ID mismatch');
          }
          
          const expiryDate = new Date(payload.exp * 1000);
          console.log(`Token expires at: ${expiryDate.toLocaleString()}`);
        }
      } else {
        console.log('✗ Login failed - No token received');
      }
    } catch (error) {
      console.error('✗ Login error:', error.response ? error.response.data : error.message);
    }
    
    // Step 3: Test protected endpoint with token
    if (token) {
      console.log('\n3. Testing Protected Endpoint');
      console.log('----------------------------');
      console.log(`GET ${API_URL}/auth/me`);
      console.log('Authorization: Bearer', token);
      
      try {
        const meResponse = await axios.get(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        console.log('Response Status:', meResponse.status);
        console.log('Response Data:', JSON.stringify(meResponse.data, null, 2));
        console.log('✓ Protected endpoint access successful');
      } catch (error) {
        console.error('✗ Protected endpoint error:', error.response ? error.response.data : error.message);
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testAuthEndpoints().catch(console.error); 