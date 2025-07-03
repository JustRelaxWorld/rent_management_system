import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from './api';

/**
 * Custom hook for handling M-Pesa payments with text-only status updates
 * 
 * @param {Object} options
 * @param {string|number} options.invoiceId - Optional invoice ID for the payment
 * @param {function} options.onPaymentSuccess - Callback function called when payment succeeds
 * @param {function} options.onPaymentFailed - Callback function called when payment fails
 * @param {function} options.onPaymentCancelled - Callback function called when payment is cancelled
 * @returns {Object} Payment methods and state
 */
export const useMpesaPayment = ({ 
  invoiceId, 
  onPaymentSuccess, 
  onPaymentFailed, 
  onPaymentCancelled 
} = {}) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [transactionId, setTransactionId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Query for payment status
  const { isLoading: isCheckingStatus } = useQuery({
    queryKey: ['paymentStatus', transactionId],
    queryFn: async () => {
      if (!transactionId) return null;
      
      try {
        // Try both endpoints to ensure we get the status
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
    enabled: !!transactionId && (paymentStatus === 'processing' || paymentStatus === 'pending'),
    refetchInterval: (data) => {
      // If we have conclusive status, stop polling
      if (!data?.success || !data?.data) return 3000; // Every 3 seconds if no data
      
      const status = data.data.status;
      
      if (status === 'success' || status === 'failed') {
        return false; // Stop polling
      }
      
      return 3000; // Poll every 3 seconds
    },
    refetchOnWindowFocus: true,
    retry: 3,
    onSuccess: (data) => {
      if (!data?.success || !data?.data) return;
      
      const paymentData = data.data;
      const status = paymentData.status;
      const statusMessage = paymentData.statusMessage;
      
      // Store the status message in transaction details
      if (statusMessage) {
        setTransactionDetails(prev => ({
          ...prev,
          statusMessage
        }));
      }
      
      // Update payment status based on status
      if (status === 'success') {
        setPaymentStatus('success');
        onPaymentSuccess?.(paymentData);
        // Invalidate related queries to refresh payment history
        queryClient.invalidateQueries({ queryKey: ['paymentHistory'] });
        queryClient.invalidateQueries({ queryKey: ['invoiceDetails'] });
      } 
      else if (status === 'failed') {
        // Check if it was cancelled by user based on status message
        if (statusMessage && statusMessage.toLowerCase().includes('cancelled by user')) {
          setPaymentStatus('cancelled');
          onPaymentCancelled?.(paymentData);
        } else {
          setPaymentStatus('failed');
          onPaymentFailed?.(paymentData);
        }
      }
    }
  });

  /**
   * Initiate an M-Pesa payment
   * 
   * @param {Object} params
   * @param {string} params.phone - The phone number to charge
   * @param {number} params.amount - The amount to charge
   * @param {string} [params.reference] - Optional reference (defaults to invoiceId)
   * @returns {Promise<Object>} Result object with success flag
   */
  const initiatePayment = async ({ phone, amount, reference = invoiceId }) => {
    setError(null);
    
    try {
      setLoading(true);
      
      // Call the API to initiate payment
      const response = await api.post('/api/mpesa/stkpush', {
        phone,
        amount,
        invoice_id: reference
      });
      
      if (response.data.success) {
        // Extract transaction details and ID
        const checkoutRequestId = response.data.data.CheckoutRequestID;
        
        // Show the payment status modal
        setTransactionDetails(response.data.data);
        setTransactionId(checkoutRequestId);
        setPaymentStatus('processing');
        setShowPaymentModal(true);
        
        return { success: true, data: response.data.data };
      } else {
        setError(response.data.message || 'Failed to initiate payment');
        return { success: false, error: response.data.message };
      }
    } catch (err) {
      console.error('Payment error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred while processing your payment';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Retry a failed payment
   * 
   * @param {Object} params
   * @param {string} params.phone - The phone number to charge
   * @param {number} params.amount - The amount to charge
   * @returns {Promise<Object>} Result object with success flag
   */
  const retryPayment = async ({ phone, amount }) => {
    setError(null);
    setPaymentStatus('processing');
    
    try {
      setLoading(true);
      // Create a new payment request
      const response = await api.post('/api/mpesa/stkpush', {
        phone,
        amount,
        invoice_id: invoiceId
      });
      
      if (response.data.success) {
        const checkoutRequestId = response.data.data.CheckoutRequestID;
        
        setTransactionDetails(response.data.data);
        setTransactionId(checkoutRequestId);
        setShowPaymentModal(true);
        
        return { success: true };
      } else {
        setError(response.data.message || 'Failed to retry payment');
        setPaymentStatus('failed');
        return { success: false, error: response.data.message };
      }
    } catch (err) {
      console.error('Payment retry error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred while retrying your payment';
      setError(errorMessage);
      setPaymentStatus('failed');
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset all payment state
   */
  const resetPayment = () => {
    setPaymentStatus('idle');
    setTransactionId(null);
    setTransactionDetails(null);
    setError(null);
    setShowPaymentModal(false);
  };

  return {
    loading,
    error,
    paymentStatus,
    transactionDetails,
    isCheckingStatus,
    transactionId,
    showPaymentModal,
    setShowPaymentModal,
    initiatePayment,
    retryPayment,
    resetPayment,
  };
};

export default useMpesaPayment;
