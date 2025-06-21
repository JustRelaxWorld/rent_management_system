import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-5">
      <Container>
        <Row className="text-center">
          <Col md={4} className="mb-4 mb-md-0">
            <h5>Rent Management System</h5>
            <p className="small">
              A comprehensive solution for property management, tenant-landlord communication, and rent payments.
            </p>
          </Col>
          
          <Col md={4} className="mb-4 mb-md-0">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><a href="/" className="text-light">Home</a></li>
              <li><a href="/login" className="text-light">Login</a></li>
              <li><a href="/register" className="text-light">Register</a></li>
            </ul>
          </Col>
          
          <Col md={4}>
            <h5>Contact</h5>
            <ul className="list-unstyled">
              <li><i className="fas fa-envelope me-2"></i> support@rentmanagement.com</li>
              <li><i className="fas fa-phone me-2"></i> +1 (123) 456-7890</li>
            </ul>
          </Col>
        </Row>
        
        <hr className="my-4" />
        
        <Row>
          <Col className="text-center">
            <p className="mb-0">
              &copy; {new Date().getFullYear()} Rent Management System. All rights reserved.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer; 