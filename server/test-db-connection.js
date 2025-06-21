const mysql = require('mysql2/promise');

async function testDBConnection() {
  const connectionConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'pass123',
    database: 'rent_management'
  };

  console.log('Attempting to connect to MySQL database with the following config:');
  console.log(connectionConfig);

  try {
    // First try connecting without specifying a database to check credentials
    const connectionWithoutDB = await mysql.createConnection({
      host: connectionConfig.host,
      port: connectionConfig.port,
      user: connectionConfig.user,
      password: connectionConfig.password
    });
    
    console.log('✓ Successfully connected to MySQL server');
    
    try {
      // Check if database exists
      const [rows] = await connectionWithoutDB.execute(
        `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`, 
        [connectionConfig.database]
      );
      
      if (rows.length === 0) {
        console.log(`✗ Database '${connectionConfig.database}' does not exist`);
        console.log('Creating database...');
        
        await connectionWithoutDB.execute(
          `CREATE DATABASE IF NOT EXISTS ${connectionConfig.database}`
        );
        
        console.log(`✓ Database '${connectionConfig.database}' created successfully`);
      } else {
        console.log(`✓ Database '${connectionConfig.database}' exists`);
      }
      
      // Connect to the specific database
      const connection = await mysql.createConnection(connectionConfig);
      console.log(`✓ Successfully connected to '${connectionConfig.database}' database`);
      
      // Check if users table exists
      const [tableRows] = await connection.execute(
        `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'`, 
        [connectionConfig.database]
      );
      
      if (tableRows.length === 0) {
        console.log('✗ Users table does not exist');
      } else {
        console.log('✓ Users table exists');
        
        // Check users table structure
        const [userColumns] = await connection.execute(
          `SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE 
           FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'`,
          [connectionConfig.database]
        );
        
        console.log('Users table structure:');
        console.table(userColumns);
        
        // Count users
        const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
        console.log(`Total users in database: ${userCount[0].count}`);
      }
      
      await connection.end();
    } catch (err) {
      console.error('Error accessing database:', err.message);
    }
    
    await connectionWithoutDB.end();
  } catch (err) {
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('✗ MySQL connection error: Access denied. Invalid credentials.');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('✗ MySQL connection error: Connection refused. Is MySQL server running?');
    } else {
      console.error('✗ MySQL connection error:', err.message);
    }
  }
}

testDBConnection().catch(console.error); 