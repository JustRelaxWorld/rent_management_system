const mysql = require('mysql2/promise');
require('dotenv').config();

// Create database connection
const createConnection = async () => {
  return await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: 'pass123', // Use the same password as in db.js
    database: process.env.DB_NAME || 'rent_management'
  });
};

// Check if maintenance_comments table exists
const checkMaintenanceCommentsTable = async () => {
  try {
    const connection = await createConnection();
    
    console.log('Checking if maintenance_comments table exists...');
    
    // Check if table exists
    const [tables] = await connection.execute(
      `SELECT TABLE_NAME FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
      [process.env.DB_NAME || 'rent_management', 'maintenance_comments']
    );
    
    if (tables.length > 0) {
      console.log('maintenance_comments table exists');
    } else {
      console.log('maintenance_comments table does not exist, creating it now...');
      
      // Create table
      await connection.execute(`
        CREATE TABLE maintenance_comments (
          id INT AUTO_INCREMENT PRIMARY KEY,
          request_id INT NOT NULL,
          user_id INT NOT NULL,
          comment TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (request_id) REFERENCES maintenance_requests(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      
      console.log('maintenance_comments table created successfully');
    }
    
    await connection.end();
  } catch (error) {
    console.error('Error checking/creating maintenance_comments table:', error);
    process.exit(1);
  }
};

// Run the script
checkMaintenanceCommentsTable(); 