const { pool } = require('./config/db');

async function addThemePreferenceColumn() {
  try {
    console.log('Checking if theme_preference column exists in users table...');
    
    try {
      // Try to select the column to check if it exists
      await pool.query('SELECT theme_preference FROM users LIMIT 1');
      console.log('theme_preference column already exists in users table');
    } catch (error) {
      // If error contains "unknown column", add the column
      if (error.message.includes("Unknown column 'theme_preference'")) {
        console.log('Adding theme_preference column to users table...');
        await pool.query("ALTER TABLE users ADD COLUMN theme_preference ENUM('light', 'dark') NULL AFTER avatar");
        console.log('theme_preference column added successfully to users table');
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

addThemePreferenceColumn(); 