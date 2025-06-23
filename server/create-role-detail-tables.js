const mysql = require('mysql2/promise');
const { pool } = require('./config/db');

// Create landlord_details and tenant_details tables
async function createRoleDetailTables() {
  try {
    console.log('Creating role-specific detail tables...');
    
    // Create landlord_details table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS landlord_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        mpesa_number VARCHAR(15) NOT NULL,
        ownership_document_path VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('landlord_details table created or already exists');
    
    // Create tenant_details table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tenant_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        id_number VARCHAR(25) NOT NULL,
        lease_agreement_path VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('tenant_details table created or already exists');
    
    console.log('Role-specific detail tables created successfully');
  } catch (error) {
    console.error('Error creating role-specific detail tables:', error);
  }
}

// Run the function
createRoleDetailTables()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('Script failed:', err);
    process.exit(1);
  }); 