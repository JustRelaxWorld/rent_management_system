const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const User = require('../models/User');
const Property = require('../models/Property');
const Notification = require('../models/Notification');
const axios = require('axios');

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private
exports.getPayments = async (req, res) => {
  try {
    // Build filter object from query parameters
    const filters = {};
    
    if (req.query.status) filters.status = req.query.status;
    if (req.query.payment_method) filters.payment_method = req.query.payment_method;
    if (req.query.date_from) filters.date_from = req.query.date_from;
    if (req.query.date_to) filters.date_to = req.query.date_to;
    
    // Filter based on user role
    if (req.user.role === 'tenant') {
      filters.tenant_id = req.user.id;
    } else if (req.user.role === 'landlord') {
      filters.landlord_id = req.user.id;
    }
    
    const payments = await Payment.findAll(filters);
    
    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private
exports.getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // Check if user has permission to view this payment
    if (
      req.user.role === 'tenant' && payment.tenant_id !== req.user.id ||
      req.user.role === 'landlord'
    ) {
      // For landlord, check if they own the property
      const invoice = await Invoice.findById(payment.invoice_id);
      const property = await Property.findById(invoice.property_id);
      if (property.landlord_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this payment'
        });
      }
    }
    
    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new payment (manual entry by admin or landlord)
// @route   POST /api/payments
// @access  Private (Admin or Landlord)
exports.createPayment = async (req, res) => {
  try {
    const { invoice_id, tenant_id, amount, payment_method, transaction_id, notes } = req.body;
    
    // Check if invoice exists
    const invoice = await Invoice.findById(invoice_id);
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    
    // Check if tenant exists
    const tenant = await User.findById(tenant_id);
    
    if (!tenant || tenant.role !== 'tenant') {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }
    
    // Check if user has permission to create this payment
    if (req.user.role === 'landlord') {
      const property = await Property.findById(invoice.property_id);
      if (property.landlord_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to create payments for this property'
        });
      }
    }
    
    // Create payment
    const payment = await Payment.create({
      invoice_id,
      tenant_id,
      amount,
      payment_date: new Date(),
      payment_method,
      transaction_id,
      status: 'success',
      notes
    });
    
    // Get landlord info for notification
    const property = await Property.findById(invoice.property_id);
    const landlord = await User.findById(property.landlord_id);
    
    // Create notifications
    await Notification.createPaymentNotification(payment, invoice, tenant, landlord);
    
    res.status(201).json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update payment
// @route   PUT /api/payments/:id
// @access  Private (Admin only)
exports.updatePayment = async (req, res) => {
  try {
    let payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // Only admin can update payments
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update payments'
      });
    }
    
    // Update payment
    const updated = await Payment.update(req.params.id, req.body);
    
    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update payment'
      });
    }
    
    // Get updated payment
    payment = await Payment.findById(req.params.id);
    
    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete payment
