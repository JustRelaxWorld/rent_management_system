const axios = require('axios');
const moment = require('moment');
const { pool } = require('../config/db');
const fs = require('fs');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const User = require('../models/User');
const Property = require('../models/Property');
const Notification = require('../models/Notification');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Hardcoded M-Pesa credentials from the original files
const MPESA_CREDENTIALS = {
  CONSUMER_KEY: "yTRVmGstBkVIMxYRI40m8Cni6QRLtquG6zKrGS3GXK9Wf2iH",
  CONSUMER_SECRET: "FTteALLWACVrAMn9XKqk3GV2gPFZNxjx8yZoV8A9mxLc5RJnU8DYJKpkxL5SGF6G",
  SHORTCODE: "174379",
  PASSKEY: "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
  CALLBACK_URL: "https://553e-156-0-232-4.ngrok-free.app/callback" // You may need to update this with your actual callback URL
};

/**
 * Get M-Pesa API access token
 * @private
 */
async function getAccessToken() {
  try {
    const url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
    const auth = "Basic " + Buffer.from(MPESA_CREDENTIALS.CONSUMER_KEY + ":" + MPESA_CREDENTIALS.CONSUMER_SECRET).toString("base64");

    const response = await axios.get(url, {
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
    });
    
    if (!response.data || !response.data.access_token) {
      throw new Error("Access token not found in response");
    }
    
    return response.data.access_token;
  } catch (error) {
    console.error("Error getting M-Pesa access token:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    throw error;
  }
}

/**
 * @desc    Get M-Pesa access token (for testing)
 * @route   GET /api/mpesa/access-token
 * @access  Private (Admin only)
 */
exports.getAccessTokenEndpoint = async (req, res) => {
  try {
    const accessToken = await getAccessToken();
    res.status(200).json({
      success: true,
      accessToken
    });
  } catch (error) {
    console.error('Get access token error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get M-Pesa access token',
      error: error.message
    });
  }
};

/**
 * @desc    Initiate M-Pesa STK Push
 * @route   POST /api/mpesa/stkpush
 * @access  Private (Tenant only)
 */
exports.initiateStkPush = async (req, res) => {
  try {
    const { phone, amount, invoice_id } = req.body;
    
    if (!phone || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and amount are required'
      });
    }

    // Format phone number (remove leading 0 or +254)
    let formattedPhone = phone;
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.slice(1);
    } else if (formattedPhone.startsWith('+254')) {
      formattedPhone = formattedPhone.substring(1);
    }

    // Get access token
    const accessToken = await getAccessToken();
    
    // Generate timestamp and password
    const timestamp = moment().format('YYYYMMDDHHmmss');
    const password = Buffer.from(MPESA_CREDENTIALS.SHORTCODE + MPESA_CREDENTIALS.PASSKEY + timestamp).toString('base64');

    // Prepare STK push request
    const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
    const auth = "Bearer " + accessToken;
    
    // Account reference (use invoice ID if provided)
    const accountReference = invoice_id ? `Invoice #${invoice_id}` : 'Rent Payment';
    const callbackUrl = invoice_id ? 
      `${MPESA_CREDENTIALS.CALLBACK_URL}?invoice_id=${invoice_id}` : 
      MPESA_CREDENTIALS.CALLBACK_URL;
    
    const response = await axios.post(
      url,
      {
        BusinessShortCode: MPESA_CREDENTIALS.SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: formattedPhone,
        PartyB: MPESA_CREDENTIALS.SHORTCODE,
        PhoneNumber: formattedPhone,
        CallBackURL: callbackUrl,
        AccountReference: accountReference,
        TransactionDesc: "Rent Payment via M-Pesa"
      },
      {
        headers: {
          Authorization: auth,
          "Content-Type": "application/json"
        }
      }
    );

    // Save transaction to database
    try {
      // Insert transaction record
      await pool.query(
        `INSERT INTO payments 
          (tenant_id, invoice_id, phone, amount, payment_method, transaction_id, checkout_request_id, merchant_request_id, status, created_at) 
         VALUES 
          (?, ?, ?, ?, 'mpesa', ?, ?, ?, 'pending', ?)`,
        [
          req.user.id,
          invoice_id || null,
          formattedPhone,
          amount,
          null, // transaction_id (will be updated when payment completes)
          response.data.CheckoutRequestID,
          response.data.MerchantRequestID,
          new Date()
        ]
      );
    } catch (dbError) {
      console.error('Error saving payment to database:', dbError);
      // Continue even if DB insert fails
    }

    // Log the request for debugging
    console.log('STK Push initiated:', {
      CheckoutRequestID: response.data.CheckoutRequestID,
      ResponseCode: response.data.ResponseCode,
      CustomerMessage: response.data.CustomerMessage
    });

    res.status(200).json({
      success: true,
      message: "Please check your phone and enter M-Pesa PIN to complete the transaction",
      data: {
        CheckoutRequestID: response.data.CheckoutRequestID,
        ResponseCode: response.data.ResponseCode,
        ResponseDescription: response.data.ResponseDescription,
        CustomerMessage: response.data.CustomerMessage
      }
    });
  } catch (error) {
    console.error('STK Push error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate M-Pesa payment',
      error: error.response?.data || error.message
    });
  }
};

