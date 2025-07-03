import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/auth-context';
import api from '../../utils/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  PhoneIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';

// Payment Status Modal using Tailwind CSS
const PaymentStatusModal = (props) => {
  const { 
    show, 
    onHide, 
    status, 
    transactionDetails, 
    error, 
    onRetry,
    onPaymentSuccess,
    onPaymentCancelled,
    onPaymentFailed,
    onPaymentExpired
  } = props;
  const [statusMessage, setStatusMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [expiryTime, setExpiryTime] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const queryClient = useQueryClient();

  // Reset state when modal is shown
  useEffect(() => {
    if (show) {
      setIsRetrying(false);
    }
  }, [show]);

  // Handle retry action
  const handleRetry = () => {
    if (onRetry) {
      // Call parent retry handler directly
      onRetry();
    }
  };

  // Extract checkout request ID from transaction details
  const checkoutRequestID = transactionDetails?.CheckoutRequestID;

  // Set expiry time based on transaction details
  useEffect(() => {
    if (transactionDetails?.expiryTime) {
      setExpiryTime(new Date(transactionDetails.expiryTime));
    } else if (transactionDetails) {
      // Default to 2 minutes from now if no expiry time provided
      const twoMinutesFromNow = new Date();
      twoMinutesFromNow.setMinutes(twoMinutesFromNow.getMinutes() + 2);
      setExpiryTime(twoMinutesFromNow);
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
          // Don't set status here - let the polling handle it
        }
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [show, status, expiryTime]);

  // Use React Query for polling payment status
  const { data: paymentStatusData } = useQuery({
    queryKey: ['paymentStatus', checkoutRequestID],
    queryFn: async () => {
      if (!checkoutRequestID) return null;
      try {
        // First try the mpesa-specific endpoint
        const response = await api.get(`/api/mpesa/status/${checkoutRequestID}`);
        return response.data;
      } catch (error) {
        // Fall back to the general payment status endpoint
        try {
          const fallbackResponse = await api.get(`/api/payments/status/${checkoutRequestID}`);
          return fallbackResponse.data;
        } catch (fallbackError) {
          console.error('Error checking payment status:', fallbackError);
          return null;
        }
      }
    },
    enabled: !!checkoutRequestID && status === 'processing' && show,
    refetchInterval: (data) => {
      // Stop polling when we have a conclusive status
      if (!data) return 3000; // Poll every 3 seconds by default
      
      if (data.success && data.data) {
        const paymentStatus = data.data.status;
        
        // Stop polling for conclusive statuses
        if (
          paymentStatus === 'completed' || 
          paymentStatus === 'success' || 
          paymentStatus === 'failed' || 
          paymentStatus === 'cancelled' || 
          paymentStatus === 'expired'
        ) {
          return false;
        }
      }
      
      return 3000; // Continue polling every 3 seconds
    },
    refetchOnWindowFocus: true,
    retry: 3
  });

  // Process payment status updates from React Query
  useEffect(() => {
    if (paymentStatusData?.success && paymentStatusData?.data) {
      const paymentData = paymentStatusData.data;
      const paymentStatus = paymentData.status;
      
      if (paymentStatus === 'completed' || paymentStatus === 'success') {
        onPaymentSuccess(paymentData);
      } else if (paymentStatus === 'cancelled') {
        setStatusMessage(paymentData.resultDesc || 'You cancelled the payment. Please try again.');
        onPaymentCancelled(paymentData);
      } else if (paymentStatus === 'failed') {
        setStatusMessage(paymentData.resultDesc || 'Payment failed. Please try again.');
        onPaymentFailed(paymentData);
      } else if (paymentStatus === 'expired') {
        setStatusMessage('Payment request expired. Please try again.');
        onPaymentExpired(paymentData);
      }
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['paymentHistory'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    }
  }, [paymentStatusData, onPaymentSuccess, onPaymentCancelled, onPaymentFailed, onPaymentExpired, queryClient]);

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
    if (statusMessage) return statusMessage;
    
    switch (status) {
      case 'success': return 'Your payment has been processed successfully.';
      case 'failed': return error || 'There was a problem processing your payment. Please try again.';
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

  if (!show) return null;

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="w-12 h-12 text-mpesa" />;
      case 'failed':
      case 'cancelled':
      case 'expired':
        return <XCircleIcon className="w-12 h-12 text-mpesa-red" />;
      case 'timeout':
        return <ExclamationCircleIcon className="w-12 h-12 text-warning-500" />;
      default:
        return <ClockIcon className="w-12 h-12 text-mpesa animate-pulse" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-neutral-800 rounded-xl shadow-xl max-w-md w-full overflow-hidden"
      >
        <div className="p-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-opacity-20 bg-gray-100 dark:bg-gray-700">
              {getStatusIcon()}
            </div>
            
            <h3 className={`text-xl font-semibold mb-2 ${status === 'processing' ? 'text-mpesa dark:text-mpesa' : ''}`}>
              {getStatusTitle()}
            </h3>
            
            <p className="mb-4 text-neutral-600 dark:text-neutral-400">
              {getStatusMessage()}
            </p>
            
            {status === 'processing' && timeLeft > 0 && (
              <div className="mt-4 mb-2">
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
                  Time remaining: {formatTimeLeft(timeLeft)}
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full ${
                      timeLeft < 30 
                        ? 'bg-mpesa-red' 
                        : timeLeft < 60 
                          ? 'bg-warning-500'
                          : 'bg-mpesa'
                    }`}
                    style={{ width: `${(timeLeft / 120) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          
          {transactionDetails && (
            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="font-medium text-neutral-900 dark:text-white mb-3">Transaction Details</h4>
              <div className="space-y-2">
                {transactionDetails.CheckoutRequestID && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">Request ID:</span>
                    <span className="text-neutral-900 dark:text-white">{transactionDetails.CheckoutRequestID}</span>
                  </div>
                )}
                {transactionDetails.CustomerMessage && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">Message:</span>
                    <span className="text-neutral-900 dark:text-white">{transactionDetails.CustomerMessage}</span>
                  </div>
                )}
                {transactionDetails.amount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">Amount:</span>
                    <span className="text-neutral-900 dark:text-white">KES {transactionDetails.amount}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
            {isRetryable && (
              <Button
                variant="default"
                disabled={isRetrying}
                onClick={handleRetry}
                className="inline-flex items-center justify-center bg-mpesa hover:bg-mpesa-dark text-white"
              >
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                {isRetrying ? 'Retrying...' : 'Retry Payment'}
              </Button>
            )}
            <Button
              variant={status === 'success' ? "success" : "secondary"}
              onClick={onHide}
              disabled={status === 'processing'}
              className={status === 'success' ? "bg-mpesa text-white hover:bg-mpesa-dark" : ""}
            >
              {status === 'success' ? 'Done' : 'Close'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const EnhancedMpesaPaymentForm = (props) => {
  const { invoiceId, amount: initialAmount, propertyReference, onPaymentComplete } = props;
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Form state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState(initialAmount?.toString() || '');
  const [reference, setReference] = useState(invoiceId || propertyReference || '');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [transactionDetails, setTransactionDetails] = useState(null);
  
  // React Query for payment history
  const { data: paymentHistoryData } = useQuery({
    queryKey: ['paymentHistory', invoiceId],
    queryFn: async () => {
      if (!invoiceId) return [];
      try {
        const response = await api.get(`/api/payments/invoice/${invoiceId}`);
        return response.data.success ? response.data.data : [];
      } catch (error) {
        console.error('Error fetching payment history:', error);
        return [];
      }
    },
    enabled: !!invoiceId,
    refetchOnWindowFocus: true,
    staleTime: 30000 // 30 seconds
  });

  // Prefill phone number if user has one
  useEffect(() => {
    if (user?.phone) {
      setPhoneNumber(user.phone);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      // Validate input
      if (!phoneNumber || !amount || !reference) {
        throw new Error('Please fill in all required fields');
      }

      // Format phone number if needed
      let formattedPhone = phoneNumber;
      if (!formattedPhone.startsWith('0') && !formattedPhone.startsWith('+254') && !formattedPhone.startsWith('254')) {
        formattedPhone = '0' + formattedPhone;
      }

      // Send payment request
      const response = await api.post('/api/mpesa/stkpush', {
        phone: formattedPhone,
        amount: parseFloat(amount),
        invoice_id: reference
      });

      // Update transaction details with response data
      setTransactionDetails(response.data.data);
      
      // Update status based on response
      if (response.data.success) {
        // Show modal with processing status
        setPaymentStatus('processing');
        setShowModal(true);
      } else {
        setPaymentStatus('failed');
        setError(response.data.message || 'Failed to initiate payment');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setPaymentStatus('failed');
      setError(err.response?.data?.message || err.message || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentData) => {
    setPaymentStatus('success');
    
    // Update transaction details with payment data
    setTransactionDetails(prev => ({ ...prev, ...paymentData }));
    
    // Notify parent component if callback provided
    if (onPaymentComplete) {
      onPaymentComplete({
        status: 'success',
        data: paymentData
      });
    }
  };

  const handlePaymentFailed = (paymentData) => {
    setPaymentStatus('failed');
    setError(paymentData.resultDesc || 'Payment failed');
    setTransactionDetails(prev => ({ ...prev, ...paymentData }));
  };

  const handlePaymentCancelled = (paymentData) => {
    setPaymentStatus('cancelled');
    setTransactionDetails(prev => ({ ...prev, ...paymentData }));
  };

  const handlePaymentExpired = (paymentData) => {
    setPaymentStatus('expired');
    setTransactionDetails(prev => ({ ...prev, ...paymentData }));
  };

  const handleRetryPayment = async () => {
    // Close the current modal completely
    setShowModal(false);
    
    // Clear all previous payment state
    queryClient.removeQueries({ queryKey: ['paymentStatus'] });
    
    // Small delay to ensure complete reset
    setTimeout(async () => {
      // Reset all state to initial values
      setError(null);
      setLoading(true);
      setPaymentStatus('processing');
      setTransactionDetails(null);
      
      try {
        // Start a completely fresh payment request
        const response = await api.post('/api/mpesa/stkpush', {
          phone: phoneNumber,
          amount: parseFloat(amount),
          invoice_id: reference
        });
        
        if (response.data.success) {
          // Set transaction details with fresh data
          setTransactionDetails(response.data.data);
          
          // Open modal with processing state
          setShowModal(true);
        } else {
          throw new Error(response.data.message || 'Failed to initiate payment');
        }
      } catch (err) {
        console.error('Payment retry error:', err);
        setPaymentStatus('failed');
        setError(err.response?.data?.message || err.message || 'Failed to retry payment');
        
        // Only show modal with error state if we couldn't even start the process
        setShowModal(true);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleModalClose = () => {
    // Simply hide the modal
    setShowModal(false);
    
    // If payment was successful, redirect or update UI as needed
    if (paymentStatus === 'success' && invoiceId) {
      navigate(`/tenant/invoices/${invoiceId}`);
    }
  };

  // Get recent payment status from payment history
  const getRecentPaymentStatus = () => {
    if (!paymentHistoryData || paymentHistoryData.length === 0) return null;
    
    const sortedPayments = [...paymentHistoryData].sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
    
    return sortedPayments[0];
  };

  const recentPayment = getRecentPaymentStatus();

  // Phone number validation
  const validatePhoneNumber = (phone) => {
    const kenyanPhoneRegex = /^(?:254|\+254|0)?(7[0-9]{8})$/;
    return kenyanPhoneRegex.test(phone);
  };

  const isPhoneValid = phoneNumber ? validatePhoneNumber(phoneNumber) : true;
  const phoneErrorMessage = isPhoneValid ? '' : 'Please enter a valid Kenyan phone number';

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 rounded-lg bg-mpesa-redLight border border-mpesa-red text-mpesa-redDark">
          {error}
        </div>
      )}
      
      {recentPayment && recentPayment.status === 'completed' && (
        <div className="p-4 rounded-lg bg-mpesa-light border border-mpesa text-mpesa-dark">
          <h4 className="font-medium mb-2">Payment Already Completed</h4>
          <p>
            A payment of KES {recentPayment.amount} was already made on{' '}
            {new Date(recentPayment.created_at).toLocaleDateString()} at{' '}
            {new Date(recentPayment.created_at).toLocaleTimeString()}.
          </p>
        </div>
      )}
      
      {recentPayment && ['pending', 'failed', 'expired', 'cancelled'].includes(recentPayment.status) && (
        <div className={`p-4 rounded-lg ${
          recentPayment.status === 'pending'
            ? 'bg-info-50 border border-info-200 text-info-700 dark:bg-info-900/20 dark:text-info-400 dark:border-info-800/30'
            : 'bg-warning-50 border border-warning-200 text-warning-700 dark:bg-warning-900/20 dark:text-warning-400 dark:border-warning-800/30'
        }`}>
          <h4 className="font-medium mb-2">
            {recentPayment.status === 'pending' ? 'Payment In Progress' : 'Previous Payment Incomplete'}
          </h4>
          <p>
            A payment of KES {recentPayment.amount} was {recentPayment.status === 'pending' ? 'initiated' : recentPayment.status} on{' '}
            {new Date(recentPayment.created_at).toLocaleDateString()} at{' '}
            {new Date(recentPayment.created_at).toLocaleTimeString()}.
          </p>
          {recentPayment.status !== 'pending' && (
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetryPayment}
                className="inline-flex items-center"
              >
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Retry Payment
              </Button>
            </div>
          )}
        </div>
      )}
      
      {/* M-Pesa Payment Form - Following M-Pesa's Design System */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Phone Number Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Phone Number (M-Pesa)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <PhoneIcon className="h-5 w-5 text-mpesa" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className={`block w-full rounded-lg border ${!isPhoneValid ? 'border-mpesa-red' : 'border-neutral-300 dark:border-neutral-600'} pl-10 py-3 px-4 
                           shadow-sm focus:border-mpesa focus:ring-mpesa
                           dark:bg-neutral-700 dark:text-white dark:placeholder-neutral-400`}
                  placeholder="e.g. 07XXXXXXXX"
                  disabled={loading}
                  required
                />
              </div>
              {!isPhoneValid && (
                <p className="mt-1 text-xs text-mpesa-red">
                  {phoneErrorMessage}
                </p>
              )}
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Enter the phone number registered with M-Pesa
              </p>
            </div>
            
            {/* Amount Field */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Amount (KES)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-mpesa font-medium">Ksh</span>
                </div>
                <input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="block w-full rounded-lg border border-neutral-300 dark:border-neutral-600 pl-14 py-3 px-4 
                           shadow-sm focus:border-mpesa focus:ring-mpesa
                           dark:bg-neutral-700 dark:text-white dark:placeholder-neutral-400"
                  placeholder="Enter amount"
                  disabled={loading || initialAmount !== undefined}
                  required
                />
              </div>
            </div>
            
            {/* Reference Field */}
            <div>
              <label htmlFor="reference" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Reference
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <DocumentTextIcon className="h-5 w-5 text-mpesa" />
                </div>
                <input
                  id="reference"
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="block w-full rounded-lg border border-neutral-300 dark:border-neutral-600 pl-10 py-3 px-4 
                           shadow-sm focus:border-mpesa focus:ring-mpesa
                           dark:bg-neutral-700 dark:text-white dark:placeholder-neutral-400"
                  placeholder="Invoice or property reference"
                  disabled={loading || invoiceId !== undefined || propertyReference !== undefined}
                  required
                />
              </div>
            </div>
            
            {/* Pay Button - Clear Call to Action */}
            <Button
              variant="default"
              type="submit"
              disabled={loading || !isPhoneValid}
              className={`w-full py-4 bg-mpesa hover:bg-mpesa-dark text-white focus:ring-mpesa focus:ring-offset-2 rounded-lg text-base font-medium flex items-center justify-center transition-all ${loading ? 'opacity-70' : 'opacity-100'}`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" className="mr-2 text-white" />
                  <span>Processing...</span>
                </div>
              ) : (
                <span>Pay Now</span>
              )}
            </Button>
            
            {/* Security Note */}
            <div className="flex items-center justify-center text-xs text-neutral-500 dark:text-neutral-400 pt-2">
              <LockClosedIcon className="h-3 w-3 mr-1 inline" />
              <span>Secure payment processed by Safaricom M-Pesa</span>
            </div>
          </form>
        </div>
      </div>
      
      {/* Payment Status Modal */}
      <AnimatePresence>
        {showModal && (
          <PaymentStatusModal
            show={showModal}
            onHide={handleModalClose}
            status={paymentStatus}
            transactionDetails={transactionDetails}
            error={error}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentFailed={handlePaymentFailed}
            onPaymentCancelled={handlePaymentCancelled}
            onPaymentExpired={handlePaymentExpired}
            onRetry={handleRetryPayment}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedMpesaPaymentForm; 