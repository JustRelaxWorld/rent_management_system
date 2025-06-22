import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Alert } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../utils/auth-context';

const PropertyView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [property, setProperty] = useState<any>(null);
  const [landlord, setLandlord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        const propertyResponse = await api.get(`/api/properties/${id}`);
        setProperty(propertyResponse.data.data);
        
        // Fetch landlord details
        if (propertyResponse.data.data.landlord_id) {
          try {
            const landlordResponse = await api.get(`/api/users/${propertyResponse.data.data.landlord_id}`);
            setLandlord(landlordResponse.data.data);
          } catch (err) {
            console.error('Error fetching landlord details:', err);
            // Continue even if landlord details can't be fetched
          }
        }
        
        setLoading(false);
      } catch (err: any) {
        setError('Failed to load property details');
        setLoading(false);
        console.error('Error fetching property:', err);
      }
    };

    fetchPropertyDetails();
  }, [id]);

  const handleApplyForRental = () => {
    // This would typically open a rental application form or contact the landlord
    alert('Rental application feature will be implemented in a future update.');
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading property details...</p>
      </Container>
    );
  }

  if (error || !property) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error || 'Property not found'}
        </Alert>
        <Button 
          variant="outline-primary" 
          onClick={() => navigate(-1)}
          className="mt-3"
        >
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row>
        <Col lg={8}>
          <h1>{property.title}</h1>
          <p className="text-muted mb-4">{property.address}, {property.city}</p>
          
          <div className="mb-4">
            <h4>Description</h4>
            <p>{property.description || 'No description available.'}</p>
          </div>
          
          <div className="mb-4">
            <h4>Property Details</h4>
            <Row>
              <Col md={6}>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <strong>Type:</strong> {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
                  </li>
                  <li className="mb-2">
                    <strong>Bedrooms:</strong> {property.bedrooms}
                  </li>
                  <li className="mb-2">
                    <strong>Bathrooms:</strong> {property.bathrooms}
                  </li>
                </ul>
              </Col>
              <Col md={6}>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <strong>Size:</strong> {property.size} sq ft
                  </li>
                  <li className="mb-2">
                    <strong>Status:</strong>{' '}
                    <Badge bg={property.is_available ? 'success' : 'warning'}>
                      {property.is_available ? 'Available' : 'Occupied'}
                    </Badge>
                  </li>
                </ul>
              </Col>
            </Row>
          </div>
          
          {user?.role === 'tenant' && property.is_available && (
            <Link 
              to={`/tenant/properties/${property.id}/apply`} 
              className="btn btn-primary mt-3"
            >
              Apply for this Property
            </Link>
          )}
        </Col>
        
        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Rental Information</Card.Title>
              <hr />
              
              <div className="d-flex justify-content-between mb-3">
                <span>Monthly Rent:</span>
                <span className="fw-bold">${parseFloat(property.rent_amount).toFixed(2)}</span>
              </div>
              
              {property.is_available ? (
                <Button 
                  variant="primary" 
                  className="w-100 mt-3"
                  onClick={handleApplyForRental}
                >
                  Apply for Rental
                </Button>
              ) : (
                <Alert variant="warning" className="mt-3 mb-0">
                  This property is currently not available for rent.
                </Alert>
              )}
            </Card.Body>
          </Card>
          
          {landlord && (
            <Card className="shadow-sm mt-4">
              <Card.Body>
                <Card.Title>Landlord Information</Card.Title>
                <hr />
                <p><strong>Name:</strong> {landlord.name}</p>
                {landlord.email && <p><strong>Email:</strong> {landlord.email}</p>}
                {landlord.phone && <p><strong>Phone:</strong> {landlord.phone}</p>}
              </Card.Body>
            </Card>
          )}
          
          <div className="mt-4">
            <Button 
              variant="outline-secondary" 
              className="w-100"
              onClick={() => navigate(-1)}
            >
              Back to Properties
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default PropertyView; 