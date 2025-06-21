const { pool } = require('../config/db');

class Notification {
  constructor(notification) {
    this.id = notification.id;
    this.user_id = notification.user_id;
    this.title = notification.title;
    this.message = notification.message;
    this.type = notification.type; // invoice, payment, maintenance, system
    this.related_id = notification.related_id; // ID of related entity (invoice_id, payment_id, etc.)
    this.is_read = notification.is_read;
    this.created_at = notification.created_at;
    this.updated_at = notification.updated_at;
  }

  // Create a new notification
  static async create(notificationData) {
    try {
      const [result] = await pool.execute(
        `INSERT INTO notifications 
        (user_id, title, message, type, related_id, is_read) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          notificationData.user_id,
          notificationData.title,
          notificationData.message,
          notificationData.type,
          notificationData.related_id || null,
          notificationData.is_read || false
        ]
      );

      return { id: result.insertId, ...notificationData };
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

  // Get notifications by user ID
  static async findByUserId(userId, limit = 50, offset = 0) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [userId, limit, offset]
      );
      
      return rows.map(row => new Notification(row));
    } catch (error) {
      throw error;
    }
  }

  // Get unread notifications count by user ID
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

  // Mark notification as read
  static async markAsRead(id) {
    try {
      const [result] = await pool.execute(
        'UPDATE notifications SET is_read = true, updated_at = NOW() WHERE id = ?',
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
        'UPDATE notifications SET is_read = true, updated_at = NOW() WHERE user_id = ? AND is_read = false',
        [userId]
      );
      
      return result.affectedRows;
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

  // Create invoice notification
  static async createInvoiceNotification(invoice, tenant) {
    try {
      const notificationData = {
        user_id: tenant.id,
        title: 'New Invoice',
        message: `You have a new invoice of ${invoice.amount} due on ${new Date(invoice.due_date).toLocaleDateString()}`,
        type: 'invoice',
        related_id: invoice.id
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
        related_id: payment.id
      };
      
      await Notification.create(tenantNotification);
      
      // Notification for landlord
      const landlordNotification = {
        user_id: landlord.id,
        title: 'Payment Received',
        message: `Payment of ${payment.amount} received from ${tenant.name}.`,
        type: 'payment',
        related_id: payment.id
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
      // Notification for landlord when tenant creates request
      if (maintenance.status === 'pending') {
        const landlordNotification = {
          user_id: landlord.id,
          title: 'New Maintenance Request',
          message: `${tenant.name} has submitted a new maintenance request for ${property.title}.`,
          type: 'maintenance',
          related_id: maintenance.id
        };
        
        await Notification.create(landlordNotification);
      }
      
      // Notification for tenant when status changes
      else {
        const tenantNotification = {
          user_id: tenant.id,
          title: 'Maintenance Update',
          message: `Your maintenance request for ${property.title} has been updated to ${maintenance.status}.`,
          type: 'maintenance',
          related_id: maintenance.id
        };
        
        await Notification.create(tenantNotification);
      }
      
      return true;
    } catch (error) {
      throw error;
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