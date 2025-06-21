const axios = require('axios');
const jwt = require('jsonwebtoken');

const API_URL = 'http://localhost:5001/api';

// Test user data
const TEST_TENANT = {
  name: 'Test Tenant',
  email: 'tenant@example.com',
  password: 'password123',
  role: 'tenant'
};

const TEST_LANDLORD = {
  name: 'Test Landlord',
  email: 'landlord@example.com',
  password: 'password123',
  role: 'landlord'
};

// Simulate frontend authentication flow
async function testFrontendIntegration() {
  console.log('Testing Frontend-Backend Integration');
  console.log('===================================');
  
  const tokens = {
    tenant: null,
    landlord: null
  };
  
  try {
    // Step 1: Register test users (tenant and landlord)
    console.log('\n1. Registering Test Users');
    console.log('-----------------------');
    
    // Register tenant
    try {
      console.log(`Registering tenant: ${TEST_TENANT.email}`);
      const tenantResponse = await axios.post(`${API_URL}/auth/register`, TEST_TENANT);
      
      if (tenantResponse.data.token) {
        console.log('✓ Tenant registration successful');
        tokens.tenant = tenantResponse.data.token;
        
        // Verify token structure
        const decodedTenant = jwt.decode(tokens.tenant);
        console.log('Tenant token payload:', decodedTenant);
      }
    } catch (error) {
      if (error.response && error.response.data.message === 'Email already registered') {
        console.log('✓ Tenant already exists, proceeding to login');
      } else {
        console.error('✗ Tenant registration error:', error.response ? error.response.data : error.message);
      }
    }
    
    // Register landlord
    try {
      console.log(`\nRegistering landlord: ${TEST_LANDLORD.email}`);
      const landlordResponse = await axios.post(`${API_URL}/auth/register`, TEST_LANDLORD);
      
      if (landlordResponse.data.token) {
        console.log('✓ Landlord registration successful');
        tokens.landlord = landlordResponse.data.token;
        
        // Verify token structure
        const decodedLandlord = jwt.decode(tokens.landlord);
        console.log('Landlord token payload:', decodedLandlord);
      }
    } catch (error) {
      if (error.response && error.response.data.message === 'Email already registered') {
        console.log('✓ Landlord already exists, proceeding to login');
      } else {
        console.error('✗ Landlord registration error:', error.response ? error.response.data : error.message);
      }
    }
    
    // Step 2: Login with test users
    console.log('\n2. Testing Login Flow');
    console.log('-------------------');
    
    // Login as tenant
    if (!tokens.tenant) {
      try {
        console.log(`Logging in as tenant: ${TEST_TENANT.email}`);
        const tenantLoginResponse = await axios.post(`${API_URL}/auth/login`, {
          email: TEST_TENANT.email,
          password: TEST_TENANT.password
        });
        
        if (tenantLoginResponse.data.token) {
          console.log('✓ Tenant login successful');
          tokens.tenant = tenantLoginResponse.data.token;
          
          // Verify token and user data
          console.log('Token received:', tokens.tenant.substring(0, 20) + '...');
          console.log('User data:', tenantLoginResponse.data.user);
          
          // Verify role
          if (tenantLoginResponse.data.user.role === 'tenant') {
            console.log('✓ User role correctly identified as tenant');
          } else {
            console.log(`✗ User role mismatch: expected 'tenant', got '${tenantLoginResponse.data.user.role}'`);
          }
        } else {
          console.log('✗ Tenant login failed - No token received');
        }
      } catch (error) {
        console.error('✗ Tenant login error:', error.response ? error.response.data : error.message);
      }
    }
    
    // Login as landlord
    if (!tokens.landlord) {
      try {
        console.log(`\nLogging in as landlord: ${TEST_LANDLORD.email}`);
        const landlordLoginResponse = await axios.post(`${API_URL}/auth/login`, {
          email: TEST_LANDLORD.email,
          password: TEST_LANDLORD.password
        });
        
        if (landlordLoginResponse.data.token) {
          console.log('✓ Landlord login successful');
          tokens.landlord = landlordLoginResponse.data.token;
          
          // Verify token and user data
          console.log('Token received:', tokens.landlord.substring(0, 20) + '...');
          console.log('User data:', landlordLoginResponse.data.user);
          
          // Verify role
          if (landlordLoginResponse.data.user.role === 'landlord') {
            console.log('✓ User role correctly identified as landlord');
          } else {
            console.log(`✗ User role mismatch: expected 'landlord', got '${landlordLoginResponse.data.user.role}'`);
          }
        } else {
          console.log('✗ Landlord login failed - No token received');
        }
      } catch (error) {
        console.error('✗ Landlord login error:', error.response ? error.response.data : error.message);
      }
    }
    
    // Step 3: Test protected routes with different roles
    console.log('\n3. Testing Role-Based Access Control');
    console.log('---------------------------------');
    
    // Test tenant access
    if (tokens.tenant) {
      console.log('\nTesting tenant access to protected routes:');
      
      try {
        const tenantMeResponse = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${tokens.tenant}` }
        });
        
        console.log('✓ Tenant can access their profile data');
        console.log('Profile data:', tenantMeResponse.data);
      } catch (error) {
        console.error('✗ Tenant profile access error:', error.response ? error.response.data : error.message);
      }
    }
    
    // Test landlord access
    if (tokens.landlord) {
      console.log('\nTesting landlord access to protected routes:');
      
      try {
        const landlordMeResponse = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${tokens.landlord}` }
        });
        
        console.log('✓ Landlord can access their profile data');
        console.log('Profile data:', landlordMeResponse.data);
      } catch (error) {
        console.error('✗ Landlord profile access error:', error.response ? error.response.data : error.message);
      }
    }
    
    // Step 4: Verify frontend token handling simulation
    console.log('\n4. Simulating Frontend Token Handling');
    console.log('----------------------------------');
    
    // Simulate storing token in localStorage
    console.log('localStorage.setItem("token", [JWT Token])');
    console.log('localStorage.setItem("user", [User Object])');
    
    // Simulate token expiration check
    if (tokens.tenant) {
      const decodedToken = jwt.decode(tokens.tenant);
      const expiryDate = new Date(decodedToken.exp * 1000);
      const now = new Date();
      const timeRemaining = Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24)); // days
      
      console.log(`\nToken expiration check: expires in ${timeRemaining} days (${expiryDate.toLocaleString()})`);
      console.log(`isTokenExpired: ${decodedToken.exp < Math.floor(Date.now() / 1000)}`);
    }
    
    console.log('\nFrontend Integration Test Complete');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testFrontendIntegration().catch(console.error); 