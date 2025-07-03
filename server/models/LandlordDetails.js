const { pool } = require('../config/db');

class LandlordDetails {
  constructor(details) {
    this.id = details.id;
    this.user_id = details.user_id;
    this.mpesa_number = details.mpesa_number;
    this.ownership_document_path = details.ownership_document_path;
    this.created_at = details.created_at;
    this.updated_at = details.updated_at;
  }

  // Create a new landlord details entry
  static async create(detailsData) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO landlord_details (user_id, mpesa_number, ownership_document_path) VALUES (?, ?, ?)',
        [detailsData.user_id, detailsData.mpesa_number, detailsData.ownership_document_path]
      );

      return new LandlordDetails({
        id: result.insertId,
        ...detailsData,
        created_at: new Date(),
        updated_at: new Date()
      });
    } catch (error) {
      throw error;
    }
  }

  // Find landlord details by user ID
  static async findByUserId(userId) {
    try {
      const [rows] = await pool.execute('SELECT * FROM landlord_details WHERE user_id = ?', [userId]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new LandlordDetails(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Update landlord details
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
        `UPDATE landlord_details SET ${updateFields.join(', ')} WHERE user_id = ?`,
        values
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete landlord details
  static async delete(userId) {
    try {
      const [result] = await pool.execute('DELETE FROM landlord_details WHERE user_id = ?', [userId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = LandlordDetails; 