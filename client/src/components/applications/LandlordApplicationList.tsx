import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Alert, Spinner, Form } from 'react-bootstrap';
import api from '../../utils/api';
import { useAuth } from '../../utils/auth-context';

interface Application {
  id: number;
  property_id: number;
  tenant_id: number;
  status: string;
  move_in_date: string;
  created_at: string;
  property_title: string;
  property_address: string;
  property_city: string;
  property_rent: number;
  tenant_name: string;
  tenant_email: string;
  tenant_phone: string;
}

const LandlordApplicationList: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        console.log('Fetching landlord applications...');
        const response = await api.get('/api/applications/landlord');
        console.log('Applications response:', response.data);
        
        if (response.data.data) {
          setApplications(response.data.data);
          setFilteredApplications(response.data.data);
        } else {
          console.error('No data in response:', response.data);
          setApplications([]);
          setFilteredApplications([]);
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching applications:', err);
        setError(`Failed to load applications: ${err.response?.data?.message || err.message}`);
        setLoading(false);
      }
    };

    if (user && user.role === 'landlord') {
      fetchApplications();
    } else {
      setLoading(false);
      setError('You must be logged in as a landlord to view applications');
    }
  }, [user]);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(applications.filter(app => app.status === filter));
    }
  }, [filter, applications]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge bg="warning">Pending</Badge>;
      case 'approved':
        return <Badge bg="success">Approved</Badge>;
      case 'rejected':
        return <Badge bg="danger">Rejected</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value);
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Rental Applications</h2>
        <Form.Group style={{ width: '200px' }}>
          <Form.Select value={filter} onChange={handleFilterChange}>
            <option value="all">All Applications</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </Form.Select>
        </Form.Group>
      </div>
      
      {applications.length === 0 ? (
        <Alert variant="info">
          You don't have any rental applications yet.
        </Alert>
      ) : filteredApplications.length === 0 ? (
        <Alert variant="info">
          No applications match the selected filter.
        </Alert>
      ) : (
        <Row>
          {filteredApplications.map((application) => (
            <Col md={6} lg={4} className="mb-4" key={application.id}>
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <div>Application #{application.id}</div>
                  {getStatusBadge(application.status)}
                </Card.Header>
                <Card.Body>
                  <Card.Title>{application.property_title}</Card.Title>
                  <Card.Text>
                    <strong>Tenant:</strong> {application.tenant_name}<br />
                    <strong>Email:</strong> {application.tenant_email}<br />
                    <strong>Phone:</strong> {application.tenant_phone || 'Not provided'}<br />
                    <strong>Desired Move-in:</strong> {new Date(application.move_in_date).toLocaleDateString()}<br />
                    <strong>Applied on:</strong> {new Date(application.created_at).toLocaleDateString()}
                  </Card.Text>
                  <Link 
                    to={`/landlord/applications/${application.id}`} 
                    className="btn btn-primary btn-sm"
                  >
                    View Details
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default LandlordApplicationList; 