const { pool } = require('./config/db');

const checkUsersTable = async () => {
  try {
    console.log('Checking users table structure...');
    
    // Get connection
    const connection = await pool.getConnection();
    
    // Get table structure
    const [columns] = await connection.query(`
      DESCRIBE users
    `);
    
    console.log('\nUsers table structure:');
    columns.forEach(column => {
      console.log(`- ${column.Field}: ${column.Type} ${column.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${column.Key === 'PRI' ? 'PRIMARY KEY' : ''}`);
    });
    
    // Release connection
    connection.release();
  } catch (error) {
    console.error('Error checking users table:', error);
  } finally {
    // Close pool
    await pool.end();
  }
};

// Run the function
checkUsersTable(); 