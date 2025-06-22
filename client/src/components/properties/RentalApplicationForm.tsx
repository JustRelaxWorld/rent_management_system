import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Card, Alert, Container, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../utils/auth-context';
import api from '../../utils/api';

interface RentalApplicationFormProps {
  propertyId?: string;
  propertyTitle?: string;
}

const RentalApplicationForm: React.FC<RentalApplicationFormProps> = ({ 
  propertyId: propPropertyId,
  propertyTitle: propPropertyTitle
}) => {
  const { propertyId: urlPropertyId } = useParams<{ propertyId: string }>();
  const propertyId = propPropertyId || urlPropertyId;
  
  const [formData, setFormData] = useState({
    move_in_date: '',
    monthly_income: '',
    employment_status: 'employed',
    employer: '',
    additional_notes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [propertyTitle, setPropertyTitle] = useState(propPropertyTitle || '');
  
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // If property title is not provided as prop, fetch it
  React.useEffect(() => {
    if (!propPropertyTitle && propertyId) {
      api.get(`/api/properties/${propertyId}`)
        .then(response => {
          setPropertyTitle(response.data.data.title);
        })
        .catch(err => {
          console.error('Error fetching property details:', err);
          setError('Could not load property details');
        });
    }
  }, [propertyId, propPropertyTitle]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!propertyId) {
      setError('Property ID is missing');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await api.post('/api/applications', {
        property_id: propertyId,
        ...formData
      });
      
      setSuccess(true);
      setLoading(false);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/tenant/applications');
      }, 2000);
      
    } catch (err: any) {
      setLoading(false);
      
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Failed to submit application');
      } else {
        setError('Network error. Please try again later.');
      }
    }
  };
  
  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header as="h5">
              Rental Application {propertyTitle && `for ${propertyTitle}`}
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && (
                <Alert variant="success">
                  Your application has been submitted successfully! Redirecting to your applications...
                </Alert>
              )}
              
              {!success && (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Desired Move-in Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="move_in_date"
                      value={formData.move_in_date}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Monthly Income ($)</Form.Label>
                    <Form.Control
                      type="number"
                      name="monthly_income"
                      value={formData.monthly_income}
                      onChange={handleChange}
                      placeholder="Enter your monthly income"
                      required
                    />
                    <Form.Text className="text-muted">
                      This helps the landlord verify you can afford the rent
                    </Form.Text>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Employment Status</Form.Label>
                    <Form.Select
                      name="employment_status"
                      value={formData.employment_status}
                      onChange={handleChange}
                      required
                    >
                      <option value="employed">Employed</option>
                      <option value="self-employed">Self-Employed</option>
                      <option value="unemployed">Unemployed</option>
                      <option value="retired">Retired</option>
                      <option value="student">Student</option>
                    </Form.Select>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Employer</Form.Label>
                    <Form.Control
                      type="text"
                      name="employer"
                      value={formData.employer}
                      onChange={handleChange}
                      placeholder="Enter your employer name"
                      required={formData.employment_status === 'employed'}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Additional Notes</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="additional_notes"
                      value={formData.additional_notes}
                      onChange={handleChange}
                      placeholder="Any additional information you'd like to share with the landlord"
                    />
                  </Form.Group>
                  
                  <div className="d-grid gap-2">
                    <Button 
                      variant="primary" 
                      type="submit" 
                      disabled={loading}
                    >
                      {loading ? 'Submitting...' : 'Submit Application'}
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => navigate(-1)}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RentalApplicationForm; 