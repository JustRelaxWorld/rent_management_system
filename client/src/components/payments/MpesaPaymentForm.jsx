import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../utils/auth-context';
import api from '../../utils/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import LoadingSpinner from '../ui/LoadingSpinner';

// Define PaymentStatusModal component inline to avoid import issues
const PaymentStatusModal = ({ show, status, transactionDetails, onClose, onRetry }) => {
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [expiryTime, setExpiryTime] = useState(null);

  // Extract expiry time from transaction details
  useEffect(() => {
    if (transactionDetails?.expiryTime) {
      setExpiryTime(new Date(transactionDetails.expiryTime));
    }
  }, [transactionDetails]);

  // Timer countdown effect
  useEffect(() => {
    let timer;
    
    if (show && status === 'processing' && expiryTime) {
      timer = setInterval(() => {
        const now = new Date();
        const secondsLeft = Math.max(0, Math.floor((expiryTime - now) / 1000));
        
        setTimeLeft(secondsLeft);
        
        if (secondsLeft <= 0) {
          clearInterval(timer);
        }
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [show, status, expiryTime]);

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return (
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-500 mx-auto">
            <CheckCircleIcon className="h-10 w-10" />
          </div>
        );
      case 'failed':
      case 'cancelled':
      case 'expired':
        return (
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 mx-auto">
            <XCircleIcon className="h-10 w-10" />
          </div>
        );
      case 'timeout':
        return (
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 mx-auto">
            <ExclamationTriangleIcon className="h-10 w-10" />
          </div>
        );
      default:
        return (
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 mx-auto">
            <LoadingSpinner size="lg" />
          </div>
        );
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'success': return 'Payment Successful!';
      case 'failed': return 'Payment Failed';
      case 'cancelled': return 'Payment Cancelled';
      case 'expired': return 'Payment Expired';
      case 'timeout': return 'Payment Timed Out';
      default: return 'Processing Payment';
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'success': return 'Your payment has been processed successfully.';
      case 'failed': return 'There was a problem processing your payment. Please try again.';
      case 'cancelled': return 'You cancelled the payment. Please try again.';
      case 'expired': return 'The payment request has expired. Please try again.';
      case 'timeout': return 'The payment request timed out. Please check your M-Pesa app or try again.';
      default: return 'Please check your phone and enter your M-Pesa PIN when prompted.';
    }
  };

  const formatTimeLeft = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const isRetryable = ['failed', 'cancelled', 'expired', 'timeout'].includes(status);

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-11/12 mx-auto overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-center text-gray-900 dark:text-white">
            {getStatusTitle()}
          </h3>
        </div>
        
        {/* Body */}
        <div className="px-6 py-5">
          <div className="mb-6">
            {status === 'processing' ? (
              <div className="text-center">
                {/* M-Pesa Logo */}
                <div className="mb-5">
                  <img 
                    src="/images/M-Pesa.jpg" 
                    alt="M-PESA"
                    className="h-14 mx-auto"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/images/lipa-na-mpesa.svg";
                    }}
                  />
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  A payment request has been sent to your phone. Please check your device and enter your M-Pesa PIN to complete the transaction.
                </p>
                
                {timeLeft > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span>Time remaining</span>
                      <span className="font-medium">{formatTimeLeft(timeLeft)}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${timeLeft < 30 ? 'bg-red-500' : timeLeft < 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${(timeLeft / 120) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                {getStatusIcon()}
                <p className="mt-4 text-gray-700 dark:text-gray-300">{getStatusMessage()}</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-3">
            {isRetryable && (
              <Button 
                variant="default" 
                onClick={onRetry}
              >
                Retry Payment
              </Button>
            )}
            <Button 
              variant={isRetryable ? "outline" : "default"} 
              onClick={onClose}
            >
              {isRetryable ? 'Cancel' : 'Close'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const MpesaPaymentForm = ({ invoiceId, initialAmount, onPaymentComplete }) => {
  const { user } = useAuth();
  const [phone, setPhone] = useState(user?.phone || '');
  const [amount, setAmount] = useState(initialAmount ? initialAmount.toString() : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [phoneError, setPhoneError] = useState('');
  const [amountError, setAmountError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, success, failed, cancelled, expired, timeout
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [checkoutRequestId, setCheckoutRequestId] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);

  // Format and validate the phone number
  const formatPhoneNumber = (value) => {
    // Remove all non-numeric characters
    const numericValue = value.replace(/\D/g, '');
    
    // Handle Kenyan mobile numbers in various formats
    if (numericValue.startsWith('254')) {
      return numericValue;
    } else if (numericValue.startsWith('0') && numericValue.length > 1) {
      return '254' + numericValue.substring(1);
    } else if ((numericValue.startsWith('7') || numericValue.startsWith('1')) && numericValue.length > 0) {
      return '254' + numericValue;
    }
    
    return numericValue;
  };

  // Handle phone number change
  const handlePhoneChange = (e) => {
    const input = e.target.value;
    const formatted = formatPhoneNumber(input);
    setPhone(formatted);
    
    // Clear error when user starts typing
    if (phoneError) {
      setPhoneError('');
    }
  };

  // Handle amount change
  const handleAmountChange = (e) => {
    const value = e.target.value;
    
    // Only allow numbers and a single decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      
      // Clear error when user starts typing
      if (amountError) {
        setAmountError('');
      }
    }
  };

  // Display formatted phone number with spaces for readability
  const displayPhoneNumber = (value) => {
    if (!value) return '';
    
    // Convert to Kenyan format (07X XXX XXXX or 01X XXX XXXX)
    if (value.startsWith('254') && value.length >= 4) {
      const localFormat = '0' + value.substring(3);
      
      if (localFormat.length >= 4) {
        return `${localFormat.substring(0, 3)} ${localFormat.substring(3, 6)} ${localFormat.substring(6, 10)}`.trim();
      }
      return localFormat;
    }
    
    // Just add spaces for any other format
    if (value.length > 3) {
      const parts = [];
      for (let i = 0; i < value.length; i += 3) {
        parts.push(value.substring(i, Math.min(i + 3, value.length)));
      }
      return parts.join(' ');
    }
    
    return value;
  };

  // Validate the phone number
  const validatePhoneNumber = (phone) => {
    // Empty check
    if (!phone || phone.trim() === '') {
      setPhoneError('Phone number is required');
      return false;
    }
    
    // Must be exactly 12 digits (254 + 9 digits)
    if (phone.length !== 12) {
      setPhoneError('Phone number must be 10 digits');
      return false;
    }
    
    // Must start with 254
    if (!phone.startsWith('254')) {
      setPhoneError('Invalid phone number format');
      return false;
    }
    
    // Next digit should be 7 or 1 for Kenyan mobile numbers
    if (phone.charAt(3) !== '7' && phone.charAt(3) !== '1') {
      setPhoneError('Phone number must start with 07 or 01');
      return false;
    }
    
    return true;
  };

  // Validate the amount
  const validateAmount = (amount) => {
    if (!amount || amount.trim() === '') {
      setAmountError('Amount is required');
      return false;
    }
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setAmountError('Please enter a valid amount');
      return false;
    }
    
    return true;
  };

  // Poll for payment status
  const pollPaymentStatus = async () => {
    if (!checkoutRequestId) return;
    
    try {
      const response = await api.get(`/api/mpesa/status/${checkoutRequestId}`);
      
      if (response.data.success) {
        const paymentData = response.data.data;
        
        // Check payment status
        if (paymentData.status === 'completed') {
          if (pollingInterval) {
            clearInterval(pollingInterval);
          }
          setPaymentStatus('success');
          onPaymentComplete && onPaymentComplete();
        } 
        else if (paymentData.status === 'cancelled') {
          if (pollingInterval) {
            clearInterval(pollingInterval);
          }
          setPaymentStatus('cancelled');
        }
        else if (paymentData.status === 'failed') {
          if (pollingInterval) {
            clearInterval(pollingInterval);
          }
          setPaymentStatus('failed');
        }
        else if (paymentData.status === 'expired') {
          if (pollingInterval) {
            clearInterval(pollingInterval);
          }
          setPaymentStatus('expired');
        }
      }
    } catch (error) {
      console.error('Error polling payment status:', error);
    }
  };

  // Handle payment submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setPhoneError('');
    setAmountError('');
    
    // Validate phone number
    const formattedPhone = formatPhoneNumber(phone);
    const isPhoneValid = validatePhoneNumber(formattedPhone);
    
    // Validate amount
    const isAmountValid = validateAmount(amount);
    
    // If validation fails, return early
    if (!isPhoneValid || !isAmountValid) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Call the API to initiate payment
      const response = await api.post('/api/mpesa/stkpush', {
        phone: formattedPhone,
        amount: parseFloat(amount),
        invoice_id: invoiceId
      });
      
      if (response.data.success) {
        // Show the payment status modal
        setTransactionDetails(response.data.data);
        setCheckoutRequestId(response.data.data.CheckoutRequestID);
        setPaymentStatus('processing');
        setShowModal(true);
        
        // Start polling for payment status
        const interval = setInterval(pollPaymentStatus, 5000); // Poll every 5 seconds
        setPollingInterval(interval);
        
        // Set a timeout to cancel polling after 2 minutes
        setTimeout(() => {
          if (paymentStatus === 'processing') {
            clearInterval(interval);
            setPaymentStatus('timeout');
          }
        }, 120000); // 2 minutes
      } else {
        setError(response.data.message || 'Failed to initiate payment');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.message || 'An error occurred while processing your payment');
    } finally {
      setLoading(false);
    }
  };

  // Handle payment retry
  const handleRetryPayment = async () => {
    setPaymentStatus('processing');
    
    try {
      const formattedPhone = formatPhoneNumber(phone);
      
      // Call the API to retry payment
      const response = await api.post('/api/mpesa/stkpush', {
        phone: formattedPhone,
        amount: parseFloat(amount),
        invoice_id: invoiceId
      });
      
      if (response.data.success) {
        setTransactionDetails(response.data.data);
        setCheckoutRequestId(response.data.data.CheckoutRequestID);
        
        // Start polling for payment status
        const interval = setInterval(pollPaymentStatus, 5000);
        setPollingInterval(interval);
        
        // Set a timeout to cancel polling after 2 minutes
        setTimeout(() => {
          if (paymentStatus === 'processing') {
            clearInterval(interval);
            setPaymentStatus('timeout');
          }
        }, 120000); // 2 minutes
      } else {
        setError(response.data.message || 'Failed to retry payment');
        setPaymentStatus('failed');
      }
    } catch (err) {
      console.error('Payment retry error:', err);
      setError(err.response?.data?.message || 'An error occurred while retrying your payment');
      setPaymentStatus('failed');
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    
    setShowModal(false);
    
    // If payment was successful, notify parent component
    if (paymentStatus === 'success') {
      onPaymentComplete && onPaymentComplete();
    }
  };

  // Clean up polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  return (
    <div className="mx-auto max-w-md">
      {/* M-PESA Logo */}
      <div className="flex justify-center mb-8">
        <img 
          src="/images/M-Pesa.jpg" 
          alt="M-PESA"
          className="h-20 object-contain"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/images/lipa-na-mpesa.svg";
          }}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
        
        {/* Phone Number Input */}
        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Phone Number
          </label>
          <div className="relative">
            <Input
              id="phone"
              name="phone"
              inputSize="lg"
              value={displayPhoneNumber(phone)}
              onChange={handlePhoneChange}
              placeholder="07XX XXX XXX"
              leftIcon={
                <div className="flex items-center">
                  <span className="mr-1.5 text-lg">🇰🇪</span>
                </div>
              }
              variant={phoneError ? 'error' : 'default'}
              required
              disabled={loading}
              className="pl-12"
            />
          </div>
          {phoneError && (
            <p className="text-sm text-red-600 dark:text-red-400">{phoneError}</p>
          )}
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Input your phone number (Format: 07XX XXX XXX or 01XX XXX XXX)
          </p>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <label htmlFor="amount" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Amount (KES)
          </label>
          <div className="relative">
            <Input
              id="amount"
              name="amount"
              inputSize="lg"
              type="text"
              value={amount}
              onChange={handleAmountChange}
              placeholder="0.00"
              leftIcon={<CurrencyDollarIcon className="h-5 w-5" />}
              variant={amountError ? 'error' : 'default'}
              required
              disabled={loading}
            />
          </div>
          {amountError && (
            <p className="text-sm text-red-600 dark:text-red-400">{amountError}</p>
          )}
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Enter the amount you wish to pay
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="success" // M-PESA green color
          size="lg"
          className="w-full bg-[#00a84d] hover:bg-[#008d41] shadow-md rounded-xl"
          loading={loading}
          disabled={loading}
        >
          Pay with M-PESA
        </Button>
      </form>

      {/* Payment Status Modal */}
      <PaymentStatusModal
        show={showModal}
        status={paymentStatus}
        transactionDetails={transactionDetails}
        onClose={handleModalClose}
        onRetry={handleRetryPayment}
      />
    </div>
  );
};

export default MpesaPaymentForm; 