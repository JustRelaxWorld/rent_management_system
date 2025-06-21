import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const Header: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    
    if (!token) {
      setLoading(false);
      return;
    }
    
    const fetchUser = async () => {
      try {
        // Get current user using our API utility
        const res = await api.get('/api/auth/me');
        setUser(res.data.data);
      } catch (err) {
        // Token is invalid or expired
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, []);
  
  const logoutHandler = async () => {
    try {
      await api.get('/api/auth/logout');
      localStorage.removeItem('token');
      setUser(null);
      window.location.href = '/';
    } catch (err) {
      console.error('Logout error:', err);
    }
  };
  
  return (
    <header>
      <Navbar bg="primary" variant="dark" expand="lg" collapseOnSelect>
        <Container>
          <Navbar.Brand as={Link} to="/">Rent Management System</Navbar.Brand>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {!loading && (
                <>
                  {user ? (
                    <>
                      {/* Dashboard link based on user role */}
                      {user.role === 'tenant' && (
                        <Nav.Link as={Link} to="/tenant/dashboard">Dashboard</Nav.Link>
                      )}
                      
                      {user.role === 'landlord' && (
                        <Nav.Link as={Link} to="/landlord/dashboard">Dashboard</Nav.Link>
                      )}
                      
                      {user.role === 'admin' && (
                        <Nav.Link as={Link} to="/admin/dashboard">Dashboard</Nav.Link>
                      )}
                      
                      <NavDropdown title={user.name} id="username">
                        <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
                        <NavDropdown.Item onClick={logoutHandler}>
                          Logout
                        </NavDropdown.Item>
                      </NavDropdown>
                    </>
                  ) : (
                    <>
                      <Nav.Link as={Link} to="/login">
                        <i className="fas fa-user"></i> Login
                      </Nav.Link>
                      <Nav.Link as={Link} to="/register">
                        <i className="fas fa-user-plus"></i> Register
                      </Nav.Link>
                    </>
                  )}
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header; 