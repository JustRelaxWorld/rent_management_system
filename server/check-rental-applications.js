const mysql = require('mysql2/promise');

async function checkRentalApplicationsTable() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'pass123',
      database: 'rent_management'
    });
    
    console.log('Connected to MySQL database');
    
    // Check if rental_applications table exists
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Tables in the database:');
    console.table(tables);
    
    // If rental_applications table exists, check its structure
    const [tableExists] = tables.filter(table => Object.values(table)[0] === 'rental_applications');
    if (tableExists) {
      const [columns] = await connection.execute('DESCRIBE rental_applications');
      console.log('Structure of rental_applications table:');
      console.table(columns);
      
      // Check if there are any records in the table
      const [count] = await connection.execute('SELECT COUNT(*) as count FROM rental_applications');
      console.log('Number of records in rental_applications table:', count[0].count);
      
      if (count[0].count > 0) {
        // Get a sample of records
        const [records] = await connection.execute('SELECT * FROM rental_applications LIMIT 5');
        console.log('Sample records from rental_applications table:');
        console.table(records);
      }
    } else {
      console.log('rental_applications table does not exist');
    }
    
    await connection.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkRentalApplicationsTable(); 