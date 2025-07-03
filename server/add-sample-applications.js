const mysql = require('mysql2/promise');

async function addSampleApplications() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'pass123',
      database: 'rent_management'
    });
    
    console.log('Connected to MySQL database');
    
    // First, get a landlord user ID
    const [landlords] = await connection.execute(
      "SELECT id FROM users WHERE role = 'landlord' LIMIT 1"
    );
    
    if (landlords.length === 0) {
      console.log('No landlord users found. Creating a landlord user...');
      // Create a landlord user if none exists
      const [result] = await connection.execute(
        "INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)",
        ['Landlord User', 'landlord@example.com', '1234567890', '$2a$10$XVXRvUK.CpYVPT0UqbHwxuQww6vBiinGJxGYqAiDZnTTKXQyKpnUy', 'landlord']
      );
      console.log('Created landlord user with ID:', result.insertId);
      var landlordId = result.insertId;
    } else {
      var landlordId = landlords[0].id;
      console.log('Found landlord user with ID:', landlordId);
    }
    
    // Get a tenant user ID
    const [tenants] = await connection.execute(
      "SELECT id FROM users WHERE role = 'tenant' LIMIT 1"
    );
    
    if (tenants.length === 0) {
      console.log('No tenant users found. Creating a tenant user...');
      // Create a tenant user if none exists
      const [result] = await connection.execute(
        "INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)",
        ['Tenant User', 'tenant@example.com', '0987654321', '$2a$10$XVXRvUK.CpYVPT0UqbHwxuQww6vBiinGJxGYqAiDZnTTKXQyKpnUy', 'tenant']
      );
      console.log('Created tenant user with ID:', result.insertId);
      var tenantId = result.insertId;
    } else {
      var tenantId = tenants[0].id;
      console.log('Found tenant user with ID:', tenantId);
    }
    
    // Get or create a property
    const [properties] = await connection.execute(
      "SELECT id FROM properties WHERE landlord_id = ? LIMIT 1",
      [landlordId]
    );
    
    if (properties.length === 0) {
      console.log('No properties found. Creating a property...');
      // Create a property if none exists
      const [result] = await connection.execute(
        "INSERT INTO properties (title, description, address, city, type, bedrooms, bathrooms, size, rent_amount, is_available, landlord_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        ['Sample Property', 'A nice sample property', '123 Main St', 'Sample City', 'apartment', 2, 1, 1000, 1500, true, landlordId]
      );
      console.log('Created property with ID:', result.insertId);
      var propertyId = result.insertId;
    } else {
      var propertyId = properties[0].id;
      console.log('Found property with ID:', propertyId);
    }
    
    // Add a sample rental application
    const [existingApplications] = await connection.execute(
      "SELECT id FROM rental_applications WHERE tenant_id = ? AND property_id = ?",
      [tenantId, propertyId]
    );
    
    if (existingApplications.length === 0) {
      console.log('Creating sample rental application...');
      const [result] = await connection.execute(
        "INSERT INTO rental_applications (property_id, tenant_id, landlord_id, status, move_in_date, monthly_income, employment_status, employer, additional_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [propertyId, tenantId, landlordId, 'pending', '2023-12-01', 5000, 'employed', 'Sample Employer', 'This is a sample application']
      );
      console.log('Created rental application with ID:', result.insertId);
    } else {
      console.log('Application already exists with ID:', existingApplications[0].id);
    }
    
    // Check the count of applications
    const [count] = await connection.execute('SELECT COUNT(*) as count FROM rental_applications');
    console.log('Number of records in rental_applications table:', count[0].count);
    
    // Get all applications
    const [applications] = await connection.execute('SELECT * FROM rental_applications');
    console.log('All rental applications:');
    console.table(applications);
    
    await connection.end();
    console.log('Sample data creation completed');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

addSampleApplications(); 