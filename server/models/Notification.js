const { pool } = require('../config/db');

class Notification {
  constructor(notification) {
    this.id = notification.id;
    this.user_id = notification.user_id;
    this.title = notification.title;
    this.message = notification.message;
    this.type = notification.type; // application, payment, maintenance, etc.
    this.reference_id = notification.reference_id;
    this.is_read = notification.is_read;
    this.created_at = notification.created_at;
  }

  // Create notifications table if it doesn't exist
  static async createTable() {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS notifications (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          title VARCHAR(100) NOT NULL,
          message TEXT NOT NULL,
          type VARCHAR(50),
          reference_id INT,
          is_read BOOLEAN DEFAULT false,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      console.log('Notifications table created or already exists');
      return true;
    } catch (error) {
      console.error('Error creating notifications table:', error);
      throw error;
    }
  }

  // Create a new notification
  static async create(notificationData) {
    try {
      const [result] = await pool.execute(
        `INSERT INTO notifications 
        (user_id, title, message, type, reference_id) 
        VALUES (?, ?, ?, ?, ?)`,
        [
          notificationData.user_id,
          notificationData.title,
          notificationData.message,
          notificationData.type || null,
          notificationData.reference_id || null
        ]
      );

      return { id: result.insertId, ...notificationData, is_read: false };
    } catch (error) {
      throw error;
    }
  }

  // Get notifications for a user
  static async findByUserId(userId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
      
      return rows.map(row => new Notification(row));
    } catch (error) {
      throw error;
    }
  }

  // Mark notification as read
  static async markAsRead(id) {
    try {
      const [result] = await pool.execute(
        'UPDATE notifications SET is_read = true WHERE id = ?',
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId) {
    try {
      const [result] = await pool.execute(
        'UPDATE notifications SET is_read = true WHERE user_id = ?',
        [userId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete notification
  static async delete(id) {
    try {
      const [result] = await pool.execute('DELETE FROM notifications WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get unread notification count for a user
  static async getUnreadCount(userId) {
    try {
      const [rows] = await pool.execute(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = false',
        [userId]
      );
      
      return rows[0].count;
    } catch (error) {
      throw error;
    }
  }

  // Find notification by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute('SELECT * FROM notifications WHERE id = ?', [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new Notification(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Create invoice notification
  static async createInvoiceNotification(invoice, tenant) {
    try {
      const notificationData = {
        user_id: tenant.id,
        title: 'New Invoice',
        message: `You have a new invoice of ${invoice.amount} due on ${new Date(invoice.due_date).toLocaleDateString()}`,
        type: 'invoice',
        reference_id: invoice.id
      };
      
      return await Notification.create(notificationData);
    } catch (error) {
      throw error;
    }
  }

  // Create payment notification
  static async createPaymentNotification(payment, invoice, tenant, landlord) {
    try {
      // Notification for tenant
      const tenantNotification = {
        user_id: tenant.id,
        title: 'Payment Confirmed',
        message: `Your payment of ${payment.amount} has been confirmed.`,
        type: 'payment',
        reference_id: payment.id
      };
      
      await Notification.create(tenantNotification);
      
      // Notification for landlord
      const landlordNotification = {
        user_id: landlord.id,
        title: 'Payment Received',
        message: `Payment of ${payment.amount} received from ${tenant.name}.`,
        type: 'payment',
        reference_id: payment.id
      };
      
      await Notification.create(landlordNotification);
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Create maintenance notification
  static async createMaintenanceNotification(maintenance, property, tenant, landlord) {
    try {
      console.log('Creating maintenance notification with:', {
        maintenance: maintenance ? { id: maintenance.id, status: maintenance.status } : 'null',
        property: property ? { id: property.id, title: property.title } : 'null',
        tenant: tenant ? { id: tenant.id, name: tenant.name } : 'null',
        landlord: landlord ? { id: landlord.id, name: landlord.name } : 'null'
      });
      
      // Check if all required data is available
      if (!maintenance || !property || !tenant || !landlord) {
        console.error('Missing data for notification:', { maintenance, property, tenant, landlord });
        return false;
      }
      
      // Notification for landlord when tenant creates request
      if (maintenance.status === 'pending') {
        console.log('Creating notification for landlord about new maintenance request');
        const landlordNotification = {
          user_id: landlord.id,
          title: 'New Maintenance Request',
          message: `${tenant.name} has submitted a new maintenance request for ${property.title}.`,
          type: 'maintenance',
          reference_id: maintenance.id
        };
        
        await Notification.create(landlordNotification);
      }
      
      // Notification for tenant when status changes
      else {
        console.log('Creating notification for tenant about status update');
        const tenantNotification = {
          user_id: tenant.id,
          title: 'Maintenance Update',
          message: `Your maintenance request for ${property.title} has been updated to ${maintenance.status}.`,
          type: 'maintenance',
          reference_id: maintenance.id
        };
        
        await Notification.create(tenantNotification);
      }
      
      return true;
    } catch (error) {
      console.error('Error creating maintenance notification:', error);
      return false; // Don't throw the error, just return false to prevent breaking the main flow
    }
  }

  // Send email notification
  static async sendEmailNotification(notification, user) {
    try {
      // This would integrate with an email service like SendGrid or Nodemailer
      console.log(`Email notification to ${user.email}: ${notification.title} - ${notification.message}`);
      return true;
    } catch (error) {
      console.error('Error sending email notification:', error);
      return false;
    }
  }

  // Send SMS notification
  static async sendSmsNotification(notification, user) {
    try {
      // This would integrate with an SMS service like Twilio or Africa's Talking
      console.log(`SMS notification to ${user.phone}: ${notification.title} - ${notification.message}`);
      return true;
    } catch (error) {
      console.error('Error sending SMS notification:', error);
      return false;
    }
  }
}

module.exports = Notification; 