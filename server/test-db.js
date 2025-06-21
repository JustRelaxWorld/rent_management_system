const { pool } = require('./config/db');

const testDatabase = async () => {
  try {
    console.log('Testing database connection...');
    
    // Test connection
    const connection = await pool.getConnection();
    console.log('MySQL database connected successfully');
    
    // Check tables
    const [tables] = await connection.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'rent_management'
    `);
    
    console.log('\nTables in the database:');
    tables.forEach(table => {
      console.log(`- ${table.TABLE_NAME}`);
    });
    
    // Check if admin user exists
    const [adminUser] = await connection.query(`
      SELECT id, name, email, role 
      FROM users 
      WHERE email = 'admin@rentmanagement.com'
    `);
    
    if (adminUser.length > 0) {
      console.log('\nAdmin user exists:');
      console.log(`- ID: ${adminUser[0].id}`);
      console.log(`- Name: ${adminUser[0].name}`);
      console.log(`- Email: ${adminUser[0].email}`);
      console.log(`- Role: ${adminUser[0].role}`);
    } else {
      console.log('\nAdmin user does not exist');
    }
    
    // Release connection
    connection.release();
  } catch (error) {
    console.error('Database test error:', error);
  } finally {
    // Close pool
    await pool.end();
  }
};

// Run the test
testDatabase(); 