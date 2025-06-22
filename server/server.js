const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { testConnection } = require('./config/db');
const User = require('./models/User');

// Load environment variables
dotenv.config();

// Route files
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const propertyRoutes = require('./routes/property.routes');
const invoiceRoutes = require('./routes/invoice.routes');
const paymentRoutes = require('./routes/payment.routes');
const maintenanceRoutes = require('./routes/maintenance.routes');
const notificationRoutes = require('./routes/notification.routes');
const applicationRoutes = require('./routes/application.routes');

// Initialize database
const initializeDB = async () => {
  // Connect to database
  const connected = await testConnection();
  
  if (connected) {
    // Create tables
    await User.createTable();
    console.log('Database tables initialized');
  } else {
    console.error('Failed to connect to database');
    process.exit(1);
  }
};

// Initialize database
initializeDB().catch(err => {
  console.error('Database initialization error:', err);
  process.exit(1);
});

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/notifications', notificationRoutes);

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'build', 'index.html'));
  });
}

// Define port
const PORT = process.env.PORT || 5001;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 