/**
 * @desc    Check STK Push transaction status
 * @route   GET /api/mpesa/status/:checkoutRequestId
 * @access  Private
 */
exports.checkTransactionStatus = async (req, res) => {
  try {
    const { checkoutRequestId } = req.params;
    
    if (!checkoutRequestId) {
      return res.status(400).json({
        success: false,
        message: 'Checkout request ID is required'
      });
    }

    // First check if we have the transaction in our database
    try {
      const [rows] = await pool.query(
        'SELECT * FROM payments WHERE checkout_request_id = ? ORDER BY created_at DESC LIMIT 1',
        [checkoutRequestId]
      );
      
      if (rows && rows.length > 0) {
        const transaction = rows[0];
        
        // If we already have a status other than 'pending', return it
        if (transaction.status !== 'pending') {
          return res.status(200).json({
            success: true,
            data: {
              status: transaction.status,
              resultCode: transaction.result_code,
              resultDesc: transaction.result_desc,
              amount: transaction.amount,
              transactionId: transaction.transaction_id,
              mpesaReceipt: transaction.mpesa_receipt,
              completedAt: transaction.completed_at
            }
          });
        }
      }
    } catch (dbError) {
      console.log('Database query error:', dbError);
      // Continue with API call even if DB query fails
    }

    // Get access token
    const accessToken = await getAccessToken();
    
    // Generate timestamp and password
    const timestamp = moment().format('YYYYMMDDHHmmss');
    const password = Buffer.from(MPESA_CREDENTIALS.SHORTCODE + MPESA_CREDENTIALS.PASSKEY + timestamp).toString('base64');

    // Query transaction status
    const url = "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query";
    const auth = "Bearer " + accessToken;
    
    try {
      const response = await axios.post(
        url,
        {
          BusinessShortCode: MPESA_CREDENTIALS.SHORTCODE,
          Password: password,
          Timestamp: timestamp,
          CheckoutRequestID: checkoutRequestId
        },
        {
          headers: {
            Authorization: auth,
            "Content-Type": "application/json"
          }
        }
      );
      
      // Process successful response
      return res.status(200).json({
        success: true,
        data: {
          status: 'success',
          resultCode: response.data.ResultCode,
          resultDesc: response.data.ResultDesc,
          amount: response.data.Amount,
          mpesaReceipt: response.data.MpesaReceiptNumber,
          completedAt: new Date()
        }
      });
    } catch (apiError) {
      // Handle specific error case for "transaction is being processed"
      if (apiError.response && 
          apiError.response.status === 500 && 
          apiError.response.data && 
          apiError.response.data.errorMessage === 'The transaction is being processed') {
        
        // Return a pending status
        return res.status(200).json({
          success: true,
          data: {
            status: 'pending',
            resultCode: null,
            resultDesc: 'The transaction is being processed',
            checkoutRequestId: checkoutRequestId
          }
        });
      }
      
      // Check if the error indicates a cancelled transaction
      if (apiError.response && 
          apiError.response.data && 
          apiError.response.data.ResultCode === 1032) {
        
        // Update database to mark as cancelled
        try {
          await pool.query(
            `UPDATE payments SET 
              status = 'cancelled', 
              result_code = 1032, 
              result_desc = 'Request cancelled by user',
              completed_at = ?
            WHERE checkout_request_id = ?`,
            [new Date(), checkoutRequestId]
          );
        } catch (dbError) {
          console.error('Error updating payment status:', dbError);
        }
        
        // Return cancelled status
        return res.status(200).json({
          success: true,
          data: {
            status: 'cancelled',
            resultCode: 1032,
            resultDesc: 'Request cancelled by user',
            checkoutRequestId: checkoutRequestId,
            completedAt: new Date()
          }
        });
      }
      
      // For other errors, log them but don't expose details to client
      console.error('Check transaction status error:', apiError);
      
      // Return a generic pending status
      return res.status(200).json({
        success: true,
        data: {
          status: 'pending',
          resultDesc: 'Status check in progress',
          checkoutRequestId: checkoutRequestId
        }
      });
    }
  } catch (error) {
    console.error('Check transaction status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check transaction status',
      error: error.message
    });
  }
};

