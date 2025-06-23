const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const createPaymentsTable = async () => {
  try {
    // Create database connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: 'pass123', // Use the hardcoded password from db.js
      database: process.env.DB_NAME || 'rent_management'
    });
    
    console.log('Connected to database');

    // Create payments table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        invoice_id INT,
        phone VARCHAR(20) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        reference VARCHAR(100) NOT NULL,
        checkout_request_id VARCHAR(100),
        merchant_request_id VARCHAR(100),
        mpesa_receipt VARCHAR(50),
        status ENUM('pending', 'completed', 'failed', 'cancelled', 'unknown') DEFAULT 'pending',
        result_code INT,
        result_desc TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL
      )
    `);
    
    console.log('Payments table created successfully');
    
    // Close connection
    await connection.end();
    console.log('Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating payments table:', error);
    process.exit(1);
  }
};

createPaymentsTable(); 