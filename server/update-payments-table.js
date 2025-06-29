const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const { pool } = require('./config/db');

// Load environment variables
dotenv.config();

const updatePaymentsTable = async () => {
  try {
    // Create database connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: 'pass123', // Use the hardcoded password from db.js
      database: process.env.DB_NAME || 'rent_management'
    });
    
    console.log('Connected to database');

    // Check if the payments table exists
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'payments'"
    );

    if (tables.length === 0) {
      console.log('Payments table does not exist. This is unexpected.');
      process.exit(1);
    } else {
      console.log('Payments table exists. Checking for missing columns...');
      
      // Check for checkout_request_id column
      const [checkoutRequestIdColumns] = await connection.query(
        "SHOW COLUMNS FROM payments LIKE 'checkout_request_id'"
      );
      
      if (checkoutRequestIdColumns.length === 0) {
        console.log('Adding checkout_request_id column...');
        await connection.query(
          "ALTER TABLE payments ADD COLUMN checkout_request_id VARCHAR(100) AFTER transaction_id"
        );
        console.log('Added checkout_request_id column');
      }
      
      // Check for merchant_request_id column
      const [merchantRequestIdColumns] = await connection.query(
        "SHOW COLUMNS FROM payments LIKE 'merchant_request_id'"
      );
      
      if (merchantRequestIdColumns.length === 0) {
        console.log('Adding merchant_request_id column...');
        await connection.query(
          "ALTER TABLE payments ADD COLUMN merchant_request_id VARCHAR(100) AFTER checkout_request_id"
        );
        console.log('Added merchant_request_id column');
      }
      
      // Check for mpesa_receipt column
      const [mpesaReceiptColumns] = await connection.query(
        "SHOW COLUMNS FROM payments LIKE 'mpesa_receipt'"
      );
      
      if (mpesaReceiptColumns.length === 0) {
        console.log('Adding mpesa_receipt column...');
        await connection.query(
          "ALTER TABLE payments ADD COLUMN mpesa_receipt VARCHAR(50) AFTER merchant_request_id"
        );
        console.log('Added mpesa_receipt column');
      }
      
      // Check for result_code column
      const [resultCodeColumns] = await connection.query(
        "SHOW COLUMNS FROM payments LIKE 'result_code'"
      );
      
      if (resultCodeColumns.length === 0) {
        console.log('Adding result_code column...');
        await connection.query(
          "ALTER TABLE payments ADD COLUMN result_code INT AFTER status"
        );
        console.log('Added result_code column');
      }
      
      // Check for result_desc column
      const [resultDescColumns] = await connection.query(
        "SHOW COLUMNS FROM payments LIKE 'result_desc'"
      );
      
      if (resultDescColumns.length === 0) {
        console.log('Adding result_desc column...');
        await connection.query(
          "ALTER TABLE payments ADD COLUMN result_desc TEXT AFTER result_code"
        );
        console.log('Added result_desc column');
      }
      
      // Check for completed_at column
      const [completedAtColumns] = await connection.query(
        "SHOW COLUMNS FROM payments LIKE 'completed_at'"
      );
      
      if (completedAtColumns.length === 0) {
        console.log('Adding completed_at column...');
        await connection.query(
          "ALTER TABLE payments ADD COLUMN completed_at DATETIME AFTER created_at"
        );
        console.log('Added completed_at column');
      }
      
      // Check for phone column
      const [phoneColumns] = await connection.query(
        "SHOW COLUMNS FROM payments LIKE 'phone'"
      );
      
      if (phoneColumns.length === 0) {
        console.log('Adding phone column...');
        await connection.query(
          "ALTER TABLE payments ADD COLUMN phone VARCHAR(20) AFTER tenant_id"
        );
        console.log('Added phone column');
      }
      
      // Check for expires_at column
      const [expiresAtColumns] = await connection.query(
        "SHOW COLUMNS FROM payments LIKE 'expires_at'"
      );
      
      if (expiresAtColumns.length === 0) {
        console.log('Adding expires_at column...');
        await connection.query(
          "ALTER TABLE payments ADD COLUMN expires_at DATETIME NULL AFTER created_at"
        );
        console.log('Added expires_at column');
      }
      
      // Update the status enum to include 'cancelled'
      console.log('Updating status enum to include cancelled...');
      await connection.query(
        "ALTER TABLE payments MODIFY COLUMN status ENUM('success', 'pending', 'failed', 'cancelled') DEFAULT 'pending'"
      );
      console.log('Updated status enum');
      
      // Check if status column has the correct values
      const [statusConstraint] = await connection.query(`
        SELECT COLUMN_NAME, COLUMN_TYPE
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'payments' 
        AND COLUMN_NAME = 'status'
      `);
      
      if (statusConstraint.length > 0) {
        const currentType = statusConstraint[0].COLUMN_TYPE;
        
        // If the status column doesn't have the correct enum values
        if (!currentType.includes('expired') || !currentType.includes('cancelled')) {
          // Modify the status column to support all payment statuses
          await connection.query(`
            ALTER TABLE payments 
            MODIFY COLUMN status ENUM('pending', 'completed', 'failed', 'expired', 'cancelled') NOT NULL DEFAULT 'pending'
          `);
          console.log('Successfully updated status column in payments table');
        } else {
          console.log('status column already has the correct values');
        }
      }
      
      // Check for retry_of column
      const [retryColumns] = await connection.query(
        "SHOW COLUMNS FROM payments LIKE 'retry_of'"
      );
      
      if (retryColumns.length === 0) {
        console.log('Adding retry_of column...');
        await connection.query(
          "ALTER TABLE payments ADD COLUMN retry_of INT NULL AFTER expires_at, ADD FOREIGN KEY (retry_of) REFERENCES payments(id)"
        );
        console.log('Added retry_of column');
      }
      
      console.log('Payments table structure updated successfully');
    }
    
    // Close connection
    await connection.end();
    console.log('Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating payments table:', error);
    process.exit(1);
  }
};

updatePaymentsTable(); 