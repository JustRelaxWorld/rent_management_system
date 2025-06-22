import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../utils/auth-context';

const MaintenanceRequestList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaintenanceRequests = async () => {
      try {
        const response = await api.get('/api/maintenance');
        setMaintenanceRequests(response.data.data || []);
      } catch (err) {
        console.error('Failed to fetch maintenance requests:', err);
        setError('Failed to load maintenance requests. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMaintenanceRequests();
    } else {
      setLoading(false);
    }
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge bg="warning">Pending</Badge>;
      case 'in_progress':
        return <Badge bg="info">In Progress</Badge>;
      case 'completed':
        return <Badge bg="success">Completed</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <Badge bg="success">Low</Badge>;
      case 'medium':
        return <Badge bg="warning">Medium</Badge>;
      case 'high':
        return <Badge bg="danger">High</Badge>;
      default:
        return <Badge bg="secondary">{priority}</Badge>;
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading maintenance requests...</p>
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

  if (!user) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Please log in to view maintenance requests.</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="mb-4 align-items-center">
        <Col>
          <h1>My Maintenance Requests</h1>
        </Col>
        <Col xs="auto">
          <Button 
            variant="primary"
            onClick={() => navigate('/tenant/maintenance/new')}
          >
            New Request
          </Button>
        </Col>
      </Row>

      {maintenanceRequests.length === 0 ? (
        <Card className="shadow-sm">
          <Card.Body className="text-center py-5">
            <p className="mb-4">You haven't submitted any maintenance requests yet.</p>
            <Button 
              variant="primary"
              onClick={() => navigate('/tenant/maintenance/new')}
            >
              Submit Your First Request
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Card className="shadow-sm">
          <Card.Body>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Property</th>
                  <th>Type</th>
                  <th>Priority</th>
                  <th>Date Submitted</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {maintenanceRequests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.title}</td>
                    <td>{request.property_name}</td>
                    <td>{request.type}</td>
                    <td>{getPriorityBadge(request.priority)}</td>
                    <td>{new Date(request.request_date).toLocaleDateString()}</td>
                    <td>{getStatusBadge(request.status)}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => navigate(`/tenant/maintenance/${request.id}`)}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default MaintenanceRequestList; 