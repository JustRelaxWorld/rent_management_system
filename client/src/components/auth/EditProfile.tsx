import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../utils/auth-context';

const EditProfile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Populate form with user data when component mounts
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '',
        confirmPassword: ''
      });
    }
  }, [user]);
  
  const { name, email, phone, password, confirmPassword } = formData;
  
  const onChange = (e: ChangeEvent<HTMLElement>) => {
    const target = e.target as HTMLInputElement;
    setFormData({ ...formData, [target.name]: target.value });
  };
  
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Validate passwords if provided
      if (password) {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
      }
      
      // Prepare update data
      const updateData: any = {
        name,
        phone
      };
      
      // Only include password if it's provided
      if (password) {
        updateData.password = password;
      }
      
      // Email changes might require additional verification, so we're not allowing it here
      // If needed, you can implement a separate email change flow with verification
      
      // Update user profile
      const res = await api.put(`/api/users/${user?.id}`, updateData);
      
      if (res.data.success) {
        setSuccess('Profile updated successfully');
        
        // Update local storage user data
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        userData.name = name;
        userData.phone = phone;
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        setError('Failed to update profile');
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const goBack = () => {
    navigate(-1);
  };
  
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <div className="card shadow">
            <div className="card-body p-4">
              <h2 className="text-center mb-4">Edit Profile</h2>
              
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3" controlId="name">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={name}
                    onChange={onChange}
                    placeholder="Enter your full name"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    placeholder="Enter your email"
                    disabled
                    readOnly
                  />
                  <Form.Text className="text-muted">
                    Email cannot be changed directly. Contact support for assistance.
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="phone">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="phone"
                    value={phone}
                    onChange={onChange}
                    placeholder="Enter your phone number"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={password}
                    onChange={onChange}
                    placeholder="Enter new password (leave blank to keep current)"
                    minLength={6}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="confirmPassword">
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={onChange}
                    placeholder="Confirm new password"
                    minLength={6}
                  />
                </Form.Group>
                
                <div className="d-flex justify-content-between mt-4">
                  <Button variant="outline-secondary" onClick={goBack}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Profile'}
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default EditProfile; 