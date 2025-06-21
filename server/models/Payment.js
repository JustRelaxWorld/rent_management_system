const { pool } = require('../config/db');

class Payment {
  constructor(payment) {
    this.id = payment.id;
    this.invoice_id = payment.invoice_id;
    this.tenant_id = payment.tenant_id;
    this.amount = payment.amount;
    this.payment_date = payment.payment_date;
    this.payment_method = payment.payment_method; // mpesa, bank, cash
    this.transaction_id = payment.transaction_id; // M-Pesa transaction ID
    this.status = payment.status; // success, pending, failed
    this.notes = payment.notes;
    this.created_at = payment.created_at;
    this.updated_at = payment.updated_at;
  }

  // Create a new payment
  static async create(paymentData) {
    try {
      const [result] = await pool.execute(
        `INSERT INTO payments 
        (invoice_id, tenant_id, amount, payment_date, payment_method, transaction_id, status, notes) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          paymentData.invoice_id,
          paymentData.tenant_id,
          paymentData.amount,
          paymentData.payment_date || new Date(),
          paymentData.payment_method,
          paymentData.transaction_id,
          paymentData.status || 'pending',
          paymentData.notes || ''
        ]
      );

      // If payment is successful, update invoice status
      if (paymentData.status === 'success') {
        await pool.execute(
          'UPDATE invoices SET status = "paid", updated_at = NOW() WHERE id = ?',
          [paymentData.invoice_id]
        );
      }

      return { id: result.insertId, ...paymentData };
    } catch (error) {
      throw error;
    }
  }

  // Find payment by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute('SELECT * FROM payments WHERE id = ?', [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new Payment(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find payment by transaction ID (M-Pesa)
  static async findByTransactionId(transactionId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM payments WHERE transaction_id = ?',
        [transactionId]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      return new Payment(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Get all payments
  static async findAll(filters = {}) {
    try {
      let query = `
        SELECT p.*, i.due_date, i.description as invoice_description, 
               u.name as tenant_name, pr.title as property_name
        FROM payments p
        JOIN invoices i ON p.invoice_id = i.id
        JOIN users u ON p.tenant_id = u.id
        JOIN properties pr ON i.property_id = pr.id
      `;
      
      const queryParams = [];
      
      // Build WHERE clause based on filters
      if (Object.keys(filters).length > 0) {
        const whereConditions = [];
        
        if (filters.tenant_id) {
          whereConditions.push('p.tenant_id = ?');
          queryParams.push(filters.tenant_id);
        }
        
        if (filters.invoice_id) {
          whereConditions.push('p.invoice_id = ?');
          queryParams.push(filters.invoice_id);
        }
        
        if (filters.status) {
          whereConditions.push('p.status = ?');
          queryParams.push(filters.status);
        }
        
        if (filters.payment_method) {
          whereConditions.push('p.payment_method = ?');
          queryParams.push(filters.payment_method);
        }
        
        if (filters.date_from) {
          whereConditions.push('p.payment_date >= ?');
          queryParams.push(filters.date_from);
        }
        
        if (filters.date_to) {
          whereConditions.push('p.payment_date <= ?');
          queryParams.push(filters.date_to);
        }
        
        if (filters.landlord_id) {
          whereConditions.push('pr.landlord_id = ?');
          queryParams.push(filters.landlord_id);
        }
        
        if (whereConditions.length > 0) {
          query += ' WHERE ' + whereConditions.join(' AND ');
        }
      }
      
      // Add ordering
      query += ' ORDER BY p.payment_date DESC';
      
      const [rows] = await pool.execute(query, queryParams);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Update payment
  static async update(id, paymentData) {
    try {
      const updateFields = [];
      const values = [];

      // Build dynamic update query
      Object.keys(paymentData).forEach(key => {
        if (key !== 'id') {
          updateFields.push(`${key} = ?`);
          values.push(paymentData[key]);
        }
      });

      values.push(id);

      const [result] = await pool.execute(
        `UPDATE payments SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
        values
      );

      // If payment status is updated to success, update invoice status
      if (paymentData.status === 'success') {
        const [paymentRows] = await pool.execute('SELECT invoice_id FROM payments WHERE id = ?', [id]);
        if (paymentRows.length > 0) {
          await pool.execute(
            'UPDATE invoices SET status = "paid", updated_at = NOW() WHERE id = ?',
            [paymentRows[0].invoice_id]
          );
        }
      }

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete payment
  static async delete(id) {
    try {
      const [result] = await pool.execute('DELETE FROM payments WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get payments by tenant ID
  static async findByTenantId(tenantId) {
    try {
      const [rows] = await pool.execute(
        `SELECT p.*, i.due_date, i.description as invoice_description, pr.title as property_name
         FROM payments p
         JOIN invoices i ON p.invoice_id = i.id
         JOIN properties pr ON i.property_id = pr.id
         WHERE p.tenant_id = ?
         ORDER BY p.payment_date DESC`,
        [tenantId]
      );
      
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get payments by invoice ID
  static async findByInvoiceId(invoiceId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM payments WHERE invoice_id = ? ORDER BY payment_date DESC',
        [invoiceId]
      );
      
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Process M-Pesa payment
  static async processMpesaPayment(mpesaData) {
    try {
      // Check if transaction already exists
      const existingPayment = await Payment.findByTransactionId(mpesaData.TransID);
      if (existingPayment) {
        return { success: false, message: 'Transaction already processed' };
      }

      // Find invoice by ID
      const [invoiceRows] = await pool.execute(
        'SELECT * FROM invoices WHERE id = ?',
        [mpesaData.invoice_id]
      );

      if (invoiceRows.length === 0) {
        return { success: false, message: 'Invoice not found' };
      }

      const invoice = invoiceRows[0];

      // Create payment record
      const paymentData = {
        invoice_id: invoice.id,
        tenant_id: invoice.tenant_id,
        amount: mpesaData.Amount,
        payment_date: new Date(),
        payment_method: 'mpesa',
        transaction_id: mpesaData.TransID,
        status: 'success',
        notes: `M-Pesa payment from ${mpesaData.FirstName} ${mpesaData.LastName}, Phone: ${mpesaData.MSISDN}`
      };

      const payment = await Payment.create(paymentData);

      // Update invoice status
      await pool.execute(
        'UPDATE invoices SET status = "paid", updated_at = NOW() WHERE id = ?',
        [invoice.id]
      );

      return { 
        success: true, 
        payment_id: payment.id,
        message: 'Payment processed successfully' 
      };
    } catch (error) {
      console.error('Error processing M-Pesa payment:', error);
      return { success: false, message: error.message };
    }
  }

  // Generate receipt for payment
  static async generateReceipt(paymentId) {
    try {
      const [rows] = await pool.execute(
        `SELECT p.*, i.due_date, i.description as invoice_description, 
                u.name as tenant_name, u.email as tenant_email,
                pr.title as property_name, pr.address as property_address,
                l.name as landlord_name
         FROM payments p
         JOIN invoices i ON p.invoice_id = i.id
         JOIN users u ON p.tenant_id = u.id
         JOIN properties pr ON i.property_id = pr.id
         JOIN users l ON pr.landlord_id = l.id
         WHERE p.id = ?`,
        [paymentId]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      const paymentData = rows[0];
      
      // Create receipt object
      const receipt = {
        receipt_number: `RCT-${paymentData.id.toString().padStart(6, '0')}`,
        payment_id: paymentData.id,
        invoice_id: paymentData.invoice_id,
        tenant_name: paymentData.tenant_name,
        tenant_email: paymentData.tenant_email,
        property_name: paymentData.property_name,
        property_address: paymentData.property_address,
        landlord_name: paymentData.landlord_name,
        amount: paymentData.amount,
        payment_date: paymentData.payment_date,
        payment_method: paymentData.payment_method,
        transaction_id: paymentData.transaction_id,
        description: paymentData.invoice_description,
        status: paymentData.status,
        generated_at: new Date()
      };
      
      return receipt;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Payment; 