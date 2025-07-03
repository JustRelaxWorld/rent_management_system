const User = require('./models/User');
const { testConnection } = require('./config/db');

// Test user data
const userData = {
  name: 'Test User',
  email: 'test@example.com',
  phone: '1234567890',
  password: 'test123',
  role: 'tenant'
};

// Function to test registration
async function testRegister() {
  try {
    console.log('Testing database connection...');
    const connected = await testConnection();
    
    if (!connected) {
      console.error('Database connection failed');
      return;
    }
    
    console.log('Database connection successful');
    
    // Check if user already exists
    console.log('Checking if user already exists...');
    const existingUser = await User.findByEmail(userData.email);
    
    if (existingUser) {
      console.log('User already exists:', existingUser);
      return;
    }
    
    // Create user
    console.log('Creating user...');
    const user = await User.create(userData);
    
    console.log('User created successfully:', user);
  } catch (error) {
    console.error('Error during registration test:', error);
  }
}

// Run the test
testRegister(); 