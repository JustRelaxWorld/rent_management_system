const { pool } = require('./config/db');
const bcrypt = require('bcryptjs');

const createAdminUser = async () => {
  try {
    console.log('Creating admin user...');
    
    // Get connection
    const connection = await pool.getConnection();
    
    // Check if admin user already exists
    const [adminRows] = await connection.query(
      "SELECT * FROM users WHERE email = 'admin@rentmanagement.com'"
    );
    
    if (adminRows.length === 0) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      // Create admin user
      await connection.query(
        `INSERT INTO users (name, email, password, role) 
         VALUES (?, ?, ?, ?)`,
        ['Admin User', 'admin@rentmanagement.com', hashedPassword, 'admin']
      );
      
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
    
    // Release connection
    connection.release();
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    // Close pool
    await pool.end();
  }
};

// Run the function
createAdminUser(); 