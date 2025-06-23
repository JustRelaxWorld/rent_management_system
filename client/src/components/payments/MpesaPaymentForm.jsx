import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Card, Spinner, Alert, ProgressBar } from 'react-bootstrap';
import { useAuth } from '../../utils/auth-context';
import api from '../../utils/api';

// Define PaymentStatusModal component inline to avoid import issues
const PaymentStatusModal = (props) => {
  const { show, onHide, status, transactionDetails, error, onRetry } = props;
  const [pollingCount, setPollingCount] = useState(0);
  const [pollingStatus, setPollingStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [checkoutRequestID, setCheckoutRequestID] = useState(null);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [expiryTime, setExpiryTime] = useState(null);

  // Extract checkout request ID and expiry time from transaction details
  useEffect(() => {
    if (transactionDetails?.CheckoutRequestID) {
      setCheckoutRequestID(transactionDetails.CheckoutRequestID);
    }
    
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
          // Don't set status here - let the polling handle it
        }
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [show, status, expiryTime]);

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
            setStatusMessage('Payment request timed out. Please try again.');
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
            else if (paymentData.status === 'expired') {
              clearInterval(pollingInterval);
              setPollingStatus('expired');
              setStatusMessage('Payment request expired. Please try again.');
              props.onPaymentExpired(paymentData);
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
    switch (pollingStatus) {
      case 'success':
        return <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }}></i>;
      case 'failed':
      case 'cancelled':
      case 'expired':
        return <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: '3rem' }}></i>;
      case 'timeout':
        return <i className="bi bi-exclamation-triangle-fill text-warning" style={{ fontSize: '3rem' }}></i>;
      default:
        return <i className="bi bi-hourglass-split text-primary" style={{ fontSize: '3rem' }}></i>;
    }
  };

  const getStatusTitle = () => {
    switch (pollingStatus) {
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
    
    switch (pollingStatus) {
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

  const isRetryable = ['failed', 'cancelled', 'expired', 'timeout'].includes(pollingStatus);

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
                <>
                  <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                  {timeLeft > 0 && (
                    <div className="mt-3">
                      <small className="text-muted">Time remaining: {formatTimeLeft(timeLeft)}</small>
                      <ProgressBar 
                        now={timeLeft} 
                        max={120} 
                        variant={timeLeft < 30 ? "danger" : timeLeft < 60 ? "warning" : "primary"} 
                        className="mt-2"
                      />
                    </div>
                  )}
                </>
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
                  {transactionDetails.amount && (
                    <li className="list-group-item d-flex justify-content-between">
                      <span>Amount:</span>
                      <span className="text-muted">KES {transactionDetails.amount}</span>
                    </li>
                  )}
                </ul>
              </>
            )}
          </div>
          <div className="modal-footer">
            {isRetryable && (
              <Button 
                variant="primary" 
                onClick={onRetry}
                className="me-2"
              >
                Retry Payment
              </Button>
            )}
            <Button 
              variant={pollingStatus === 'success' ? "success" : "secondary"} 
              onClick={onHide} 
              disabled={status === 'processing' && pollingStatus === 'polling'}
            >
              {pollingStatus === 'success' ? 'Done' : 'Close'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MpesaPaymentForm = (props) => {
  const { invoiceId, amount: initialAmount, propertyReference, onPaymentComplete } = props;
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
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [currentPaymentId, setCurrentPaymentId] = useState(null);

  // Prefill phone number if user has one
  useEffect(() => {
    if (user?.phone) {
      setPhoneNumber(user.phone);
    }
  }, [user]);

  // Load payment history for this invoice if available
  useEffect(() => {
    if (invoiceId) {
      fetchPaymentHistory(invoiceId);
    }
  }, [invoiceId]);

  const fetchPaymentHistory = async (invoiceId) => {
    try {
      const response = await api.get(`/api/payments/invoice/${invoiceId}`);
      if (response.data.success) {
        setPaymentHistory(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
    }
  };

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
    
    // Refresh payment history if we have an invoice ID
    if (invoiceId) {
      fetchPaymentHistory(invoiceId);
    }
    
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
    
    // Store payment ID for potential retry
    if (paymentData.id) {
      setCurrentPaymentId(paymentData.id);
    }
  };

  const handlePaymentCancelled = (paymentData) => {
    setPaymentStatus('cancelled');
    setTransactionDetails(prev => ({ ...prev, ...paymentData }));
    
    // Store payment ID for potential retry
    if (paymentData.id) {
      setCurrentPaymentId(paymentData.id);
    }
  };

  const handlePaymentExpired = (paymentData) => {
    setPaymentStatus('expired');
    setTransactionDetails(prev => ({ ...prev, ...paymentData }));
    
    // Store payment ID for potential retry
    if (paymentData.id) {
      setCurrentPaymentId(paymentData.id);
    }
  };

  const handleRetryPayment = async () => {
    setError(null);
    setLoading(true);
    
    try {
      // Reset UI state
      setShowModal(true);
      setPaymentStatus('processing');
      
      let response;
      
      if (currentPaymentId) {
        // Use the retry endpoint if we have a payment ID
        response = await api.post(`/api/mpesa/retry/${currentPaymentId}`);
      } else {
        // Otherwise, create a new payment request
        response = await api.post('/api/mpesa/stkpush', {
          phone: phoneNumber,
          amount: parseFloat(amount),
          invoice_id: reference
        });
      }

      // Update transaction details with response data
      setTransactionDetails(response.data.data);
      
      // Reset current payment ID since we're creating a new payment
      setCurrentPaymentId(null);
      
    } catch (err) {
      console.error('Payment retry error:', err);
      setPaymentStatus('failed');
      setError(err.response?.data?.message || err.message || 'Failed to retry payment');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    
    // If payment was successful, redirect or update UI as needed
    if (paymentStatus === 'success') {
      // Redirect to invoice page if we have an invoice ID
      if (invoiceId) {
        navigate(`/tenant/invoices/${invoiceId}`);
      }
    }
  };

  const getRecentPaymentStatus = () => {
    if (!paymentHistory || paymentHistory.length === 0) return null;
    
    const sortedPayments = [...paymentHistory].sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
    
    return sortedPayments[0];
  };

  const recentPayment = getRecentPaymentStatus();

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">M-Pesa Payment</h5>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        {recentPayment && recentPayment.status === 'completed' && (
          <Alert variant="success">
            <Alert.Heading>Payment Already Completed</Alert.Heading>
            <p>
              A payment of KES {recentPayment.amount} was already made on{' '}
              {new Date(recentPayment.created_at).toLocaleDateString()} at{' '}
              {new Date(recentPayment.created_at).toLocaleTimeString()}.
            </p>
          </Alert>
        )}
        
        {recentPayment && ['pending', 'failed', 'expired', 'cancelled'].includes(recentPayment.status) && (
          <Alert variant={recentPayment.status === 'pending' ? 'info' : 'warning'}>
            <Alert.Heading>
              {recentPayment.status === 'pending' ? 'Payment In Progress' : 'Previous Payment Incomplete'}
            </Alert.Heading>
            <p>
              A payment of KES {recentPayment.amount} was {recentPayment.status === 'pending' ? 'initiated' : recentPayment.status} on{' '}
              {new Date(recentPayment.created_at).toLocaleDateString()} at{' '}
              {new Date(recentPayment.created_at).toLocaleTimeString()}.
            </p>
            {recentPayment.status !== 'pending' && (
              <div className="d-flex justify-content-end">
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => {
                    setCurrentPaymentId(recentPayment.id);
                    handleRetryPayment();
                  }}
                >
                  Retry Payment
                </Button>
              </div>
            )}
          </Alert>
        )}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Phone Number (M-Pesa)</Form.Label>
            <Form.Control
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g. 07XXXXXXXX"
              disabled={loading}
              required
            />
            <Form.Text className="text-muted">
              Enter the phone number registered with M-Pesa
            </Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Amount (KES)</Form.Label>
            <Form.Control
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              disabled={loading || initialAmount !== undefined}
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Reference</Form.Label>
            <Form.Control
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Invoice or property reference"
              disabled={loading || invoiceId !== undefined || propertyReference !== undefined}
              required
            />
          </Form.Group>
          
          <div className="d-grid">
            <Button 
              variant="primary" 
              type="submit" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Processing...
                </>
              ) : (
                'Pay with M-Pesa'
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
      
      {/* Payment Status Modal */}
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
    </Card>
  );
};

export default MpesaPaymentForm; 