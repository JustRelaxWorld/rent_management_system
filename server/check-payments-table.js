const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const checkPaymentsTable = async () => {
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
      console.log('Payments table does not exist.');
    } else {
      console.log('Payments table exists. Checking structure...');
      
      // Get table structure
      const [columns] = await connection.query(
        "DESCRIBE payments"
      );
      
      console.log('Payments table structure:');
      columns.forEach(column => {
        console.log(`- ${column.Field}: ${column.Type} ${column.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${column.Key ? `(${column.Key})` : ''} ${column.Default ? `DEFAULT '${column.Default}'` : ''}`);
      });
    }
    
    // Close connection
    await connection.end();
    console.log('Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking payments table:', error);
    process.exit(1);
  }
};

checkPaymentsTable(); 