/**
 * @desc    M-Pesa callback handler
 * @route   POST /api/mpesa/callback
 * @access  Public
 */
exports.mpesaCallback = async (req, res) => {
  try {
    console.log('M-Pesa callback received:', JSON.stringify(req.body));
    
    // Extract data from callback
    const { Body } = req.body;
    
    if (!Body || !Body.stkCallback) {
      return res.status(400).json({ success: false, message: 'Invalid callback data' });
    }
    
    const { stkCallback } = Body;
    const { ResultCode, ResultDesc, CheckoutRequestID, MerchantRequestID } = stkCallback;
    
    // Get invoice ID from query params if provided
    const invoiceId = req.query.invoice_id;
    
    // Determine status based on result code
    let status = 'pending';
    if (ResultCode === 0) {
      status = 'success';
    } else if (ResultCode === 1032) {
      status = 'cancelled';
    } else {
      status = 'failed';
    }
    
    // Extract payment details if successful
    let mpesaReceipt = null;
    let transactionDate = null;
    let phoneNumber = null;
    
    if (ResultCode === 0 && stkCallback.CallbackMetadata && stkCallback.CallbackMetadata.Item) {
      const items = stkCallback.CallbackMetadata.Item;
      
      for (const item of items) {
        if (item.Name === 'MpesaReceiptNumber') mpesaReceipt = item.Value;
        if (item.Name === 'TransactionDate') transactionDate = item.Value;
        if (item.Name === 'PhoneNumber') phoneNumber = item.Value;
      }
    }
    
    // Update payment record in database
    try {
      await pool.query(
        `UPDATE payments SET 
          status = ?, 
          result_code = ?, 
          result_desc = ?, 
          mpesa_receipt = ?, 
          transaction_id = ?,
          completed_at = ? 
        WHERE checkout_request_id = ?`,
        [
          status,
          ResultCode,
          ResultDesc,
          mpesaReceipt,
          mpesaReceipt, // Use M-Pesa receipt as transaction ID
          new Date(),
          CheckoutRequestID
        ]
      );
      
      // If payment was successful and invoice ID was provided, update invoice status
      if (status === 'success' && invoiceId) {
        try {
          await pool.query(
            'UPDATE invoices SET status = "paid", paid_date = ? WHERE id = ?',
            [new Date(), invoiceId]
          );
        } catch (invoiceError) {
          console.error('Error updating invoice status:', invoiceError);
        }
      }
    } catch (dbError) {
      console.error('Error updating payment record:', dbError);
    }
    
    // Always return success to M-Pesa
    return res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    
    // Always return success to M-Pesa even if we have an error
    return res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
  }
};

// M-Pesa Daraja API credentials
const consumerKey = 'YOUR_CONSUMER_KEY';
const consumerSecret = 'YOUR_CONSUMER_SECRET';
const shortCode = '174379'; // Your M-Pesa shortcode
const passkey = 'YOUR_PASSKEY';
const callbackUrl = 'https://your-domain.com/api/mpesa/callback'; // Replace with your actual callback URL

// Get OAuth Token
const getOAuthToken = async () => {
  try {
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const response = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
};

// Initiate STK Push
exports.stkPush = async (req, res) => {
  try {
    const { phone, amount, invoice_id } = req.body;
    
    if (!phone || !amount) {
      return res.status(400).json({ success: false, message: 'Phone number and amount are required' });
    }
    
    // Format phone number (remove leading 0 and add country code if needed)
    let formattedPhone = phone;
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone;
    }
    
    // Get access token
    const accessToken = await getOAuthToken();
    
    // Generate timestamp
    const timestamp = moment().format('YYYYMMDDHHmmss');
    const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');
    
    // Generate a unique transaction reference
    const transactionRef = `RMS-${invoice_id || Math.floor(Math.random() * 1000000)}`;
    
    // Prepare STK Push request
    const stkPushUrl = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
    const stkPushData = {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: formattedPhone,
      PartyB: shortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: transactionRef,
      TransactionDesc: `Rent Payment for ${invoice_id || 'property'}`
    };
    
    // Make STK Push request
    const stkResponse = await axios.post(stkPushUrl, stkPushData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Save transaction details to database
    const transaction = {
      user_id: req.user ? req.user.id : null,
      phone: formattedPhone,
      amount: amount,
      reference: transactionRef,
      invoice_id: invoice_id || null,
      checkout_request_id: stkResponse.data.CheckoutRequestID,
      merchant_request_id: stkResponse.data.MerchantRequestID,
      status: 'pending',
      created_at: new Date()
    };
    
    // Insert transaction into database
    const [result] = await pool.query(
      'INSERT INTO payments (user_id, phone, amount, reference, invoice_id, checkout_request_id, merchant_request_id, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        transaction.user_id,
        transaction.phone,
        transaction.amount,
        transaction.reference,
        transaction.invoice_id,
        transaction.checkout_request_id,
        transaction.merchant_request_id,
        transaction.status,
        transaction.created_at
      ]
    );
    
    // Return success response with transaction details
    return res.json({
      success: true,
      message: 'STK Push sent successfully',
      data: {
        ...stkResponse.data,
        transactionId: result.insertId,
        reference: transactionRef
      }
    });
    
  } catch (error) {
    console.error('STK Push error:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to initiate payment',
      error: error.response?.data || error.message
    });
  }
};

