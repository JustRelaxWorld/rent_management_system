const mysql = require('mysql2/promise');

async function createUsersTable() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'pass123',
      database: 'rent_management'
    });
    
    console.log('Connected to MySQL database');
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('tenant', 'landlord', 'admin') DEFAULT 'tenant',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await connection.execute(createTableSQL);
    console.log('Users table created or already exists');
    
    // Check if the table was created
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Tables in the database:');
    console.table(tables);
    
    // Check table structure
    const [columns] = await connection.execute('DESCRIBE users');
    console.log('Structure of users table:');
    console.table(columns);
    
    await connection.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

createUsersTable(); 