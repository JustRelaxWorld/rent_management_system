const { pool } = require('../config/db');

class RentalApplication {
  constructor(application) {
    this.id = application.id;
    this.property_id = application.property_id;
    this.tenant_id = application.tenant_id;
    this.landlord_id = application.landlord_id;
    this.status = application.status; // pending, approved, rejected
    this.move_in_date = application.move_in_date;
    this.monthly_income = application.monthly_income;
    this.employment_status = application.employment_status;
    this.employer = application.employer;
    this.additional_notes = application.additional_notes;
    this.created_at = application.created_at;
    this.updated_at = application.updated_at;
  }

  // Create applications table if it doesn't exist
  static async createTable() {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS rental_applications (
          id INT AUTO_INCREMENT PRIMARY KEY,
          property_id INT NOT NULL,
          tenant_id INT NOT NULL,
          landlord_id INT NOT NULL,
          status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
          move_in_date DATE,
          monthly_income DECIMAL(10, 2),
          employment_status VARCHAR(50),
          employer VARCHAR(100),
          additional_notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
          FOREIGN KEY (tenant_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (landlord_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      console.log('Rental applications table created or already exists');
      return true;
    } catch (error) {
      console.error('Error creating rental applications table:', error);
      throw error;
    }
  }

  // Create a new rental application
  static async create(applicationData) {
    try {
      const [result] = await pool.execute(
        `INSERT INTO rental_applications 
        (property_id, tenant_id, landlord_id, move_in_date, monthly_income, employment_status, employer, additional_notes) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          applicationData.property_id,
          applicationData.tenant_id,
          applicationData.landlord_id,
          applicationData.move_in_date,
          applicationData.monthly_income,
          applicationData.employment_status,
          applicationData.employer,
          applicationData.additional_notes || ''
        ]
      );

      return { id: result.insertId, ...applicationData, status: 'pending' };
    } catch (error) {
      throw error;
    }
  }

  // Find application by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute('SELECT * FROM rental_applications WHERE id = ?', [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new RentalApplication(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Get applications by property ID
  static async findByPropertyId(propertyId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM rental_applications WHERE property_id = ? ORDER BY created_at DESC',
        [propertyId]
      );
      
      return rows.map(row => new RentalApplication(row));
    } catch (error) {
      throw error;
    }
  }

  // Get applications by tenant ID
  static async findByTenantId(tenantId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM rental_applications WHERE tenant_id = ? ORDER BY created_at DESC',
        [tenantId]
      );
      
      return rows.map(row => new RentalApplication(row));
    } catch (error) {
      throw error;
    }
  }

  // Get applications by landlord ID
  static async findByLandlordId(landlordId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM rental_applications WHERE landlord_id = ? ORDER BY created_at DESC',
        [landlordId]
      );
      
      return rows.map(row => new RentalApplication(row));
    } catch (error) {
      throw error;
    }
  }

  // Update application status
  static async updateStatus(id, status, additionalData = {}) {
    try {
      const [result] = await pool.execute(
        'UPDATE rental_applications SET status = ? WHERE id = ?',
        [status, id]
      );

      // If approved and there's a lease start date, create a lease
      if (status === 'approved' && additionalData.leaseStartDate && additionalData.leaseEndDate) {
        // Get the application to find property and tenant
        const application = await this.findById(id);
        
        if (application) {
          // Update property availability
          await pool.execute(
            'UPDATE properties SET is_available = false WHERE id = ?',
            [application.property_id]
          );
        }
      }

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get application with related data (property and tenant details)
  static async getApplicationWithDetails(id) {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          a.*,
          p.title as property_title, 
          p.address as property_address,
          p.city as property_city,
          p.rent_amount as property_rent,
          t.name as tenant_name,
          t.email as tenant_email,
          t.phone as tenant_phone
        FROM 
          rental_applications a
        JOIN 
          properties p ON a.property_id = p.id
        JOIN 
          users t ON a.tenant_id = t.id
        WHERE 
          a.id = ?
      `, [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get all applications with related data for a landlord
  static async getLandlordApplicationsWithDetails(landlordId) {
    try {
      console.log(`Getting applications with details for landlord ID: ${landlordId}`);
      
      const [rows] = await pool.execute(`
        SELECT 
          a.*,
          p.title as property_title, 
          p.address as property_address,
          p.city as property_city,
          p.rent_amount as property_rent,
          t.name as tenant_name,
          t.email as tenant_email,
          t.phone as tenant_phone
        FROM 
          rental_applications a
        JOIN 
          properties p ON a.property_id = p.id
        JOIN 
          users t ON a.tenant_id = t.id
        WHERE 
          a.landlord_id = ?
        ORDER BY 
          a.created_at DESC
      `, [landlordId]);
      
      console.log(`Found ${rows.length} applications for landlord ID: ${landlordId}`);
      return rows;
    } catch (error) {
      console.error(`Error getting applications for landlord ${landlordId}:`, error);
      throw error;
    }
  }

  // Check if tenant has already applied for a property
  static async checkExistingApplication(tenantId, propertyId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM rental_applications WHERE tenant_id = ? AND property_id = ?',
        [tenantId, propertyId]
      );
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = RentalApplication; 