const { pool } = require('./config/db');

async function addMaintenanceImageColumn() {
  try {
    console.log('Checking if image_url column exists in maintenance_requests table...');
    
    try {
      // Try to select the column to check if it exists
      await pool.query('SELECT image_url FROM maintenance_requests LIMIT 1');
      console.log('image_url column already exists in maintenance_requests table');
    } catch (error) {
      // If error contains "unknown column", add the column
      if (error.message.includes("Unknown column 'image_url'")) {
        console.log('Adding image_url column to maintenance_requests table...');
        await pool.query('ALTER TABLE maintenance_requests ADD COLUMN image_url VARCHAR(255)');
        console.log('image_url column added successfully to maintenance_requests table');
      } else {
        throw error;
      }
    }
    
    console.log('Script completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addMaintenanceImageColumn(); 