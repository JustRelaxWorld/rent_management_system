import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Container, Card, Tabs, Tab, Alert } from 'react-bootstrap';
import MpesaPaymentForm from './MpesaPaymentForm';
import api from '../../utils/api';

const PaymentsPage = () => {
  const { invoiceId } = useParams();
  const location = useLocation();
  const [tabKey, setTabKey] = useState('mpesa');
  const [invoiceDetails, setInvoiceDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Extract query parameters
  const queryParams = new URLSearchParams(location.search);
  const amount = queryParams.get('amount') ? parseFloat(queryParams.get('amount')) : undefined;
  const propertyRef = queryParams.get('propertyRef') || undefined;

  // Fetch invoice details if invoiceId is provided
  useEffect(() => {
    if (invoiceId) {
      setLoading(true);
      api.get(`/api/invoices/${invoiceId}`)
        .then(response => {
          setInvoiceDetails(response.data.data);
        })
        .catch(err => {
          console.error('Error fetching invoice:', err);
          setError('Failed to fetch invoice details');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [invoiceId]);

  return (
    <Container className="py-5">
      <h2 className="mb-4">Make a Payment</h2>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {invoiceId && invoiceDetails && (
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <h5>Invoice #{invoiceId}</h5>
            <hr />
            <div className="d-flex justify-content-between">
              <span>Property: {invoiceDetails.property_name}</span>
              <span>Amount Due: KES {invoiceDetails.amount}</span>
            </div>
            <div className="text-muted mt-2">
              Due Date: {new Date(invoiceDetails.due_date).toLocaleDateString()}
            </div>
          </Card.Body>
        </Card>
      )}

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
    </Container>
  );
};

export default PaymentsPage; 