import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Container, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../utils/auth-context';

interface MaintenanceRequestFormProps {
  propertyId?: number;
}

const MaintenanceRequestForm: React.FC<MaintenanceRequestFormProps> = ({ propertyId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    property_id: propertyId || '',
    title: '',
    description: '',
    type: 'plumbing', // Default value
    priority: 'medium', // Default value
  });

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        // Only fetch properties if propertyId is not provided
        if (!propertyId) {
          const response = await api.get('/api/properties');
          // Filter properties that are associated with the tenant
          // This would ideally come from a specific endpoint that returns only tenant's properties
          setProperties(response.data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch properties:', err);
        setError('Failed to load properties. Please try again later.');
      }
    };

    if (user?.role === 'tenant') {
      fetchProperties();
    }
  }, [user, propertyId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await api.post('/api/maintenance', formData);
      setSuccess('Maintenance request submitted successfully!');
      setFormData({
        property_id: propertyId || '',
        title: '',
        description: '',
        type: 'plumbing',
        priority: 'medium',
      });
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/tenant/dashboard');
      }, 2000);
    } catch (err: any) {
      console.error('Error submitting maintenance request:', err);
      setError(err.response?.data?.message || 'Failed to submit maintenance request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'tenant') {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          Only tenants can submit maintenance requests.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">Submit Maintenance Request</h4>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                {!propertyId && (
                  <Form.Group className="mb-3">
                    <Form.Label>Property</Form.Label>
                    <Form.Select
                      name="property_id"
                      value={formData.property_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Property</option>
                      {properties.map(property => (
                        <option key={property.id} value={property.id}>
                          {property.title} - {property.address}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                )}

                <Form.Group className="mb-3">
                  <Form.Label>Request Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Brief title of the issue"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Maintenance Type</Form.Label>
                  <Form.Select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                  >
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="hvac">HVAC (Heating/Cooling)</option>
                    <option value="appliance">Appliance</option>
                    <option value="structural">Structural</option>
                    <option value="pest">Pest Control</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Priority</Form.Label>
                  <Form.Select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    required
                  >
                    <option value="low">Low - Not urgent</option>
                    <option value="medium">Medium - Needs attention soon</option>
                    <option value="high">High - Urgent issue</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Please describe the issue in detail"
                    required
                  />
                </Form.Group>

                <div className="d-flex justify-content-end">
                  <Button 
                    variant="secondary" 
                    className="me-2"
                    onClick={() => navigate('/tenant/dashboard')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default MaintenanceRequestForm; 