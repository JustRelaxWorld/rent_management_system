import React, { useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import EnhancedMpesaPaymentForm from './EnhancedMpesaPaymentForm';
import styled from 'styled-components';

const StatusMessageExample = styled.div`
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-align: center;
  padding: 1rem 1.5rem;
  border-radius: 4px;
  width: 100%;
`;

const ResultContainer = styled(Card)`
  margin-bottom: 1.5rem;
  border-color: #28a745;
`;

const ResultHeader = styled(Card.Header)`
  background-color: #28a745;
  color: white;
  font-weight: 600;
`;

const ResultBody = styled(Card.Body)`
  max-height: 300px;
  overflow-y: auto;
`;

/**
 * Test page for M-Pesa payment status with text-only display
 * No icons, images, or spinners - just plain text
 */
const TestMpesaStatus = () => {
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  
  const handlePaymentComplete = (result) => {
    setPaymentComplete(true);
    setPaymentData(result.data);
    console.log('Payment completed:', result);
  };
  
  const handleReset = () => {
    setPaymentComplete(false);
    setPaymentData(null);
  };
  
  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h2>M-Pesa Payment Status Test</h2>
          <p className="text-muted">
            This page demonstrates text-only payment status messages without any icons.
          </p>
        </Col>
      </Row>
      
      <Row>
        <Col md={6}>
          <h4>Make a Payment</h4>
          <EnhancedMpesaPaymentForm 
            amount="100"
            invoiceId="TEST123"
            onPaymentComplete={handlePaymentComplete}
          />
        </Col>
        
        <Col md={6}>
          <h4>Status Message Examples</h4>
          
          <Card className="mb-4">
            <Card.Body>
              <h5>Success Example</h5>
              <StatusMessageExample style={{ backgroundColor: '#d4edda', color: '#155724' }}>
                Payment Successful. Please proceed.
              </StatusMessageExample>
            </Card.Body>
          </Card>
          
          <Card className="mb-4">
            <Card.Body>
              <h5>Cancelled Example</h5>
              <StatusMessageExample style={{ backgroundColor: '#f8d7da', color: '#721c24' }}>
                Payment Failed. Request cancelled by user.
              </StatusMessageExample>
            </Card.Body>
          </Card>
          
          <Card className="mb-4">
            <Card.Body>
              <h5>Failed Example</h5>
              <StatusMessageExample style={{ backgroundColor: '#f8d7da', color: '#721c24' }}>
                Payment Failed. Please try again.
              </StatusMessageExample>
            </Card.Body>
          </Card>
          
          {paymentComplete && paymentData && (
            <ResultContainer>
              <ResultHeader>
                Payment Result
              </ResultHeader>
              <ResultBody>
                <pre className="mb-3">{JSON.stringify(paymentData, null, 2)}</pre>
                <Button 
                  variant="outline-secondary" 
                  onClick={handleReset}
                >
                  Reset
                </Button>
              </ResultBody>
            </ResultContainer>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default TestMpesaStatus; 