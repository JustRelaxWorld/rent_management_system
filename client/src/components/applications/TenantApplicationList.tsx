import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Alert, Spinner } from 'react-bootstrap';
import api from '../../utils/api';
import { useAuth } from '../../utils/auth-context';

interface Application {
  id: number;
  property_id: number;
  status: string;
  move_in_date: string;
  created_at: string;
  property: {
    title: string;
    address: string;
    city: string;
    rent_amount: number;
  };
}

const TenantApplicationList: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        console.log('Fetching tenant applications...');
        const response = await api.get('/api/applications/tenant');
        console.log('Applications response:', response.data);
        
        if (response.data.data) {
          setApplications(response.data.data);
        } else {
          console.error('No data in response:', response.data);
          setApplications([]);
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching applications:', err);
        setError(`Failed to load your applications: ${err.response?.data?.message || err.message}`);
        setLoading(false);
      }
    };

    if (user && user.role === 'tenant') {
      fetchApplications();
    } else {
      setLoading(false);
      setError('You must be logged in as a tenant to view applications');
    }
  }, [user]);

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
      <h2 className="mb-4">My Rental Applications</h2>
      
      {applications.length === 0 ? (
        <Alert variant="info">
          You haven't submitted any rental applications yet. 
          <Link to="/tenant/properties" className="alert-link ms-2">
            Browse available properties
          </Link>
        </Alert>
      ) : (
        <Row>
          {applications.map((application) => (
            <Col md={6} lg={4} className="mb-4" key={application.id}>
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <div>Application #{application.id}</div>
                  {getStatusBadge(application.status)}
                </Card.Header>
                <Card.Body>
                  <Card.Title>{application.property.title}</Card.Title>
                  <Card.Text>
                    <strong>Address:</strong> {application.property.address}, {application.property.city}<br />
                    <strong>Rent:</strong> ${application.property.rent_amount}/month<br />
                    <strong>Desired Move-in:</strong> {new Date(application.move_in_date).toLocaleDateString()}<br />
                    <strong>Applied on:</strong> {new Date(application.created_at).toLocaleDateString()}
                  </Card.Text>
                  <Link 
                    to={`/tenant/applications/${application.id}`} 
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

export default TenantApplicationList; 