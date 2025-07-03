import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';

/**
 * A standalone modal component for showing M-Pesa payment status
 * Uses React Query for real-time polling
 */
const MpesaPaymentModal = ({
  show,
  onClose,
  transactionId,
  initialDetails,
  onPaymentSuccess,
  onPaymentFailed,
  onPaymentCancelled,
  onRetry
}) => {
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [expiryTime, setExpiryTime] = useState(null);
  const [status, setStatus] = useState('processing');
  const [statusMessage, setStatusMessage] = useState('');
  const queryClient = useQueryClient();

  // Set up expiry time
  useEffect(() => {
    if (initialDetails?.expiryTime) {
      setExpiryTime(new Date(initialDetails.expiryTime));
    } else if (show) {
      // Default to 2 minutes from now
      const twoMinutesFromNow = new Date();
      twoMinutesFromNow.setMinutes(twoMinutesFromNow.getMinutes() + 2);
      setExpiryTime(twoMinutesFromNow);
    }
  }, [initialDetails, show]);

  // Timer countdown effect
  useEffect(() => {
    let timer;
    
    if (show && expiryTime) {
      timer = setInterval(() => {
        const now = new Date();
        const secondsLeft = Math.max(0, Math.floor((expiryTime - now) / 1000));
        
        setTimeLeft(secondsLeft);
        
        if (secondsLeft <= 0 && status === 'processing') {
          setStatus('timeout');
          setStatusMessage('Payment request timed out. Please try again.');
        }
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [show, expiryTime, status]);

  // Use React Query for polling payment status
  const { data: paymentStatusData } = useQuery({
    queryKey: ['paymentStatus', transactionId],
    queryFn: async () => {
      if (!transactionId) return null;
      
      try {
        // Try M-Pesa endpoint first
        try {
          const response = await api.get(`/api/mpesa/status/${transactionId}`);
          return response.data;
        } catch (mpesaError) {
          // Fall back to general payment status endpoint
          const response = await api.get(`/api/payments/status/${transactionId}`);
          return response.data;
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        return null;
      }
    },
    enabled: !!transactionId && show && status === 'processing',
    refetchInterval: (data) => {
      // Stop polling when we have a conclusive status
      if (!data?.success || !data?.data) return 3000; // Every 3 seconds if no data
      
      const paymentStatus = data.data.status;
      
      if (
        paymentStatus === 'completed' || 
        paymentStatus === 'success' || 
        paymentStatus === 'failed' || 
        paymentStatus === 'cancelled' || 
        paymentStatus === 'expired'
      ) {
        return false; // Stop polling
      }
      
      return 3000; // Poll every 3 seconds
    },
    refetchOnWindowFocus: true,
    retry: 3,
  });

  // Process payment status updates
  useEffect(() => {
    if (!paymentStatusData?.success || !paymentStatusData?.data) return;
    
    const paymentData = paymentStatusData.data;
    const paymentStatus = paymentData.status;
    
    if (paymentStatus === 'completed' || paymentStatus === 'success') {
      setStatus('success');
      
      if (onPaymentSuccess) {
        onPaymentSuccess(paymentData);
      }
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['paymentHistory'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    } 
    else if (paymentStatus === 'cancelled') {
      setStatus('cancelled');
      setStatusMessage(paymentData.resultDesc || 'You cancelled the payment. Please try again.');
      
      if (onPaymentCancelled) {
        onPaymentCancelled(paymentData);
      }
    }
    else if (paymentStatus === 'failed') {
      setStatus('failed');
      setStatusMessage(paymentData.resultDesc || 'Payment failed. Please try again.');
      
      if (onPaymentFailed) {
        onPaymentFailed(paymentData);
      }
    }
    else if (paymentStatus === 'expired') {
      setStatus('expired');
      setStatusMessage('Payment request expired. Please try again.');
      
      if (onPaymentFailed) {
        onPaymentFailed(paymentData);
      }
    }
  }, [paymentStatusData, onPaymentSuccess, onPaymentCancelled, onPaymentFailed, queryClient]);

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
  
  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="w-12 h-12 text-green-500" />;
      case 'failed':
      case 'cancelled':
      case 'expired':
        return <XCircleIcon className="w-12 h-12 text-red-500" />;
      case 'timeout':
        return <ExclamationCircleIcon className="w-12 h-12 text-yellow-500" />;
      default:
        return <ClockIcon className="w-12 h-12 text-blue-500 animate-pulse" />;
    }
  };

  const getStatusColorClass = () => {
    switch (status) {
      case 'success': return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'failed':
      case 'cancelled':
      case 'expired': return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      case 'timeout': return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
    }
  };
  
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-neutral-800 rounded-xl shadow-xl max-w-md w-full overflow-hidden relative z-[101]"
      >
        <div className="p-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-opacity-20 bg-gray-100 dark:bg-gray-700">
              {getStatusIcon()}
            </div>
            
            <h3 className={`text-xl font-semibold mb-2 ${status === 'processing' ? 'text-blue-700 dark:text-blue-400' : ''}`}>
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
                        ? 'bg-red-500 dark:bg-red-600' 
                        : timeLeft < 60 
                          ? 'bg-yellow-500 dark:bg-yellow-600'
                          : 'bg-green-500 dark:bg-green-600'
                    }`}
                    style={{ width: `${(timeLeft / 120) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          
          {initialDetails && (
            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="font-medium text-neutral-900 dark:text-white mb-3">Transaction Details</h4>
              <div className="space-y-2">
                {initialDetails.CheckoutRequestID && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">Request ID:</span>
                    <span className="text-neutral-900 dark:text-white">{initialDetails.CheckoutRequestID}</span>
                  </div>
                )}
                {initialDetails.CustomerMessage && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">Message:</span>
                    <span className="text-neutral-900 dark:text-white">{initialDetails.CustomerMessage}</span>
                  </div>
                )}
                {initialDetails.amount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">Amount:</span>
                    <span className="text-neutral-900 dark:text-white">Ksh {initialDetails.amount.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
            {isRetryable && onRetry && (
              <Button
                variant="default"
                onClick={onRetry}
                className="inline-flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry Payment
              </Button>
            )}
            <Button
              variant={status === 'success' ? "success" : "secondary"}
              onClick={onClose}
              disabled={status === 'processing'}
            >
              {status === 'success' ? 'Done' : 'Close'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MpesaPaymentModal;
