import React, { useState, FormEvent } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  
  const { email, password } = formData;
  
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const res = await api.post('/api/auth/login', {
        email,
        password
      });
      
      // Save token to localStorage
      localStorage.setItem('token', res.data.token);
      
      // Redirect based on user role
      if (res.data.user.role === 'tenant') {
        navigate('/tenant/dashboard');
      } else if (res.data.user.role === 'landlord') {
        navigate('/landlord/dashboard');
      } else if (res.data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
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