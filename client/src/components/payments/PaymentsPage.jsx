import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Container, Card, Tabs, Tab, Alert, Badge, Button, Spinner } from 'react-bootstrap';
import MpesaPaymentForm from './MpesaPaymentForm';
import api from '../../utils/api';

const PaymentStatusBadge = ({ status }) => {
  let variant = 'secondary';
  
  switch (status) {
    case 'completed':
      variant = 'success';
      break;
    case 'pending':
      variant = 'warning';
      break;
    case 'failed':
    case 'expired':
    case 'cancelled':
      variant = 'danger';
      break;
    default:
      variant = 'secondary';
  }
  
  return (
    <Badge bg={variant} className="text-capitalize">
      {status}
    </Badge>
  );
};

const PaymentsPage = () => {
  const { invoiceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [tabKey, setTabKey] = useState('mpesa');
  const [invoiceDetails, setInvoiceDetails] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Extract query parameters
  const queryParams = new URLSearchParams(location.search);
  const amount = queryParams.get('amount') ? parseFloat(queryParams.get('amount')) : undefined;
  const propertyRef = queryParams.get('propertyRef') || undefined;
  const returnUrl = queryParams.get('returnUrl') || undefined;

  // Fetch invoice details if invoiceId is provided
  useEffect(() => {
    if (invoiceId) {
      setLoading(true);
      Promise.all([
        api.get(`/api/invoices/${invoiceId}`),
        api.get(`/api/payments/invoice/${invoiceId}`)
      ])
        .then(([invoiceResponse, paymentsResponse]) => {
          setInvoiceDetails(invoiceResponse.data.data);
          setPaymentHistory(paymentsResponse.data.data || []);
        })
        .catch(err => {
          console.error('Error fetching payment data:', err);
          setError('Failed to fetch payment details');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [invoiceId, refreshTrigger]);

  const handlePaymentComplete = (result) => {
    // Trigger a refresh of the payment history
    setRefreshTrigger(prev => prev + 1);
    
    // If payment was successful and we have a return URL, redirect after a short delay
    if (result.status === 'success' && returnUrl) {
      setTimeout(() => {
        navigate(returnUrl);
      }, 3000);
    }
  };

  const getLatestPayment = () => {
    if (!paymentHistory || paymentHistory.length === 0) return null;
    
    return [...paymentHistory].sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    )[0];
  };

  const latestPayment = getLatestPayment();
  const isPaid = invoiceDetails?.status === 'paid' || (latestPayment && latestPayment.status === 'completed');

  return (
    <Container className="py-5">
      <h2 className="mb-4">Make a Payment</h2>

      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading && (
        <div className="text-center mb-4">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading payment details...</p>
        </div>
      )}

      {invoiceId && invoiceDetails && (
        <Card className="mb-4 shadow-sm">
          <Card.Header className={isPaid ? 'bg-success text-white' : 'bg-primary text-white'}>
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Invoice #{invoiceId}</h5>
              <Badge bg={isPaid ? 'light' : 'warning'} text={isPaid ? 'dark' : 'dark'}>
                {isPaid ? 'PAID' : 'UNPAID'}
              </Badge>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="row">
              <div className="col-md-6">
                <p><strong>Property:</strong> {invoiceDetails.property_name}</p>
                <p><strong>Description:</strong> {invoiceDetails.description || 'Rent Payment'}</p>
                <p><strong>Due Date:</strong> {new Date(invoiceDetails.due_date).toLocaleDateString()}</p>
              </div>
              <div className="col-md-6 text-md-end">
                <h3>KES {invoiceDetails.amount}</h3>
                <p className={`text-${isPaid ? 'success' : 'danger'}`}>
                  {isPaid ? 'Paid' : 'Payment Due'}
                </p>
                {isPaid && (
                  <Button 
                    variant="outline-success" 
                    size="sm"
                    onClick={() => navigate(`/tenant/invoices/${invoiceId}`)}
                  >
                    View Receipt
                  </Button>
                )}
              </div>
            </div>
            
            {paymentHistory.length > 0 && (
              <div className="mt-4">
                <h6>Payment History</h6>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentHistory.map(payment => (
                        <tr key={payment.id}>
                          <td>{new Date(payment.created_at).toLocaleDateString()}</td>
                          <td>KES {payment.amount}</td>
                          <td className="text-capitalize">{payment.payment_method}</td>
                          <td><PaymentStatusBadge status={payment.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {!isPaid && (
        <Card className="shadow-sm">
          <Card.Header>
            <Tabs
              activeKey={tabKey}
              onSelect={(k) => k && setTabKey(k)}
              className="mb-3"
              justify
            >
              <Tab eventKey="mpesa" title="M-Pesa Payment">
              </Tab>
              <Tab eventKey="bank" title="Bank Transfer" disabled>
              </Tab>
              <Tab eventKey="cash" title="Cash Payment" disabled>
              </Tab>
            </Tabs>
          </Card.Header>
          
          <Card.Body>
            {tabKey === 'mpesa' && (
              <MpesaPaymentForm 
                invoiceId={invoiceId} 
                amount={invoiceDetails?.amount || amount} 
                propertyReference={propertyRef}
                onPaymentComplete={handlePaymentComplete}
              />
            )}
            
            {tabKey === 'bank' && (
              <p>Bank Transfer option coming soon</p>
            )}
            
            {tabKey === 'cash' && (
              <p>Cash Payment option coming soon</p>
            )}
          </Card.Body>
        </Card>
      )}

      {isPaid && (
        <Alert variant="success">
          <Alert.Heading>Payment Completed!</Alert.Heading>
          <p>
            This invoice has been paid. Thank you for your payment.
          </p>
          <div className="d-flex justify-content-end">
            <Button 
              variant="outline-success" 
              onClick={() => navigate(returnUrl || '/tenant/dashboard')}
            >
              Return to Dashboard
            </Button>
          </div>
        </Alert>
      )}
    </Container>
  );
};

export default PaymentsPage; 