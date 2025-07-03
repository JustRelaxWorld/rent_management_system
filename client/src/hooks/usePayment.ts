import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';

export type PaymentStatus = 
  | 'idle'
  | 'processing' 
  | 'pending'
  | 'success'
  | 'completed'
  | 'failed' 
  | 'cancelled' 
  | 'expired' 
  | 'timeout'
  | 'not_found';

interface UsePaymentProps {
  invoiceId?: string | number;
  onPaymentComplete?: () => void;
  onPaymentFailed?: () => void;
  onPaymentCancelled?: () => void;
}

interface InitiatePaymentParams {
  phone: string;
  amount: number;
}

interface PaymentStatusResponse {
  success: boolean;
  data: {
    transactionId: string;
    status: PaymentStatus;
    amount?: number;
    timestamp?: string;
    message?: string;
    invoiceId?: number | string;
  };
}

/**
 * Custom hook for handling M-PESA payments with real-time status updates
 */
export const usePayment = ({ 
  invoiceId, 
  onPaymentComplete, 
  onPaymentFailed, 
  onPaymentCancelled 
}: UsePaymentProps = {}) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Query for payment status using the new dedicated endpoint
  const { data: paymentStatusData, isLoading: isCheckingStatus } = useQuery({
    queryKey: ['paymentStatus', transactionId],
    queryFn: async ({ queryKey }) => {
      const id = queryKey[1];
      if (!id) return null;
      try {
        const response = await api.get(`/api/payments/status/${id}`);
        return response.data as PaymentStatusResponse;
      } catch (error) {
        console.error('Error fetching payment status:', error);
        return null;
      }
    },
    enabled: !!transactionId && (paymentStatus === 'processing' || paymentStatus === 'pending'),
    refetchInterval: (data: any) => {
      // If we have conclusive status, stop polling
      if (!data) return 3000; // Every 3 seconds if no data
      
      try {
        const statusData = data as PaymentStatusResponse;
        if (!statusData.success || !statusData.data) return 3000;
        
        const status = statusData.data.status;
        
        if (status === 'completed' || status === 'success' || 
            status === 'failed' || status === 'cancelled' || 
            status === 'expired') {
          return false; // Stop polling
        }
      } catch (error) {
        console.error('Error in refetchInterval:', error);
        return 3000; // Continue polling if there was an error
      }
      
      return 3000; // Poll every 3 seconds
    },
    refetchOnWindowFocus: true,
    retry: 3,
    gcTime: 0,
  });

  // Process the payment status change
    useQuery({
    queryKey: ['processPaymentStatus', paymentStatusData],
    queryFn: async () => {
      if (!paymentStatusData) return null;
      
      try {
        const data = paymentStatusData as PaymentStatusResponse;
        if (!data.success || !data.data) return null;
        
        const status = data.data.status;
        
        // Update payment status
        if (status === 'completed' || status === 'success') {
          setPaymentStatus('success');
          onPaymentComplete?.();
          // Invalidate related queries to refresh payment history
          queryClient.invalidateQueries({ queryKey: ['paymentHistory'] });
          queryClient.invalidateQueries({ queryKey: ['invoiceDetails'] });
          queryClient.invalidateQueries({ queryKey: ['userBalance'] });
        } 
        else if (status === 'cancelled') {
          setPaymentStatus('cancelled');
          onPaymentCancelled?.();
        }
        else if (status === 'failed') {
          setPaymentStatus('failed');
          onPaymentFailed?.();
        }
        else if (status === 'expired') {
          setPaymentStatus('expired');
          onPaymentFailed?.();
        }
        else if (status === 'pending' || status === 'processing') {
          setPaymentStatus('processing');
        }
        else if (status === 'not_found') {
          // Keep current status, as it could be still processing
          if (paymentStatus === 'idle') {
            setPaymentStatus('not_found');
          }
        }
        
        return data;
      } catch (error) {
        console.error('Error processing payment status:', error);
        return null;
      }
    },
    enabled: !!paymentStatusData,
    staleTime: 0,
    gcTime: 0,
  });

  // Function to initiate payment
  const initiatePayment = async ({ phone, amount }: InitiatePaymentParams) => {
    setError(null);
    
    try {
      setLoading(true);
      
      // Call the API to initiate payment
      const response = await api.post('/api/mpesa/stkpush', {
        phone,
        amount,
        invoice_id: invoiceId
      });
      
      if (response.data.success) {
        // Extract transaction details and ID
        const checkoutRequestId = response.data.data.CheckoutRequestID;
        
        // Show the payment status modal
        setTransactionDetails(response.data.data);
        setTransactionId(checkoutRequestId);
        setPaymentStatus('processing');
        setShowPaymentModal(true);
        
        // Set a timeout to update status to timeout after 2 minutes if still processing
        setTimeout(() => {
          setPaymentStatus((currentStatus) => 
            currentStatus === 'processing' ? 'timeout' : currentStatus
          );
        }, 120000); // 2 minutes
        
        return { success: true, data: response.data.data };
      } else {
        setError(response.data.message || 'Failed to initiate payment');
        return { success: false, error: response.data.message };
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      const errorMessage = err.response?.data?.message || 'An error occurred while processing your payment';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Function to retry payment
  const retryPayment = async ({ phone, amount }: InitiatePaymentParams) => {
    setPaymentStatus('processing');
    
    try {
      // Call the API to retry payment
      const response = await api.post('/api/mpesa/stkpush', {
        phone,
        amount,
        invoice_id: invoiceId
      });
      
      if (response.data.success) {
        const checkoutRequestId = response.data.data.CheckoutRequestID;
        
        setTransactionDetails(response.data.data);
        setTransactionId(checkoutRequestId);
        
        // Set a timeout to update status to timeout after 2 minutes if still processing
        setTimeout(() => {
          setPaymentStatus((currentStatus) => 
            currentStatus === 'processing' ? 'timeout' : currentStatus
          );
        }, 120000); // 2 minutes
        
        return { success: true };
      } else {
        setError(response.data.message || 'Failed to retry payment');
        setPaymentStatus('failed');
        return { success: false, error: response.data.message };
      }
    } catch (err: any) {
      console.error('Payment retry error:', err);
      const errorMessage = err.response?.data?.message || 'An error occurred while retrying your payment';
      setError(errorMessage);
      setPaymentStatus('failed');
      return { success: false, error: errorMessage };
    }
  };

  // Handle payment modal close
  const closePaymentModal = () => {
    setShowPaymentModal(false);
    
    // If payment was successful, notify parent component
    if (paymentStatus === 'success') {
      onPaymentComplete?.();
    }
  };

  // Reset payment state
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
    showPaymentModal,
    setShowPaymentModal,
    initiatePayment,
    retryPayment,
    closePaymentModal,
    resetPayment,
  };
};

export default usePayment; 