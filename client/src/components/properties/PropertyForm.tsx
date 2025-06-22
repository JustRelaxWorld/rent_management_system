import React, { useState, useEffect, FormEvent } from 'react';
import { Container, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

interface PropertyFormData {
  title: string;
  description: string;
  address: string;
  city: string;
  type: string;
  bedrooms: string;
  bathrooms: string;
  size: string;
  rent_amount: string;
  is_available: boolean;
}

const PropertyForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    address: '',
    city: '',
    type: 'apartment',
    bedrooms: '1',
    bathrooms: '1',
    size: '0',
    rent_amount: '0',
    is_available: true,
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      if (isEditMode) {
        setLoading(true);
        try {
          const response = await api.get(`/api/properties/${id}`);
          const property = response.data.data;

          setFormData({
            title: property.title || '',
            description: property.description || '',
            address: property.address || '',
            city: property.city || '',
            type: property.type || 'apartment',
            bedrooms: property.bedrooms?.toString() || '1',
            bathrooms: property.bathrooms?.toString() || '1',
            size: property.size?.toString() || '0',
            rent_amount: property.rent_amount?.toString() || '0',
            is_available: property.is_available !== undefined ? property.is_available : true,
          });
          setLoading(false);
        } catch (err: any) {
          setError('Failed to load property data');
          setLoading(false);
          console.error('Error fetching property:', err);
        }
      }
    };

    fetchProperty();
  }, [id, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const propertyData = {
        ...formData,
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        size: parseFloat(formData.size),
        rent_amount: parseFloat(formData.rent_amount),
      };

      if (isEditMode) {
        await api.put(`/api/properties/${id}`, propertyData);
      } else {
        await api.post('/api/properties', propertyData);
      }

      navigate('/properties');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save property');
      setSubmitting(false);
      console.error('Error saving property:', err);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading property data...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h1>{isEditMode ? 'Edit Property' : 'Add New Property'}</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Property Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Property Type</Form.Label>
              <Form.Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="condo">Condo</option>
                <option value="townhouse">Townhouse</option>
                <option value="commercial">Commercial</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        
        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
          />
        </Form.Group>
        
        <Row>
          <Col md={8}>
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>City</Form.Label>
              <Form.Control
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>
        
        <Row>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Bedrooms</Form.Label>
              <Form.Control
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                min="0"
                required
              />
            </Form.Group>
          </Col>
          
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Bathrooms</Form.Label>
              <Form.Control
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                min="0"
                step="0.5"
                required
              />
            </Form.Group>
          </Col>
          
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Size (sq ft)</Form.Label>
              <Form.Control
                type="number"
                name="size"
                value={formData.size}
                onChange={handleChange}
                min="0"
                required
              />
            </Form.Group>
          </Col>
          
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Monthly Rent ($)</Form.Label>
              <Form.Control
                type="number"
                name="rent_amount"
                value={formData.rent_amount}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </Form.Group>
          </Col>
        </Row>
        
        <Form.Group className="mb-4">
          <Form.Check
            type="checkbox"
            name="is_available"
            checked={formData.is_available}
            onChange={handleChange}
            label="Property is available for rent"
          />
        </Form.Group>
        
        <div className="d-flex gap-2">
          <Button 
            variant="primary" 
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save Property'}
          </Button>
          <Button 
            variant="outline-secondary" 
            onClick={() => navigate('/properties')}
          >
            Cancel
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default PropertyForm; 