// @route   DELETE /api/payments/:id
// @access  Private (Admin only)
exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // Only admin can delete payments
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete payments'
      });
    }
    
    // Delete payment
    await Payment.delete(req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get payments by invoice ID
// @route   GET /api/payments/invoice/:id
// @access  Private
exports.getInvoicePayments = async (req, res) => {
  try {
    // Check if invoice exists
    const invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    
    // Check if user has permission to view these payments
    if (
      req.user.role === 'tenant' && invoice.tenant_id !== req.user.id ||
      req.user.role === 'landlord'
    ) {
      const property = await Property.findById(invoice.property_id);
      if (property.landlord_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view these payments'
        });
      }
    }
    
    const payments = await Payment.findByInvoiceId(req.params.id);
    
    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    console.error('Get invoice payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Generate receipt for payment
// @route   GET /api/payments/:id/receipt
// @access  Private
exports.generateReceipt = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // Check if user has permission to view this receipt
    if (
      req.user.role === 'tenant' && payment.tenant_id !== req.user.id ||
      req.user.role === 'landlord'
    ) {
      const invoice = await Invoice.findById(payment.invoice_id);
      const property = await Property.findById(invoice.property_id);
      if (property.landlord_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this receipt'
        });
      }
    }
    
    const receipt = await Payment.generateReceipt(req.params.id);
    
    if (!receipt) {
      return res.status(400).json({
        success: false,
        message: 'Failed to generate receipt'
      });
    }
    
    res.status(200).json({
      success: true,
      data: receipt
    });
  } catch (error) {
    console.error('Generate receipt error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Initiate M-Pesa payment
// @route   POST /api/payments/mpesa/initiate
// @access  Private (Tenant only)
exports.initiateMpesaPayment = async (req, res) => {
  try {
    const { invoice_id, phone_number } = req.body;
    
    // Check if invoice exists
    const invoice = await Invoice.findById(invoice_id);
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    
    // Check if tenant is authorized to pay this invoice
    if (invoice.tenant_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay this invoice'
      });
    }
    
    // Check if invoice is already paid
    if (invoice.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Invoice is already paid'
      });
    }
    
    // Get M-Pesa credentials from environment variables
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const shortcode = process.env.MPESA_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;
    const callbackUrl = process.env.MPESA_CALLBACK_URL;
    
    if (!consumerKey || !consumerSecret || !shortcode || !passkey || !callbackUrl) {
      return res.status(500).json({
        success: false,
        message: 'M-Pesa configuration is incomplete'
      });
    }
    
    // Get access token
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const tokenResponse = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`
        }
      }
    );
    
    const accessToken = tokenResponse.data.access_token;
    
    // Format phone number (remove leading 0 or +254)
    let formattedPhone = phone_number;
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1);
    } else if (formattedPhone.startsWith('+254')) {
      formattedPhone = formattedPhone.substring(1);
    }
    
    // Generate timestamp
    const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
    
    // Generate password
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
    
    // Prepare STK push request
    const stkPushResponse = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: invoice.amount,
        PartyA: formattedPhone,
        PartyB: shortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: `${callbackUrl}?invoice_id=${invoice_id}`,
        AccountReference: `Invoice #${invoice_id}`,
        TransactionDesc: `Payment for Invoice #${invoice_id}`
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    
    res.status(200).json({
      success: true,
      message: 'M-Pesa payment initiated',
      data: {
        CheckoutRequestID: stkPushResponse.data.CheckoutRequestID,
        ResponseCode: stkPushResponse.data.ResponseCode,
        ResponseDescription: stkPushResponse.data.ResponseDescription,
        CustomerMessage: stkPushResponse.data.CustomerMessage
      }
    });
  } catch (error) {
    console.error('Initiate M-Pesa payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    M-Pesa callback
// @route   POST /api/payments/mpesa/callback
// @access  Public (Called by M-Pesa)
exports.mpesaCallback = async (req, res) => {
  try {
    // Extract invoice ID from callback URL query params
    const invoice_id = req.query.invoice_id;
    
    if (!invoice_id) {
      return res.status(400).json({
        success: false,
        message: 'Invoice ID not provided'
      });
    }
    
    // Check if invoice exists
    const invoice = await Invoice.findById(invoice_id);
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    
    // Process M-Pesa response
    const mpesaResponse = req.body.Body.stkCallback;
    
    // Check if transaction was successful
    if (mpesaResponse.ResultCode !== 0) {
      return res.status(400).json({
        success: false,
        message: 'M-Pesa transaction failed',
        data: {
          ResultCode: mpesaResponse.ResultCode,
          ResultDesc: mpesaResponse.ResultDesc
        }
      });
    }
    
    // Extract transaction details
    const transactionData = {};
    mpesaResponse.CallbackMetadata.Item.forEach(item => {
      if (item.Name === 'Amount') transactionData.Amount = item.Value;
      if (item.Name === 'MpesaReceiptNumber') transactionData.TransID = item.Value;
      if (item.Name === 'TransactionDate') transactionData.TransTime = item.Value;
      if (item.Name === 'PhoneNumber') transactionData.MSISDN = item.Value;
    });
    
    // Add invoice ID to transaction data
    transactionData.invoice_id = invoice_id;
    
    // Process payment
    const result = await Payment.processMpesaPayment(transactionData);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
    
    // Get tenant and landlord info for notification
    const tenant = await User.findById(invoice.tenant_id);
    const property = await Property.findById(invoice.property_id);
    const landlord = await User.findById(property.landlord_id);
    
    // Get payment details
    const payment = await Payment.findById(result.payment_id);
    
    // Create notifications
    await Notification.createPaymentNotification(payment, invoice, tenant, landlord);
    
    res.status(200).json({
      success: true,
      message: 'Payment processed successfully'
    });
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 