const axios = require('axios');

// Test registration
async function testRegistration() {
  try {
    console.log('Testing registration endpoint...');
    
    const userData = {
      name: 'Test Client',
      email: 'testclient@example.com',
      phone: '1234567890',
      password: 'test123',
      role: 'tenant'
    };
    
    console.log('Sending registration request with data:', userData);
    
    const response = await axios.post('http://localhost:5001/api/auth/register', userData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Registration successful!');
    console.log('Response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Registration failed!');
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    
    return null;
  }
}

// Run the test
testRegistration(); 