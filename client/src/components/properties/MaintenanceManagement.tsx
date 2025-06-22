import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Button, Card, Row, Col, Alert, Form, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../utils/auth-context';

const MaintenanceManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // For status update modal
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);

  // For filtering
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  useEffect(() => {
    const fetchMaintenanceRequests = async () => {
      try {
        // Build query params for filtering
        let queryParams = '';
        if (filterStatus !== 'all') {
          queryParams += `status=${filterStatus}`;
        }
        if (filterPriority !== 'all') {
          queryParams += queryParams ? `&priority=${filterPriority}` : `priority=${filterPriority}`;
        }
        
        const url = queryParams ? `/api/maintenance?${queryParams}` : '/api/maintenance';
        const response = await api.get(url);
        setMaintenanceRequests(response.data.data || []);
      } catch (err) {
        console.error('Failed to fetch maintenance requests:', err);
        setError('Failed to load maintenance requests. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'landlord') {
      fetchMaintenanceRequests();
    } else {
      setLoading(false);
    }
  }, [user, filterStatus, filterPriority]);

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

  const handleShowUpdateModal = (request: any) => {
    setSelectedRequest(request);
    setNewStatus(request.status);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
    setNewStatus('');
  };

  const handleUpdateStatus = async () => {
    if (!selectedRequest || !newStatus) return;
    
    setUpdateLoading(true);
    try {
      await api.put(`/api/maintenance/${selectedRequest.id}`, { status: newStatus });
      
      // Update the local state
      const updatedRequests = maintenanceRequests.map(req => 
        req.id === selectedRequest.id ? { ...req, status: newStatus } : req
      );
      
      setMaintenanceRequests(updatedRequests);
      setSuccess(`Maintenance request status updated to ${newStatus}`);
      
      // Close the modal
      handleCloseModal();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Failed to update maintenance request status:', err);
      setError('Failed to update status. Please try again.');
    } finally {
      setUpdateLoading(false);
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

  if (user.role !== 'landlord') {
    return (
      <Container className="py-5">
        <Alert variant="warning">Only landlords can access this page.</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="mb-4 align-items-center">
        <Col>
          <h1>Maintenance Requests Management</h1>
        </Col>
      </Row>

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row>
            <Col md={6} className="mb-3 mb-md-0">
              <Form.Group>
                <Form.Label>Filter by Status</Form.Label>
                <Form.Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Filter by Priority</Form.Label>
                <Form.Select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {maintenanceRequests.length === 0 ? (
        <Card className="shadow-sm">
          <Card.Body className="text-center py-5">
            <p className="mb-4">No maintenance requests found with the selected filters.</p>
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
                  <th>Tenant</th>
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
                    <td>{request.tenant_name}</td>
                    <td>{request.type}</td>
                    <td>{getPriorityBadge(request.priority)}</td>
                    <td>{new Date(request.request_date).toLocaleDateString()}</td>
                    <td>{getStatusBadge(request.status)}</td>
                    <td>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleShowUpdateModal(request)}
                        className="me-2"
                      >
                        Update Status
                      </Button>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => navigate(`/landlord/maintenance/${request.id}`)}
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

      {/* Status Update Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Update Maintenance Request Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <>
              <p><strong>Request:</strong> {selectedRequest.title}</p>
              <p><strong>Property:</strong> {selectedRequest.property_name}</p>
              <p><strong>Tenant:</strong> {selectedRequest.tenant_name}</p>
              <p><strong>Current Status:</strong> {getStatusBadge(selectedRequest.status)}</p>
              
              <Form.Group className="mt-3">
                <Form.Label>New Status</Form.Label>
                <Form.Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </Form.Select>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdateStatus}
            disabled={updateLoading}
          >
            {updateLoading ? 'Updating...' : 'Update Status'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MaintenanceManagement; 