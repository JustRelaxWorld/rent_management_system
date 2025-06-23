const express = require('express');
const router = express.Router();
const mpesaController = require('../controllers/mpesa.controller');
const { protect } = require('../middleware/auth');

// Public endpoint for M-Pesa callback (no auth required)
router.post('/callback', mpesaController.mpesaCallback);

// Protected endpoints (require authentication)
router.post('/stkpush', protect, mpesaController.initiateStkPush);
router.get('/status/:checkoutRequestId', protect, mpesaController.checkTransactionStatus);
router.get('/transactions', protect, mpesaController.getUserTransactions);
router.get('/access-token', protect, mpesaController.getAccessTokenEndpoint);
router.post('/retry/:paymentId', protect, mpesaController.retryPayment);

module.exports = router; 