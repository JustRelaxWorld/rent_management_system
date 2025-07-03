const { pool } = require('../config/db');

class Invoice {
  constructor(invoice) {
    this.id = invoice.id;
    this.tenant_id = invoice.tenant_id;
    this.property_id = invoice.property_id;
    this.amount = invoice.amount;
    this.due_date = invoice.due_date;
    this.status = invoice.status; // pending, paid, overdue
    this.description = invoice.description;
    this.created_at = invoice.created_at;
    this.updated_at = invoice.updated_at;
  }

  // Create a new invoice
  static async create(invoiceData) {
    try {
      const [result] = await pool.execute(
        `INSERT INTO invoices 
        (tenant_id, property_id, amount, due_date, status, description) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          invoiceData.tenant_id,
          invoiceData.property_id,
          invoiceData.amount,
          invoiceData.due_date,
          invoiceData.status || 'pending',
          invoiceData.description || 'Monthly Rent'
        ]
      );

      return { id: result.insertId, ...invoiceData };
    } catch (error) {
      throw error;
    }
  }

  // Find invoice by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute('SELECT * FROM invoices WHERE id = ?', [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new Invoice(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Get all invoices
  static async findAll(filters = {}) {
    try {
      let query = `
        SELECT i.*, p.title as property_name, u.name as tenant_name 
        FROM invoices i
        JOIN properties p ON i.property_id = p.id
        JOIN users u ON i.tenant_id = u.id
      `;
      
      const queryParams = [];
      
      // Build WHERE clause based on filters
      if (Object.keys(filters).length > 0) {
        const whereConditions = [];
        
        if (filters.tenant_id) {
          whereConditions.push('i.tenant_id = ?');
          queryParams.push(filters.tenant_id);
        }
        
        if (filters.property_id) {
          whereConditions.push('i.property_id = ?');
          queryParams.push(filters.property_id);
        }
        
        if (filters.status) {
          whereConditions.push('i.status = ?');
          queryParams.push(filters.status);
        }
        
        if (filters.due_date_from) {
          whereConditions.push('i.due_date >= ?');
          queryParams.push(filters.due_date_from);
        }
        
        if (filters.due_date_to) {
          whereConditions.push('i.due_date <= ?');
          queryParams.push(filters.due_date_to);
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
      query += ' ORDER BY i.due_date DESC';
      
      const [rows] = await pool.execute(query, queryParams);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Update invoice
  static async update(id, invoiceData) {
    try {
      const updateFields = [];
      const values = [];

      // Build dynamic update query
      Object.keys(invoiceData).forEach(key => {
        if (key !== 'id') {
          updateFields.push(`${key} = ?`);
          values.push(invoiceData[key]);
        }
      });

      values.push(id);

      const [result] = await pool.execute(
        `UPDATE invoices SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
        values
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete invoice
  static async delete(id) {
    try {
      const [result] = await pool.execute('DELETE FROM invoices WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get invoices by tenant ID
  static async findByTenantId(tenantId) {
    try {
      const [rows] = await pool.execute(
        `SELECT i.*, p.title as property_name 
         FROM invoices i
         JOIN properties p ON i.property_id = p.id
         WHERE i.tenant_id = ?
         ORDER BY i.due_date DESC`,
        [tenantId]
      );
      
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get invoices by property ID
  static async findByPropertyId(propertyId) {
    try {
      const [rows] = await pool.execute(
        `SELECT i.*, u.name as tenant_name 
         FROM invoices i
         JOIN users u ON i.tenant_id = u.id
         WHERE i.property_id = ?
         ORDER BY i.due_date DESC`,
        [propertyId]
      );
      
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Generate monthly invoices for all active leases
  static async generateMonthlyInvoices() {
    try {
      // Get all active leases
      const [leases] = await pool.execute(
        `SELECT l.*, p.rent_amount, u.name as tenant_name, p.title as property_name
         FROM leases l
         JOIN properties p ON l.property_id = p.id
         JOIN users u ON l.tenant_id = u.id
         WHERE l.status = 'active'
           AND l.end_date >= CURDATE()`
      );
      
      const invoices = [];
      
      // Create invoice for each lease
      for (const lease of leases) {
        // Calculate due date (1st of next month)
        const today = new Date();
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        const dueDate = nextMonth.toISOString().split('T')[0];
        
        // Create invoice
        const [result] = await pool.execute(
          `INSERT INTO invoices 
          (tenant_id, property_id, amount, due_date, status, description) 
          VALUES (?, ?, ?, ?, 'pending', ?)`,
          [
            lease.tenant_id,
            lease.property_id,
            lease.rent_amount,
            dueDate,
            `Monthly rent for ${lease.property_name}`
          ]
        );
        
        invoices.push({
          id: result.insertId,
          tenant_id: lease.tenant_id,
          tenant_name: lease.tenant_name,
          property_id: lease.property_id,
          property_name: lease.property_name,
          amount: lease.rent_amount,
          due_date: dueDate
        });
      }
      
      return invoices;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Invoice; 