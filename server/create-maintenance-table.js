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

// Create maintenance_requests table
const createMaintenanceRequestsTable = async () => {
  try {
    const connection = await createConnection();
    
    console.log('Creating maintenance_requests table...');
    
    // Check if table exists
    const [tables] = await connection.execute(
      `SELECT TABLE_NAME FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
      [process.env.DB_NAME || 'rent_management', 'maintenance_requests']
    );
    
    if (tables.length > 0) {
      console.log('maintenance_requests table already exists');
      await connection.end();
      return;
    }
    
    // Create table
    await connection.execute(`
      CREATE TABLE maintenance_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_id INT NOT NULL,
        property_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
        priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
        request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        completion_date DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
      )
    `);
    
    console.log('maintenance_requests table created successfully');
    
    // Create maintenance comments table
    const [commentTables] = await connection.execute(
      `SELECT TABLE_NAME FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
      [process.env.DB_NAME || 'rent_management', 'maintenance_comments']
    );
    
    if (commentTables.length === 0) {
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
    } else {
      console.log('maintenance_comments table already exists');
    }
    
    await connection.end();
  } catch (error) {
    console.error('Error creating maintenance_requests table:', error);
    process.exit(1);
  }
};

// Run the script
createMaintenanceRequestsTable(); 