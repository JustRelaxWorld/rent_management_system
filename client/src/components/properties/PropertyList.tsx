import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const PropertyList: React.FC = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        // Get current user
        const userResponse = await api.get('/api/auth/me');
        setUser(userResponse.data.data);

        // Get properties owned by landlord
        const propertiesResponse = await api.get(`/api/properties/landlord/${userResponse.data.data.id}`);
        setProperties(propertiesResponse.data.data || []);
        setLoading(false);
      } catch (err: any) {
        setError('Failed to load properties');
        setLoading(false);
        console.error('Error fetching properties:', err);
      }
    };

    fetchProperties();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await api.delete(`/api/properties/${id}`);
        setProperties(properties.filter(property => property.id !== id));
      } catch (err: any) {
        console.error('Error deleting property:', err);
        alert('Failed to delete property');
      }
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading properties...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>My Properties</h1>
        <Button variant="primary" onClick={() => navigate('/properties/add')}>
          Add New Property
        </Button>
      </div>

      {properties.length === 0 ? (
        <Alert variant="info">
          You don't have any properties yet. Click the "Add New Property" button to get started.
        </Alert>
      ) : (
        <Row>
          {properties.map(property => (
            <Col md={6} lg={4} className="mb-4" key={property.id}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title>{property.title}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">{property.address}, {property.city}</Card.Subtitle>
                  <hr />
                  <div className="d-flex justify-content-between mb-2">
                    <span>Type:</span>
                    <span className="fw-bold">{property.type}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Bedrooms:</span>
                    <span className="fw-bold">{property.bedrooms}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Bathrooms:</span>
                    <span className="fw-bold">{property.bathrooms}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Rent:</span>
                    <span className="fw-bold">${parseFloat(property.rent_amount).toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Status:</span>
                    <Badge bg={property.is_available ? 'success' : 'warning'}>
                      {property.is_available ? 'Available' : 'Occupied'}
                    </Badge>
                  </div>
                </Card.Body>
                <Card.Footer className="bg-white">
                  <div className="d-flex justify-content-between">
                    <Link to={`/properties/edit/${property.id}`}>
                      <Button variant="outline-primary" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDelete(property.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default PropertyList; 