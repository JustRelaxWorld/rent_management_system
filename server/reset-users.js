/**
 * User Data Reset Script
 * 
 * This script removes all user-related data from the database and resets auto-increment counters.
 * IMPORTANT: Only use this in development environments!
 */

const { pool } = require('./config/db');
const bcrypt = require('bcryptjs');

// Environment check to prevent accidental execution in production
const isDevelopment = process.env.NODE_ENV !== 'production';

async function resetUserData() {
  if (!isDevelopment) {
    console.error('⛔ ERROR: This script can only be run in development environments!');
    console.error('Set NODE_ENV to "development" to run this script.');
    process.exit(1);
  }

  const connection = await pool.getConnection();

  try {
    console.log('🔄 Starting user data reset process...');
    
    // Begin transaction
    await connection.beginTransaction();
    
    // Disable foreign key checks temporarily to allow cascading deletes
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Delete data from all user-related tables in the correct order
    console.log('🗑️  Deleting data from user-related tables...');
    
    // Delete from notification table
    await connection.query('DELETE FROM notifications');
    console.log('✓ Deleted all notifications');
    
    // Delete from payments table
    await connection.query('DELETE FROM payments');
    console.log('✓ Deleted all payments');
    
    // Delete from invoices table
    await connection.query('DELETE FROM invoices');
    console.log('✓ Deleted all invoices');
    
    // Delete from maintenance_comments table if it exists
    try {
      await connection.query('DELETE FROM maintenance_comments');
      console.log('✓ Deleted all maintenance comments');
    } catch (error) {
      console.log('ℹ️ No maintenance_comments table found, skipping');
    }
    
    // Delete from maintenance_requests table
    await connection.query('DELETE FROM maintenance_requests');
    console.log('✓ Deleted all maintenance requests');
    
    // Delete from rental_applications table
    await connection.query('DELETE FROM rental_applications');
    console.log('✓ Deleted all rental applications');
    
    // Delete from properties table
    await connection.query('DELETE FROM properties');
    console.log('✓ Deleted all properties');
    
    // Delete from tenant_details table
    await connection.query('DELETE FROM tenant_details');
    console.log('✓ Deleted all tenant details');
    
    // Delete from landlord_details table
    await connection.query('DELETE FROM landlord_details');
    console.log('✓ Deleted all landlord details');
    
    // Delete from users table (this is the main table we're resetting)
    await connection.query('DELETE FROM users');
    console.log('✓ Deleted all users');
    
    // Reset auto-increment counters
    console.log('🔄 Resetting auto-increment counters...');
    
    const tables = [
      'users', 
      'landlord_details', 
      'tenant_details', 
      'properties', 
      'rental_applications', 
      'maintenance_requests', 
      'invoices', 
      'payments', 
      'notifications'
    ];
    
    for (const table of tables) {
      try {
        await connection.query(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
        console.log(`✓ Reset auto-increment for ${table}`);
      } catch (error) {
        console.log(`ℹ️ Could not reset auto-increment for ${table}, it may not exist`);
      }
    }
    
    // Re-enable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    
    // Commit transaction
    await connection.commit();
    
    console.log('✅ User data reset complete!');
    
    // Create default admin user if requested
    if (process.argv.includes('--seed-admin')) {
      await createDefaultAdmin();
    }
    
  } catch (error) {
    // Rollback transaction in case of error
    await connection.rollback();
    console.error('❌ Error during reset process:', error);
    process.exit(1);
  } finally {
    // Release connection
    connection.release();
  }
}

async function createDefaultAdmin() {
  try {
    console.log('🔑 Creating default admin user...');
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    // Insert admin user
    await pool.execute(
      'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
      ['Admin User', 'admin@example.com', hashedPassword, 'admin', '1234567890']
    );
    
    console.log('✅ Default admin user created:');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123');
    
    // Create default landlord user
    await createDefaultLandlord();
    
  } catch (error) {
    console.error('❌ Error creating default admin:', error);
  }
}

async function createDefaultLandlord() {
  try {
    console.log('🏠 Creating default landlord user...');
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('landlord123', salt);
    
    // Insert landlord user
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
      ['Landlord User', 'landlord@example.com', hashedPassword, 'landlord', '9876543210']
    );
    
    // Create landlord details
    await pool.execute(
      'INSERT INTO landlord_details (user_id, mpesa_number, ownership_document_path) VALUES (?, ?, ?)',
      [result.insertId, '9876543210', 'uploads/landlord/default_document.pdf']
    );
    
    console.log('✅ Default landlord user created:');
    console.log('   Email: landlord@example.com');
    console.log('   Password: landlord123');
    
  } catch (error) {
    console.error('❌ Error creating default landlord:', error);
  }
}

// Run the reset function
resetUserData().then(() => {
  console.log('🏁 Script execution complete');
  process.exit(0);
}).catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
}); 