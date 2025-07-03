const { pool } = require('./config/db');

async function addAvatarColumn() {
  try {
    console.log('Checking if avatar column exists in users table...');
    
    try {
      // Try to select the avatar column
      await pool.query('SELECT avatar FROM users LIMIT 1');
      console.log('Avatar column already exists in users table');
    } catch (error) {
      // If error contains "Unknown column", add the column
      if (error.message.includes("Unknown column 'avatar'")) {
        console.log('Adding avatar column to users table...');
        await pool.query('ALTER TABLE users ADD COLUMN avatar VARCHAR(255) AFTER phone');
        console.log('Avatar column added successfully to users table');
      } else {
        // If it's another error, throw it
        throw error;
      }
    }
    
    console.log('Script completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error adding avatar column:', error);
    process.exit(1);
  }
}

// Run the function
addAvatarColumn(); 