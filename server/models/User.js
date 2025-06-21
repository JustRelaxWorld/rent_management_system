const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class User {
  constructor(user) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.password = user.password;
    this.phone = user.phone || '';
    this.role = user.role; // tenant, landlord, admin
    this.createdAt = user.createdAt;
  }

  // Create users table
  static async createTable() {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          phone VARCHAR(20),
          role ENUM('tenant', 'landlord', 'admin') DEFAULT 'tenant',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Users table created or already exists');
      return true;
    } catch (error) {
      console.error('Error creating users table:', error);
      throw error;
    }
  }

  // Create a new user
  static async create(userData) {
    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      const [result] = await pool.execute(
        'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
        [userData.name, userData.email, hashedPassword, userData.role || 'tenant', userData.phone || '']
      );

      // Return a proper User instance
      return new User({
        id: result.insertId,
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        phone: userData.phone || '',
        role: userData.role || 'tenant',
        createdAt: new Date()
      });
    } catch (error) {
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new User(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new User(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Update user
  static async update(id, userData) {
    try {
      const updateFields = [];
      const values = [];

      // Build dynamic update query
      Object.keys(userData).forEach(key => {
        if (key !== 'id' && key !== 'password') {
          updateFields.push(`${key} = ?`);
          values.push(userData[key]);
        }
      });

      // Handle password update separately
      if (userData.password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        updateFields.push('password = ?');
        values.push(hashedPassword);
      }

      values.push(id);

      const [result] = await pool.execute(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
        values
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete user
  static async delete(id) {
    try {
      const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Match password
  async matchPassword(enteredPassword) {
    try {
      return await bcrypt.compare(enteredPassword, this.password);
    } catch (error) {
      throw error;
    }
  }

  // Generate JWT Token
  getSignedJwtToken() {
    try {
      console.log('Generating JWT token for user:', { id: this.id, role: this.role });
      const token = jwt.sign(
        { id: this.id, role: this.role },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: process.env.JWT_EXPIRE || '30d' }
      );
      console.log('JWT token generated successfully');
      return token;
    } catch (error) {
      console.error('Error generating JWT token:', error);
      throw error;
    }
  }
}

module.exports = User; 