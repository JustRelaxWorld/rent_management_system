const express = require('express');
const {
  getPayments,
  getPayment,
  createPayment,
  updatePayment,
  deletePayment,
  getInvoicePayments,
  generateReceipt,
  initiateMpesaPayment,
  mpesaCallback
} = require('../controllers/payment.controller');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes (M-Pesa callback)
router.post('/mpesa/callback', mpesaCallback);

// Protected routes
router.use(protect);

// Routes for all authenticated users
router.get('/', getPayments);
router.get('/:id', getPayment);
router.get('/invoice/:id', getInvoicePayments);
router.get('/:id/receipt', generateReceipt);

// Tenant only routes
router.post('/mpesa/initiate', authorize('tenant'), initiateMpesaPayment);

// Landlord/Admin only routes
router.post('/', authorize('landlord', 'admin'), createPayment);

// Admin only routes
router.put('/:id', authorize('admin'), updatePayment);
router.delete('/:id', authorize('admin'), deletePayment);

module.exports = router; 