const mysql = require('mysql2/promise');

async function checkAllTables() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'pass123',
      database: 'rent_management'
    });
    
    console.log('Connected to MySQL database');
    
    // Check all tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Tables in the database:');
    tables.forEach(tableObj => {
      const tableName = Object.values(tableObj)[0];
      console.log(`- ${tableName}`);
    });
    
    // Check if rental_applications table exists
    const rentalApplicationsTable = tables.find(table => Object.values(table)[0] === 'rental_applications');
    
    if (rentalApplicationsTable) {
      console.log('\nRental Applications table exists');
      
      // Check structure
      const [columns] = await connection.execute('DESCRIBE rental_applications');
      console.log('\nStructure of rental_applications table:');
      columns.forEach(col => {
        console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
      });
      
      // Check count
      const [countResult] = await connection.execute('SELECT COUNT(*) as count FROM rental_applications');
      console.log(`\nNumber of records in rental_applications table: ${countResult[0].count}`);
    } else {
      console.log('\nRental Applications table does NOT exist');
    }
    
    await connection.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkAllTables(); 