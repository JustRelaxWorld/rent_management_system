import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <Container className="py-5 text-center">
      <Row className="justify-content-center">
        <Col md={6}>
          <div className="mb-4">
            <h1 className="display-1 fw-bold text-primary">404</h1>
            <h2 className="mb-4">Page Not Found</h2>
            <p className="lead mb-5">
              The page you are looking for might have been removed, had its name changed,
              or is temporarily unavailable.
            </p>
            <Link to="/">
              <Button variant="primary" size="lg">
                <i className="fas fa-home me-2"></i> Go to Homepage
              </Button>
            </Link>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound; 