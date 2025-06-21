import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="py-5">
      {/* Hero Section */}
      <div className="bg-primary text-white py-5 mb-5 rounded">
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="mb-4 mb-md-0">
              <h1 className="display-4 fw-bold">Rent Management Made Easy</h1>
              <p className="lead">
                A comprehensive platform for property owners and tenants to manage
                rentals, payments, and maintenance requests all in one place.
              </p>
              <div className="d-flex gap-3">
                <Link to="/register">
                  <Button variant="light" size="lg">Get Started</Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline-light" size="lg">Login</Button>
                </Link>
              </div>
            </Col>
            <Col md={6}>
              <img
                src="/images/hero-image.svg"
                alt="Property Management"
                className="img-fluid rounded shadow"
              />
            </Col>
          </Row>
        </Container>
      </div>

      {/* Features Section */}
      <Container className="mb-5">
        <h2 className="text-center mb-5">Key Features</h2>
        <Row>
          <Col md={4} className="mb-4">
            <Card className="h-100 shadow-sm">
              <Card.Body className="text-center p-4">
                <div className="feature-icon mb-3">
                  <i className="fas fa-home fa-3x text-primary"></i>
                </div>
                <Card.Title>Property Management</Card.Title>
                <Card.Text>
                  Easily manage multiple properties, track occupancy, and handle lease agreements in one place.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4} className="mb-4">
            <Card className="h-100 shadow-sm">
              <Card.Body className="text-center p-4">
                <div className="feature-icon mb-3">
                  <i className="fas fa-file-invoice-dollar fa-3x text-primary"></i>
                </div>
                <Card.Title>Rent Collection</Card.Title>
                <Card.Text>
                  Automated invoicing, M-Pesa integration, and payment tracking to streamline rent collection.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4} className="mb-4">
            <Card className="h-100 shadow-sm">
              <Card.Body className="text-center p-4">
                <div className="feature-icon mb-3">
                  <i className="fas fa-tools fa-3x text-primary"></i>
                </div>
                <Card.Title>Maintenance Requests</Card.Title>
                <Card.Text>
                  Simple system for tenants to report issues and landlords to track and resolve maintenance requests.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* How It Works Section */}
      <div className="bg-light py-5 mb-5 rounded">
        <Container>
          <h2 className="text-center mb-5">How It Works</h2>
          <Row className="g-4">
            <Col md={3}>
              <div className="text-center">
                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                  <h3 className="m-0">1</h3>
                </div>
                <h5>Sign Up</h5>
                <p className="small">Create an account as a tenant or landlord</p>
              </div>
            </Col>
            
            <Col md={3}>
              <div className="text-center">
                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                  <h3 className="m-0">2</h3>
                </div>
                <h5>Add Properties</h5>
                <p className="small">Landlords add properties and assign tenants</p>
              </div>
            </Col>
            
            <Col md={3}>
              <div className="text-center">
                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                  <h3 className="m-0">3</h3>
                </div>
                <h5>Manage Payments</h5>
                <p className="small">Generate invoices and process payments</p>
              </div>
            </Col>
            
            <Col md={3}>
              <div className="text-center">
                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                  <h3 className="m-0">4</h3>
                </div>
                <h5>Track Maintenance</h5>
                <p className="small">Handle maintenance requests efficiently</p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* CTA Section */}
      <Container className="text-center py-5">
        <h2>Ready to streamline your rental management?</h2>
        <p className="lead mb-4">
          Join thousands of landlords and tenants who are saving time and reducing stress.
        </p>
        <Link to="/register">
          <Button variant="primary" size="lg">Get Started Now</Button>
        </Link>
      </Container>
    </div>
  );
};

export default Home; 