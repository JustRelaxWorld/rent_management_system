const mysql = require('mysql2/promise');

async function checkUsers() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'pass123',
      database: 'rent_management'
    });
    
    console.log('Connected to MySQL database');
    
    const [rows] = await connection.execute('SELECT id, name, email, role, createdAt FROM users');
    
    if (rows.length === 0) {
      console.log('No users found in the database');
    } else {
      console.log('Users in the database:');
      console.table(rows);
    }
    
    await connection.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkUsers(); 