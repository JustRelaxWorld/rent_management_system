const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Use the same JWT secret as in middleware/auth.js
const JWT_SECRET = 'rent-management-secret-key';
const JWT_EXPIRE = '30d';

class User {
  constructor(user) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.password = user.password;
    this.phone = user.phone || '';
    this.avatar = user.avatar || null;
    this.role = user.role; // tenant, landlord, admin
    this.theme_preference = user.theme_preference || null;
    this.workos_user_id = user.workos_user_id || null;
    this.auth_provider = user.auth_provider || null;
    this.auth_provider_id = user.auth_provider_id || null;
    this.verification_code = user.verification_code || null;
    this.verification_code_expires = user.verification_code_expires || null;
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
          avatar VARCHAR(255),
          theme_preference ENUM('light', 'dark') NULL,
          role ENUM('tenant', 'landlord', 'admin') DEFAULT 'tenant',
          workos_user_id VARCHAR(255),
          auth_provider ENUM('google', 'apple', 'email', 'workos'),
          auth_provider_id VARCHAR(255),
          verification_code VARCHAR(10),
          verification_code_expires DATETIME,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Users table created or already exists');
      
      // Check if phone column exists, add it if it doesn't
      try {
        await pool.query(`
          SELECT phone FROM users LIMIT 1
        `);
        console.log('Phone column exists in users table');
      } catch (error) {
        if (error.message.includes("Unknown column 'phone'")) {
          console.log('Adding phone column to users table');
          await pool.query(`
            ALTER TABLE users ADD COLUMN phone VARCHAR(20) AFTER password
          `);
          console.log('Phone column added to users table');
        } else {
          throw error;
        }
      }
      
      // Check if avatar column exists, add it if it doesn't
      try {
        await pool.query(`
          SELECT avatar FROM users LIMIT 1
        `);
        console.log('Avatar column exists in users table');
      } catch (error) {
        if (error.message.includes("Unknown column 'avatar'")) {
          console.log('Adding avatar column to users table');
          await pool.query(`
            ALTER TABLE users ADD COLUMN avatar VARCHAR(255) AFTER phone
          `);
          console.log('Avatar column added to users table');
        } else {
          throw error;
        }
      }
      
      // Check if theme_preference column exists, add it if it doesn't
      try {
        await pool.query(`
          SELECT theme_preference FROM users LIMIT 1
        `);
        console.log('theme_preference column exists in users table');
      } catch (error) {
        if (error.message.includes("Unknown column 'theme_preference'")) {
          console.log('Adding theme_preference column to users table');
          await pool.query(`
            ALTER TABLE users ADD COLUMN theme_preference ENUM('light', 'dark') NULL AFTER avatar
          `);
          console.log('theme_preference column added to users table');
        } else {
          throw error;
        }
      }
      
      // Check if verification_code column exists, add it if it doesn't
      try {
        await pool.query(`
          SELECT verification_code FROM users LIMIT 1
        `);
        console.log('verification_code column exists in users table');
      } catch (error) {
        if (error.message.includes("Unknown column 'verification_code'")) {
          console.log('Adding verification_code column to users table');
          await pool.query(`
            ALTER TABLE users ADD COLUMN verification_code VARCHAR(10) AFTER auth_provider
          `);
          console.log('verification_code column added to users table');
        } else {
          throw error;
        }
      }
      
      // Check if verification_code_expires column exists, add it if it doesn't
      try {
        await pool.query(`
          SELECT verification_code_expires FROM users LIMIT 1
        `);
        console.log('verification_code_expires column exists in users table');
      } catch (error) {
        if (error.message.includes("Unknown column 'verification_code_expires'")) {
          console.log('Adding verification_code_expires column to users table');
          await pool.query(`
            ALTER TABLE users ADD COLUMN verification_code_expires DATETIME AFTER verification_code
          `);
          console.log('verification_code_expires column added to users table');
        } else {
          throw error;
        }
      }
      
      // Check if workos_user_id column exists, add it if it doesn't
      try {
        await pool.query(`
          SELECT workos_user_id FROM users LIMIT 1
        `);
        console.log('workos_user_id column exists in users table');
      } catch (error) {
        if (error.message.includes("Unknown column 'workos_user_id'")) {
          console.log('Adding workos_user_id column to users table');
          await pool.query(`
            ALTER TABLE users ADD COLUMN workos_user_id VARCHAR(255) AFTER role
          `);
          console.log('workos_user_id column added to users table');
        } else {
          throw error;
        }
      }
      
      // Check if auth_provider column exists, add it if it doesn't
      try {
        await pool.query(`
          SELECT auth_provider FROM users LIMIT 1
        `);
        console.log('auth_provider column exists in users table');
      } catch (error) {
        if (error.message.includes("Unknown column 'auth_provider'")) {
          console.log('Adding auth_provider column to users table');
          await pool.query(`
            ALTER TABLE users ADD COLUMN auth_provider ENUM('google', 'apple', 'email', 'workos') AFTER workos_user_id
          `);
          console.log('auth_provider column added to users table');
        } else {
          throw error;
        }
      }
      
      // Update auth_provider column to include 'workos' if needed
      try {
        await pool.query(`
          ALTER TABLE users MODIFY COLUMN auth_provider ENUM('google', 'apple', 'email', 'workos')
        `);
        console.log('auth_provider column updated to include workos');
      } catch (error) {
        console.error('Error updating auth_provider column:', error);
        // Continue even if this fails
      }
      
      // Check if auth_provider_id column exists, add it if it doesn't
      try {
        await pool.query(`
          SELECT auth_provider_id FROM users LIMIT 1
        `);
        console.log('auth_provider_id column exists in users table');
      } catch (error) {
        if (error.message.includes("Unknown column 'auth_provider_id'")) {
          console.log('Adding auth_provider_id column to users table');
          await pool.query(`
            ALTER TABLE users ADD COLUMN auth_provider_id VARCHAR(255) AFTER auth_provider
          `);
          console.log('auth_provider_id column added to users table');
        } else {
          throw error;
        }
      }
      
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
        'INSERT INTO users (name, email, password, role, phone, avatar, theme_preference, workos_user_id, auth_provider, auth_provider_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          userData.name, 
          userData.email, 
          hashedPassword, 
          userData.role || 'tenant', 
          userData.phone || '', 
          userData.avatar || null,
          userData.theme_preference || null,
          userData.workos_user_id || null,
          userData.auth_provider || null,
          userData.auth_provider_id || null
        ]
      );

      // Return a proper User instance
      return new User({
        id: result.insertId,
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        phone: userData.phone || '',
        avatar: userData.avatar || null,
        theme_preference: userData.theme_preference || null,
        workos_user_id: userData.workos_user_id || null,
        auth_provider: userData.auth_provider || null,
        auth_provider_id: userData.auth_provider_id || null,
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
        JWT_SECRET,
        { expiresIn: JWT_EXPIRE }
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