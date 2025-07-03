const mysql = require('mysql2/promise');

async function addPhoneColumn() {
  const connectionConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'pass123',
    database: 'rent_management'
  };

  console.log('Connecting to MySQL database...');
  
  try {
    // Connect to the database
    const connection = await mysql.createConnection(connectionConfig);
    console.log('Connected to MySQL database');
    
    // Check if phone column exists
    try {
      const [columns] = await connection.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'phone'
      `, [connectionConfig.database]);
      
      if (columns.length === 0) {
        console.log('Phone column does not exist in users table, adding it now...');
        
        // Add phone column
        await connection.execute(`
          ALTER TABLE users ADD COLUMN phone VARCHAR(20) AFTER password
        `);
        
        console.log('✓ Phone column added successfully to users table');
      } else {
        console.log('✓ Phone column already exists in users table');
      }
      
      // Verify the column was added
      const [allColumns] = await connection.execute(`
        SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
      `, [connectionConfig.database]);
      
      console.log('Updated users table structure:');
      console.table(allColumns.map(col => ({
        COLUMN_NAME: col.COLUMN_NAME,
        DATA_TYPE: col.DATA_TYPE,
        COLUMN_TYPE: col.COLUMN_TYPE
      })));
      
    } catch (error) {
      console.error('Error checking/adding phone column:', error.message);
    }
    
    await connection.end();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Database connection error:', error.message);
  }
}

addPhoneColumn().catch(console.error); 