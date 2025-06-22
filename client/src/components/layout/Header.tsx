import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../utils/auth-context';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const guestLinks = (
    <>
      <Nav.Link as={Link} to="/">Home</Nav.Link>
      <Nav.Link as={Link} to="/login">Login</Nav.Link>
      <Nav.Link as={Link} to="/register">Register</Nav.Link>
    </>
  );
  
  const authLinks = (
    <>
      {user?.role === 'tenant' && (
        <>
          <Nav.Link as={Link} to="/tenant">Dashboard</Nav.Link>
          <Nav.Link as={Link} to="/tenant/properties">Browse Properties</Nav.Link>
        </>
      )}
      
      {user?.role === 'landlord' && (
        <>
          <Nav.Link as={Link} to="/landlord">Dashboard</Nav.Link>
          <NavDropdown title="Properties" id="properties-dropdown">
            <NavDropdown.Item as={Link} to="/landlord/properties">My Properties</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/landlord/properties/add">Add Property</NavDropdown.Item>
          </NavDropdown>
          <Nav.Link as={Link} to="/landlord/applications">My Applications</Nav.Link>
        </>
      )}
      
      {user?.role === 'admin' && (
        <Nav.Link as={Link} to="/admin">Admin Dashboard</Nav.Link>
      )}
      
      <NavDropdown title={user?.name || 'Account'} id="account-dropdown">
        <NavDropdown.Item>Profile</NavDropdown.Item>
        <NavDropdown.Divider />
        <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
      </NavDropdown>
    </>
  );
  
  return (
    <header>
      <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect>
        <Container>
          <Navbar.Brand as={Link} to="/">Rent Management</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {isAuthenticated ? authLinks : guestLinks}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header; 