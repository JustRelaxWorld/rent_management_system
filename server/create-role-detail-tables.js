const db = require('./config/db');

async function createTables() {
  try {
    console.log('Connecting to database...');
    const connected = await db.testConnection();
    
    if (!connected) {
      console.error('Failed to connect to database');
      return;
    }
    
    console.log('Creating landlord_details table if it does not exist...');
    await db.pool.execute(`
      CREATE TABLE IF NOT EXISTS landlord_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        mpesa_number VARCHAR(20),
        ownership_document_path VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    console.log('Creating tenant_details table if it does not exist...');
    await db.pool.execute(`
      CREATE TABLE IF NOT EXISTS tenant_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        id_number VARCHAR(50),
        lease_agreement_path VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    console.log('Tables created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  }
}

createTables(); 