// Handle M-Pesa callback
exports.callback = async (req, res) => {
  try {
    console.log('M-Pesa Callback received:', JSON.stringify(req.body));
    
    // Extract callback data
    const callbackData = req.body.Body.stkCallback;
    const resultCode = callbackData.ResultCode;
    const resultDesc = callbackData.ResultDesc;
    const checkoutRequestID = callbackData.CheckoutRequestID;
    const merchantRequestID = callbackData.MerchantRequestID;
    
    // Determine transaction status based on result code
    let status = 'unknown';
    if (resultCode === 0) {
      status = 'completed';
    } else if (resultCode === 1032) {
      status = 'cancelled';
    } else {
      status = 'failed';
    }
    
    // Extract transaction details if available
    let amount = null;
    let phoneNumber = null;
    let transactionDate = null;
    let mpesaReceiptNumber = null;
    
    if (resultCode === 0 && callbackData.CallbackMetadata && callbackData.CallbackMetadata.Item) {
      const items = callbackData.CallbackMetadata.Item;
      
      // Extract metadata items
      for (const item of items) {
        if (item.Name === 'Amount') amount = item.Value;
        if (item.Name === 'PhoneNumber') phoneNumber = item.Value;
        if (item.Name === 'TransactionDate') transactionDate = item.Value;
        if (item.Name === 'MpesaReceiptNumber') mpesaReceiptNumber = item.Value;
      }
    }
    
    // Update transaction in database
    await pool.query(
      `UPDATE payments SET 
        status = ?, 
        result_code = ?, 
        result_desc = ?,
        mpesa_receipt = ?,
        completed_at = ?
      WHERE checkout_request_id = ?`,
      [
        status,
        resultCode,
        resultDesc,
        mpesaReceiptNumber || null,
        new Date(),
        checkoutRequestID
      ]
    );
    
    // Return success response
    return res.status(200).json({ success: true });
    
  } catch (error) {
    console.error('M-Pesa Callback error:', error);
    // Always return 200 to Safaricom even if there's an error
    return res.status(200).json({ success: true });
  }
};

// Check transaction status
exports.checkStatus = async (req, res) => {
  try {
    const { checkoutRequestId } = req.params;
    
    if (!checkoutRequestId) {
      return res.status(400).json({ success: false, message: 'Checkout Request ID is required' });
    }
    
    // Query database for transaction status
    const [transactions] = await pool.query(
      'SELECT * FROM payments WHERE checkout_request_id = ? ORDER BY created_at DESC LIMIT 1',
      [checkoutRequestId]
    );
    
    if (transactions.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    
    const transaction = transactions[0];
    
    // Return transaction details
    return res.json({
      success: true,
      data: {
        status: transaction.status,
        resultCode: transaction.result_code,
        resultDesc: transaction.result_desc,
        amount: transaction.amount,
        reference: transaction.reference,
        mpesaReceipt: transaction.mpesa_receipt,
        completedAt: transaction.completed_at
      }
    });
    
  } catch (error) {
    console.error('Check status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to check transaction status' });
  }
};

// Get user transactions
exports.getUserTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Query database for user transactions
    const [transactions] = await pool.query(
      'SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    
    // Return transactions
    return res.json({
      success: true,
      data: transactions
    });
    
  } catch (error) {
    console.error('Get user transactions error:', error);
    return res.status(500).json({ success: false, message: 'Failed to get transactions' });
  }
}; 