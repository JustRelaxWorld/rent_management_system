const mysql = require('mysql2/promise');

async function checkTables() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'pass123',
      database: 'rent_management'
    });
    
    console.log('Connected to MySQL database');
    
    // Check if users table exists
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Tables in the database:');
    console.table(tables);
    
    // If users table exists, check its structure
    const [tableExists] = tables.filter(table => Object.values(table)[0] === 'users');
    if (tableExists) {
      const [columns] = await connection.execute('DESCRIBE users');
      console.log('Structure of users table:');
      console.table(columns);
    }
    
    await connection.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkTables(); 