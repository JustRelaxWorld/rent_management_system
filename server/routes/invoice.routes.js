const express = require('express');
const {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getTenantInvoices,
  getPropertyInvoices,
  generateMonthlyInvoices
} = require('../controllers/invoice.controller');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protected routes
router.use(protect);

// Routes for all authenticated users
router.get('/', getInvoices);
router.get('/:id', getInvoice);

// Tenant/Property specific routes
router.get('/tenant/:id', getTenantInvoices);
router.get('/property/:id', getPropertyInvoices);

// Landlord/Admin only routes
router.post('/', authorize('landlord', 'admin'), createInvoice);
router.put('/:id', authorize('landlord', 'admin'), updateInvoice);
router.delete('/:id', authorize('landlord', 'admin'), deleteInvoice);

// Admin only routes
router.post('/generate-monthly', authorize('admin'), generateMonthlyInvoices);

module.exports = router; 