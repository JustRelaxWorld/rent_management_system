import React, { useState, useEffect, ChangeEvent } from 'react';
import { Container, Row, Col, Card, Badge, Button, Form, InputGroup, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const TenantPropertyList: React.FC = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    city: '',
    type: '',
    minBedrooms: '',
    maxRent: '',
    onlyAvailable: true
  });

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        // Get all properties
        const response = await api.get('/api/properties');
        setProperties(response.data.data || []);
        setLoading(false);
      } catch (err: any) {
        setError('Failed to load properties');
        setLoading(false);
        console.error('Error fetching properties:', err);
      }
    };

    fetchProperties();
  }, []);

  useEffect(() => {
    // Apply filters whenever filters or properties change
    let result = [...properties];
    
    if (filters.city) {
      result = result.filter(property => 
        property.city.toLowerCase().includes(filters.city.toLowerCase())
      );
    }
    
    if (filters.type) {
      result = result.filter(property => property.type === filters.type);
    }
    
    if (filters.minBedrooms) {
      const minBeds = parseInt(filters.minBedrooms);
      result = result.filter(property => property.bedrooms >= minBeds);
    }
    
    if (filters.maxRent) {
      const maxRent = parseFloat(filters.maxRent);
      result = result.filter(property => parseFloat(property.rent_amount) <= maxRent);
    }
    
    if (filters.onlyAvailable) {
      result = result.filter(property => property.is_available);
    }
    
    setFilteredProperties(result);
  }, [properties, filters]);

  const handleFilterChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : value
    }));
  };

  const resetFilters = () => {
    setFilters({
      city: '',
      type: '',
      minBedrooms: '',
      maxRent: '',
      onlyAvailable: true
    });
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
      <h1 className="mb-4">Available Properties</h1>
      
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Card.Title>Filter Properties</Card.Title>
          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>City</Form.Label>
                <Form.Control
                  type="text"
                  name="city"
                  value={filters.city}
                  onChange={handleFilterChange}
                  placeholder="Enter city"
                />
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Property Type</Form.Label>
                <Form.Select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                >
                  <option value="">All Types</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="condo">Condo</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="commercial">Commercial</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Min Bedrooms</Form.Label>
                <Form.Select
                  name="minBedrooms"
                  value={filters.minBedrooms}
                  onChange={handleFilterChange}
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Max Rent</Form.Label>
                <InputGroup>
                  <InputGroup.Text>$</InputGroup.Text>
                  <Form.Control
                    type="number"
                    name="maxRent"
                    value={filters.maxRent}
                    onChange={handleFilterChange}
                    placeholder="Any"
                  />
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              name="onlyAvailable"
              checked={filters.onlyAvailable}
              onChange={handleFilterChange}
              label="Show only available properties"
            />
          </Form.Group>
          
          <Button variant="outline-secondary" size="sm" onClick={resetFilters}>
            Reset Filters
          </Button>
        </Card.Body>
      </Card>
      
      {filteredProperties.length === 0 ? (
        <Alert variant="info">
          No properties match your search criteria. Try adjusting your filters.
        </Alert>
      ) : (
        <>
          <p className="mb-4">Showing {filteredProperties.length} properties</p>
          <Row>
            {filteredProperties.map(property => (
              <Col md={6} lg={4} className="mb-4" key={property.id}>
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <Card.Title>{property.title}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">{property.address}, {property.city}</Card.Subtitle>
                    <hr />
                    <Card.Text>
                      <strong>Rent:</strong> ${property.rent_amount}/month<br />
                      <strong>Bedrooms:</strong> {property.bedrooms}<br />
                      <strong>Bathrooms:</strong> {property.bathrooms}
                    </Card.Text>
                    <div className="d-flex justify-content-between">
                      <Link to={`/tenant/properties/${property.id}/apply`} className="btn btn-primary">
                        Apply Now
                      </Link>
                      <Link to={`/tenant/properties/${property.id}`} className="btn btn-outline-secondary">
                        View Details
                      </Link>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}
    </Container>
  );
};

export default TenantPropertyList;
