const { pool } = require('../config/db');

class Maintenance {
  constructor(maintenance) {
    this.id = maintenance.id;
    this.property_id = maintenance.property_id;
    this.tenant_id = maintenance.tenant_id;
    this.title = maintenance.title;
    this.description = maintenance.description;
    this.status = maintenance.status; // pending, in_progress, completed, cancelled
    this.priority = maintenance.priority; // low, medium, high
    this.request_date = maintenance.request_date;
    this.completion_date = maintenance.completion_date;
    this.created_at = maintenance.created_at;
    this.updated_at = maintenance.updated_at;
  }

  // Create a new maintenance request
  static async create(maintenanceData) {
    try {
      const [result] = await pool.execute(
        `INSERT INTO maintenance_requests 
        (property_id, tenant_id, title, description, type, status, priority, request_date) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          maintenanceData.property_id,
          maintenanceData.tenant_id,
          maintenanceData.title,
          maintenanceData.description,
          maintenanceData.type || 'other',
          maintenanceData.status || 'pending',
          maintenanceData.priority || 'medium',
          maintenanceData.request_date || new Date()
        ]
      );

      return { id: result.insertId, ...maintenanceData };
    } catch (error) {
      throw error;
    }
  }

  // Find maintenance request by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute('SELECT * FROM maintenance_requests WHERE id = ?', [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new Maintenance(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Get all maintenance requests
  static async findAll(filters = {}) {
    try {
      let query = `
        SELECT m.*, p.title as property_name, u.name as tenant_name,
               l.id as landlord_id, l.name as landlord_name
        FROM maintenance_requests m
        JOIN properties p ON m.property_id = p.id
        JOIN users u ON m.tenant_id = u.id
        JOIN users l ON p.landlord_id = l.id
      `;
      
      const queryParams = [];
      
      // Build WHERE clause based on filters
      if (Object.keys(filters).length > 0) {
        const whereConditions = [];
        
        if (filters.tenant_id) {
          whereConditions.push('m.tenant_id = ?');
          queryParams.push(filters.tenant_id);
        }
        
        if (filters.property_id) {
          whereConditions.push('m.property_id = ?');
          queryParams.push(filters.property_id);
        }
        
        if (filters.status) {
          whereConditions.push('m.status = ?');
          queryParams.push(filters.status);
        }
        
        if (filters.priority) {
          whereConditions.push('m.priority = ?');
          queryParams.push(filters.priority);
        }
        
        if (filters.landlord_id) {
          whereConditions.push('p.landlord_id = ?');
          queryParams.push(filters.landlord_id);
        }
        
        if (whereConditions.length > 0) {
          query += ' WHERE ' + whereConditions.join(' AND ');
        }
      }
      
      // Add ordering
      query += ' ORDER BY m.request_date DESC';
      
      const [rows] = await pool.execute(query, queryParams);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Update maintenance request
  static async update(id, maintenanceData) {
    try {
      const updateFields = [];
      const values = [];

      // Build dynamic update query
      Object.keys(maintenanceData).forEach(key => {
        if (key !== 'id') {
          updateFields.push(`${key} = ?`);
          values.push(maintenanceData[key]);
        }
      });

      // If status is being updated to completed, set completion date
      if (maintenanceData.status === 'completed' && !maintenanceData.completion_date) {
        updateFields.push('completion_date = ?');
        values.push(new Date());
      }

      values.push(id);

      const [result] = await pool.execute(
        `UPDATE maintenance_requests SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
        values
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete maintenance request
  static async delete(id) {
    try {
      const [result] = await pool.execute('DELETE FROM maintenance_requests WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get maintenance requests by tenant ID
  static async findByTenantId(tenantId) {
    try {
      const [rows] = await pool.execute(
        `SELECT m.*, p.title as property_name
         FROM maintenance_requests m
         JOIN properties p ON m.property_id = p.id
         WHERE m.tenant_id = ?
         ORDER BY m.request_date DESC`,
        [tenantId]
      );
      
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get maintenance requests by property ID
  static async findByPropertyId(propertyId) {
    try {
      const [rows] = await pool.execute(
        `SELECT m.*, u.name as tenant_name
         FROM maintenance_requests m
         JOIN users u ON m.tenant_id = u.id
         WHERE m.property_id = ?
         ORDER BY m.request_date DESC`,
        [propertyId]
      );
      
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get maintenance requests by landlord ID
  static async findByLandlordId(landlordId) {
    try {
      const [rows] = await pool.execute(
        `SELECT m.*, p.title as property_name, u.name as tenant_name
         FROM maintenance_requests m
         JOIN properties p ON m.property_id = p.id
         JOIN users u ON m.tenant_id = u.id
         WHERE p.landlord_id = ?
         ORDER BY m.request_date DESC`,
        [landlordId]
      );
      
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Add comment to maintenance request
  static async addComment(requestId, userId, comment) {
    try {
      const [result] = await pool.execute(
        `INSERT INTO maintenance_comments 
        (request_id, user_id, comment) 
        VALUES (?, ?, ?)`,
        [requestId, userId, comment]
      );

      return { id: result.insertId, request_id: requestId, user_id: userId, comment };
    } catch (error) {
      throw error;
    }
  }

  // Get comments for maintenance request
  static async getComments(requestId) {
    try {
      const [rows] = await pool.execute(
        `SELECT c.*, u.name as user_name, u.role as user_role
         FROM maintenance_comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.request_id = ?
         ORDER BY c.created_at ASC`,
        [requestId]
      );
      
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Maintenance; 