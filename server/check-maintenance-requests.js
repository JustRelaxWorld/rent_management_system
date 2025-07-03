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

// Check maintenance_requests table structure
const checkMaintenanceRequestsTable = async () => {
  try {
    const connection = await createConnection();
    
    console.log('Checking maintenance_requests table structure...');
    
    // Get table columns
    const [columns] = await connection.execute(
      `DESCRIBE maintenance_requests`
    );
    
    console.log('Maintenance Requests Table Columns:');
    columns.forEach(column => {
      console.log(`- ${column.Field}: ${column.Type} ${column.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${column.Default ? `DEFAULT ${column.Default}` : ''}`);
    });
    
    // Check if specific columns exist
    const columnNames = columns.map(column => column.Field);
    console.log('\nChecking for required columns:');
    
    const requiredColumns = ['id', 'tenant_id', 'property_id', 'title', 'description', 'type', 'status', 'priority'];
    const missingColumns = [];
    
    requiredColumns.forEach(column => {
      if (columnNames.includes(column)) {
        console.log(`✓ ${column} exists`);
      } else {
        console.log(`✗ ${column} is missing`);
        missingColumns.push(column);
      }
    });
    
    // Add missing columns if any
    if (missingColumns.includes('type')) {
      console.log('\nAdding missing type column...');
      await connection.execute(`
        ALTER TABLE maintenance_requests
        ADD COLUMN type VARCHAR(50) NOT NULL DEFAULT 'other' AFTER description
      `);
      console.log('Type column added successfully');
    }
    
    if (missingColumns.includes('status') || missingColumns.includes('priority')) {
      console.log('\nAdding missing status and priority columns...');
      
      if (missingColumns.includes('status')) {
        await connection.execute(`
          ALTER TABLE maintenance_requests
          ADD COLUMN status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending'
        `);
        console.log('Status column added successfully');
      }
      
      if (missingColumns.includes('priority')) {
        await connection.execute(`
          ALTER TABLE maintenance_requests
          ADD COLUMN priority ENUM('low', 'medium', 'high') DEFAULT 'medium'
        `);
        console.log('Priority column added successfully');
      }
    }
    
    // Check for request_date and completion_date columns
    if (!columnNames.includes('request_date')) {
      console.log('\nAdding request_date column...');
      await connection.execute(`
        ALTER TABLE maintenance_requests
        ADD COLUMN request_date DATETIME DEFAULT CURRENT_TIMESTAMP
      `);
      console.log('request_date column added successfully');
    }
    
    if (!columnNames.includes('completion_date')) {
      console.log('\nAdding completion_date column...');
      await connection.execute(`
        ALTER TABLE maintenance_requests
        ADD COLUMN completion_date DATETIME NULL
      `);
      console.log('completion_date column added successfully');
    }
    
    await connection.end();
    console.log('\nMaintenance requests table check completed');
  } catch (error) {
    console.error('Error checking maintenance_requests table structure:', error);
    process.exit(1);
  }
};

// Run the script
checkMaintenanceRequestsTable(); 