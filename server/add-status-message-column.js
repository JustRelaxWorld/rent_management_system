const { pool } = require('./config/db');

async function addStatusMessageColumn() {
  try {
    console.log('Adding status_message column to payments table...');
    
    await pool.query(`
      ALTER TABLE payments 
      ADD COLUMN status_message VARCHAR(255) 
      AFTER result_desc
    `);
    
    console.log('Column added successfully!');
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Column already exists.');
    } else {
      console.error('Error adding column:', error);
    }
  } finally {
    // Close the pool
    process.exit(0);
  }
}

addStatusMessageColumn(); 