/**
 * Migration script to add auth_provider_id column to users table
 */

const mysql = require('mysql2/promise');
const { pool } = require('./config/db');

async function addAuthProviderIdColumn() {
  try {
    console.log('Adding auth_provider_id column to users table...');
    
    // Check if column exists
    const [columns] = await pool.execute(
      `SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'auth_provider_id'`
    );
    
    if (columns.length === 0) {
      // Add the column if it doesn't exist
      await pool.execute(
        `ALTER TABLE users 
        ADD COLUMN auth_provider_id VARCHAR(255) NULL AFTER auth_provider`
      );
      console.log('Successfully added auth_provider_id column to users table');
    } else {
      console.log('auth_provider_id column already exists in users table');
    }
    
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
addAuthProviderIdColumn(); 