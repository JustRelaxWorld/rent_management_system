import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Card, Spinner } from 'react-bootstrap';
import { useAuth } from '../../utils/auth-context';
import api from '../../utils/api';

// Define PaymentStatusModal component inline to avoid import issues
const PaymentStatusModal = (props) => {
  const { show, onHide, status, transactionDetails, error } = props;
  const [pollingCount, setPollingCount] = useState(0);
  const [pollingStatus, setPollingStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [checkoutRequestID, setCheckoutRequestID] = useState(null);

  // Extract checkout request ID from transaction details
  useEffect(() => {
    if (transactionDetails?.CheckoutRequestID) {
      setCheckoutRequestID(transactionDetails.CheckoutRequestID);
    }
  }, [transactionDetails]);

  // Poll for payment status if we have a checkout request ID and status is processing
  useEffect(() => {
    let pollingInterval;
    
    if (show && status === 'processing' && checkoutRequestID) {
      setPollingStatus('polling');
      
      // Start polling
      pollingInterval = setInterval(async () => {
        try {
          setPollingCount(prev => prev + 1);
          
          // Stop polling after 30 attempts (2 minutes)
          if (pollingCount >= 30) {
            clearInterval(pollingInterval);
            setPollingStatus('timeout');
            setStatusMessage('Payment request timed out. Please check your M-Pesa app or try again.');
            return;
          }
          
          // Call API to check payment status
          const response = await api.get(`/api/mpesa/status/${checkoutRequestID}`);
          
          if (response.data.success) {
            const paymentData = response.data.data;
            
            // Check payment status
            if (paymentData.status === 'completed') {
              clearInterval(pollingInterval);
              setPollingStatus('success');
              props.onPaymentSuccess(paymentData);
            } 
            else if (paymentData.status === 'cancelled') {
              clearInterval(pollingInterval);
              setPollingStatus('cancelled');
              setStatusMessage('You cancelled the payment. Please try again.');
              props.onPaymentCancelled(paymentData);
            }
            else if (paymentData.status === 'failed') {
              clearInterval(pollingInterval);
              setPollingStatus('failed');
              setStatusMessage(paymentData.resultDesc || 'Payment failed. Please try again.');
              props.onPaymentFailed(paymentData);
            }
          }
        } catch (error) {
          console.error('Error polling payment status:', error);
        }
      }, 4000); // Poll every 4 seconds
    }
    
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [show, status, checkoutRequestID, pollingCount, props]);

  const getStatusIcon = () => {
    switch (pollingStatus === 'cancelled' ? 'cancelled' : status) {
      case 'success':
        return <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }}></i>;
      case 'failed':
      case 'cancelled':
        return <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: '3rem' }}></i>;
      default:
        return <i className="bi bi-hourglass-split text-primary" style={{ fontSize: '3rem' }}></i>;
    }
  };

  const getStatusTitle = () => {
    if (pollingStatus === 'cancelled') return 'Payment Cancelled';
    
    switch (status) {
      case 'success': return 'Payment Successful!';
      case 'failed': return 'Payment Failed';
      case 'processing': return 'Processing Payment';
      default: return 'Awaiting Payment';
    }
  };

  const getStatusMessage = () => {
    if (statusMessage) return statusMessage;
    
    if (pollingStatus === 'cancelled') {
      return 'You cancelled the payment. Please try again.';
    }
    
    switch (status) {
      case 'success': return 'Your payment has been processed successfully.';
      case 'failed': return error || 'There was a problem processing your payment. Please try again.';
      case 'processing': return 'Please check your phone and enter your M-Pesa PIN when prompted.';
      default: return 'Waiting to initiate payment...';
    }
  };

  return (
    <div className={`modal ${show ? 'show d-block' : 'd-none'}`} tabIndex={-1} role="dialog">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title text-center w-100">{getStatusTitle()}</h5>
          </div>
          <div className="modal-body">
            <div className="text-center mb-4">
              {status === 'processing' && pollingStatus === 'polling' ? (
                <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
              ) : (
                getStatusIcon()
              )}
              
              <p className="mt-3">{getStatusMessage()}</p>
            </div>
            
            {transactionDetails && (
              <>
                <hr />
                <h6>Transaction Details:</h6>
                <ul className="list-group list-group-flush small">
                  {transactionDetails.CheckoutRequestID && (
                    <li className="list-group-item d-flex justify-content-between">
                      <span>Request ID:</span>
                      <span className="text-muted">{transactionDetails.CheckoutRequestID}</span>
                    </li>
                  )}
                  {transactionDetails.CustomerMessage && (
                    <li className="list-group-item d-flex justify-content-between">
                      <span>Message:</span>
                      <span className="text-muted">{transactionDetails.CustomerMessage}</span>
                    </li>
                  )}
                </ul>
              </>
            )}
          </div>
          <div className="modal-footer">
            <Button 
              variant="primary" 
              onClick={onHide} 
              disabled={status === 'processing' && pollingStatus === 'polling'}
            >
              {status === 'success' ? 'Done' : 'Close'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MpesaPaymentForm = (props) => {
  const { invoiceId, amount: initialAmount, propertyReference } = props;
  const { user } = useAuth();
  const navigate = useNavigate();
  
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

      // Show modal with pending status
      setShowModal(true);
      setPaymentStatus('processing');
      
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
        // Status will be updated by polling
      } else {
        setPaymentStatus('failed');
        setError(response.data.message || 'Payment request failed');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setPaymentStatus('failed');
      setError(err.response?.data?.message || err.message || 'An error occurred');
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle payment status updates
  const handlePaymentSuccess = (paymentData) => {
    setPaymentStatus('success');
    // Update transaction details with payment data
    setTransactionDetails(prev => ({ ...prev, ...paymentData }));
  };

  const handlePaymentCancelled = (paymentData) => {
    setPaymentStatus('failed');
    setError('Payment cancelled by user. Please try again.');
    // Update transaction details with payment data
    setTransactionDetails(prev => ({ ...prev, ...paymentData }));
  };

  const handlePaymentFailed = (paymentData) => {
    setPaymentStatus('failed');
    setError(paymentData.resultDesc || 'Payment failed. Please try again.');
    // Update transaction details with payment data
    setTransactionDetails(prev => ({ ...prev, ...paymentData }));
  };

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <h4 className="mb-4">M-Pesa Payment</h4>
        
        {error && (
          <div className="alert alert-danger mb-3">
            {error}
          </div>
        )}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g., 0712345678"
              required
              disabled={loading}
            />
            <Form.Text className="text-muted">
              Enter your M-Pesa phone number
            </Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Amount (KES)</Form.Label>
            <Form.Control
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              disabled={loading || !!initialAmount}
              min={1}
            />
          </Form.Group>
          
          <Form.Group className="mb-4">
            <Form.Label>Invoice/Property Reference</Form.Label>
            <Form.Control
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              required
              disabled={loading || !!invoiceId || !!propertyReference}
            />
            <Form.Text className="text-muted">
              Enter invoice number or property reference
            </Form.Text>
          </Form.Group>
          
          <div className="d-flex justify-content-between">
            <Button 
              variant="primary" 
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  Processing...
                </>
              ) : 'Pay Now'}
            </Button>
            
            {invoiceId && (
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
          </div>
        </Form>
      </Card.Body>
      
      <PaymentStatusModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          if (paymentStatus === 'success' && invoiceId) {
            navigate(-1); // Go back if payment was successful
          }
        }}
        status={paymentStatus}
        transactionDetails={transactionDetails}
        error={error}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentCancelled={handlePaymentCancelled}
        onPaymentFailed={handlePaymentFailed}
      />
    </Card>
  );
};

export default MpesaPaymentForm; 