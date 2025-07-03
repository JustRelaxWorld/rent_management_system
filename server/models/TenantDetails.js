const { pool } = require('../config/db');

class TenantDetails {
  constructor(details) {
    this.id = details.id;
    this.user_id = details.user_id;
    this.id_number = details.id_number;
    this.lease_agreement_path = details.lease_agreement_path;
    this.created_at = details.created_at;
    this.updated_at = details.updated_at;
  }

  // Create a new tenant details entry
  static async create(detailsData) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO tenant_details (user_id, id_number, lease_agreement_path) VALUES (?, ?, ?)',
        [detailsData.user_id, detailsData.id_number, detailsData.lease_agreement_path || null]
      );

      return new TenantDetails({
        id: result.insertId,
        ...detailsData,
        created_at: new Date(),
        updated_at: new Date()
      });
    } catch (error) {
      throw error;
    }
  }

  // Find tenant details by user ID
  static async findByUserId(userId) {
    try {
      const [rows] = await pool.execute('SELECT * FROM tenant_details WHERE user_id = ?', [userId]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new TenantDetails(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Update tenant details
  static async update(userId, detailsData) {
    try {
      const updateFields = [];
      const values = [];

      // Build dynamic update query
      Object.keys(detailsData).forEach(key => {
        if (key !== 'id' && key !== 'user_id') {
          updateFields.push(`${key} = ?`);
          values.push(detailsData[key]);
        }
      });

      values.push(userId);

      const [result] = await pool.execute(
        `UPDATE tenant_details SET ${updateFields.join(', ')} WHERE user_id = ?`,
        values
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete tenant details
  static async delete(userId) {
    try {
      const [result] = await pool.execute('DELETE FROM tenant_details WHERE user_id = ?', [userId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = TenantDetails; 