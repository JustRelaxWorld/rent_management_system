import React, { useState, FormEvent } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/auth-context';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const { email, password } = formData;
  
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Use the auth context login function
      await login(email, password);
      
      // After successful login, get user data from localStorage
      const userData = localStorage.getItem('user');
      let userRole = '';
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          userRole = user.role;
          console.log('User role from localStorage:', userRole);
          
          // Redirect based on user role
          console.log('Redirecting based on role:', userRole);
          if (userRole === 'tenant') {
            navigate('/tenant-dashboard');
          } else if (userRole === 'landlord') {
            navigate('/landlord-dashboard');
          } else if (userRole === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/');
          }
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
          setError('Error processing user data. Please try again.');
          setLoading(false);
        }
      } else {
        console.error('No user data found in localStorage after login');
        setError('Login successful but user data not found. Please try again.');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.message === 'Invalid response format from login API') {
        setError('Server response format error. Please contact support.');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
      setLoading(false);
    }
  };
  
  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <div className="card shadow">
            <div className="card-body p-5">
              <h2 className="text-center mb-4">Login</h2>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    placeholder="Enter your email"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={password}
                    onChange={onChange}
                    placeholder="Enter your password"
                    required
                  />
                </Form.Group>
                
                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 mt-3"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </Form>
              
              <div className="text-center mt-4">
                <p>
                  Don't have an account?{' '}
                  <a href="/register" className="text-decoration-none">
                    Register
                  </a>
                </p>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login; 