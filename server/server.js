const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./config/db');
const User = require('./models/User');
const cookieParser = require('cookie-parser');

// Load environment variables
const dotenv = require('dotenv');
dotenv.config();

// Route files
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const propertyRoutes = require('./routes/property.routes');
const applicationRoutes = require('./routes/application.routes');
const maintenanceRoutes = require('./routes/maintenance.routes');
const paymentRoutes = require('./routes/payment.routes');
const invoiceRoutes = require('./routes/invoice.routes');
const notificationRoutes = require('./routes/notification.routes');
const mpesaRoutes = require('./routes/mpesa.routes');
const workosAuthRoutes = require('./routes/workos-auth.routes');
const avatarRoutes = require('./routes/avatar.routes');

// Initialize database
const initializeDB = async () => {
  // Connect to database
  const connected = await db.testConnection();
  
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
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://myapp.com' 
    : ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));
// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/users/avatar', avatarRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/mpesa', mpesaRoutes);

// WorkOS Auth routes
app.use('/auth', workosAuthRoutes);

db.testConnection()
  .then(connected => {
    if (connected) {
      console.log('Database connected successfully');
    } else {
      console.error('Database connection failed');
    }
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'build', 'index.html'));
  });
}

// Define port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WorkOS Callback URL: http://localhost:${PORT}/auth/callback`);
}); 