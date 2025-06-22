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

// Add type column to maintenance_requests table if it doesn't exist
const addTypeColumn = async () => {
  try {
    const connection = await createConnection();
    
    console.log('Checking if type column exists in maintenance_requests table...');
    
    // Check if column exists
    const [columns] = await connection.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [process.env.DB_NAME || 'rent_management', 'maintenance_requests', 'type']
    );
    
    if (columns.length > 0) {
      console.log('type column already exists in maintenance_requests table');
      await connection.end();
      return;
    }
    
    // Add the column
    await connection.execute(`
      ALTER TABLE maintenance_requests
      ADD COLUMN type VARCHAR(50) NOT NULL DEFAULT 'other' AFTER description
    `);
    
    console.log('type column added to maintenance_requests table successfully');
    
    await connection.end();
  } catch (error) {
    console.error('Error adding type column to maintenance_requests table:', error);
    process.exit(1);
  }
};

// Run the script
addTypeColumn(); 