const axios = require('axios');

// Generate a unique email
const uniqueEmail = `testapi${Date.now()}@example.com`;

// Test data
const testUser = {
  name: 'Test User API',
  email: uniqueEmail,
  phone: '1234567890',
  password: 'test123',
  role: 'tenant'
};

// Function to test registration
async function testRegistration() {
  try {
    console.log('Testing registration endpoint...');
    console.log('Request data:', testUser);
    
    const response = await axios.post('http://localhost:5001/api/auth/register', testUser, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000 // 5 second timeout
    });
    
    console.log('Registration successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Registration failed!');
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received (timeout or network error)');
    } else {
      console.error('Error:', error.message);
    }
    
    return null;
  }
}

// Run the test
testRegistration()
  .then(result => {
    if (result) {
      console.log('Test completed successfully');
    } else {
      console.log('Test failed');
    }
  })
  .catch(err => {
    console.error('Unexpected error:', err);
  }); 