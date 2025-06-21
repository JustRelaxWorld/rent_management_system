const { pool } = require('../config/db');

class Property {
  constructor(property) {
    this.id = property.id;
    this.title = property.title;
    this.description = property.description;
    this.address = property.address;
    this.city = property.city;
    this.type = property.type; // apartment, house, commercial
    this.bedrooms = property.bedrooms;
    this.bathrooms = property.bathrooms;
    this.size = property.size; // in square feet/meters
    this.rent_amount = property.rent_amount;
    this.is_available = property.is_available;
    this.landlord_id = property.landlord_id;
    this.created_at = property.created_at;
    this.updated_at = property.updated_at;
  }

  // Create a new property
  static async create(propertyData) {
    try {
      const [result] = await pool.execute(
        `INSERT INTO properties 
        (title, description, address, city, type, bedrooms, bathrooms, size, rent_amount, is_available, landlord_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          propertyData.title,
          propertyData.description,
          propertyData.address,
          propertyData.city,
          propertyData.type,
          propertyData.bedrooms,
          propertyData.bathrooms,
          propertyData.size,
          propertyData.rent_amount,
          propertyData.is_available || true,
          propertyData.landlord_id
        ]
      );

      return { id: result.insertId, ...propertyData };
    } catch (error) {
      throw error;
    }
  }

  // Find property by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute('SELECT * FROM properties WHERE id = ?', [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new Property(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Get all properties
  static async findAll(filters = {}) {
    try {
      let query = 'SELECT * FROM properties';
      const queryParams = [];
      
      // Build WHERE clause based on filters
      if (Object.keys(filters).length > 0) {
        const whereConditions = [];
        
        if (filters.landlord_id) {
          whereConditions.push('landlord_id = ?');
          queryParams.push(filters.landlord_id);
        }
        
        if (filters.is_available !== undefined) {
          whereConditions.push('is_available = ?');
          queryParams.push(filters.is_available);
        }
        
        if (filters.city) {
          whereConditions.push('city LIKE ?');
          queryParams.push(`%${filters.city}%`);
        }
        
        if (filters.type) {
          whereConditions.push('type = ?');
          queryParams.push(filters.type);
        }
        
        if (filters.min_rent) {
          whereConditions.push('rent_amount >= ?');
          queryParams.push(filters.min_rent);
        }
        
        if (filters.max_rent) {
          whereConditions.push('rent_amount <= ?');
          queryParams.push(filters.max_rent);
        }
        
        if (whereConditions.length > 0) {
          query += ' WHERE ' + whereConditions.join(' AND ');
        }
      }
      
      const [rows] = await pool.execute(query, queryParams);
      return rows.map(row => new Property(row));
    } catch (error) {
      throw error;
    }
  }

  // Update property
  static async update(id, propertyData) {
    try {
      const updateFields = [];
      const values = [];

      // Build dynamic update query
      Object.keys(propertyData).forEach(key => {
        if (key !== 'id') {
          updateFields.push(`${key} = ?`);
          values.push(propertyData[key]);
        }
      });

      values.push(id);

      const [result] = await pool.execute(
        `UPDATE properties SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
        values
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete property
  static async delete(id) {
    try {
      const [result] = await pool.execute('DELETE FROM properties WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get properties by landlord ID
  static async findByLandlordId(landlordId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM properties WHERE landlord_id = ?',
        [landlordId]
      );
      
      return rows.map(row => new Property(row));
    } catch (error) {
      throw error;
    }
  }

  // Assign tenant to property
  static async assignTenant(propertyId, tenantId, leaseStartDate, leaseEndDate, rentAmount) {
    try {
      // First check if property is available
      const [propertyRows] = await pool.execute(
        'SELECT * FROM properties WHERE id = ? AND is_available = true',
        [propertyId]
      );
      
      if (propertyRows.length === 0) {
        throw new Error('Property is not available for lease');
      }
      
      // Create lease record
      const [result] = await pool.execute(
        `INSERT INTO leases 
        (property_id, tenant_id, start_date, end_date, rent_amount, status) 
        VALUES (?, ?, ?, ?, ?, 'active')`,
        [propertyId, tenantId, leaseStartDate, leaseEndDate, rentAmount]
      );
      
      // Update property availability
      await pool.execute(
        'UPDATE properties SET is_available = false WHERE id = ?',
        [propertyId]
      );
      
      return { id: result.insertId, property_id: propertyId, tenant_id: tenantId };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Property; 