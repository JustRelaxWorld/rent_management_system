import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, Badge, Button, Alert, Spinner, Modal, Form } from 'react-bootstrap';
import api from '../../utils/api';
import { useAuth } from '../../utils/auth-context';

interface ApplicationData {
  id: number;
  property_id: number;
  tenant_id: number;
  landlord_id: number;
  status: string;
  move_in_date: string;
  monthly_income: number;
  employment_status: string;
  employer: string;
  additional_notes: string;
  created_at: string;
  property_title: string;
  property_address: string;
  property_city: string;
  property_rent: number;
  tenant_name: string;
  tenant_email: string;
  tenant_phone: string;
}

const ApplicationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [leaseStartDate, setLeaseStartDate] = useState('');
  const [leaseEndDate, setLeaseEndDate] = useState('');

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      try {
        const response = await api.get(`/api/applications/${id}`);
        setApplication(response.data.data);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching application details:', err);
        setError('Failed to load application details. Please try again later.');
        setLoading(false);
      }
    };

    fetchApplicationDetails();
  }, [id]);

  const handleOpenModal = (type: 'approve' | 'reject') => {
    setActionType(type);
    setShowModal(true);
    
    // Set default lease dates for approval
    if (type === 'approve' && application) {
      const moveInDate = new Date(application.move_in_date);
      setLeaseStartDate(application.move_in_date);
      
      // Set default lease end date to 12 months after move-in
      const endDate = new Date(moveInDate);
      endDate.setFullYear(endDate.getFullYear() + 1);
      setLeaseEndDate(endDate.toISOString().split('T')[0]);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setActionType(null);
  };

  const handleSubmitAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!application || !actionType) return;
    
    setActionLoading(true);
    
    try {
      const payload = {
        status: actionType === 'approve' ? 'approved' : 'rejected',
        leaseStartDate: actionType === 'approve' ? leaseStartDate : undefined,
        leaseEndDate: actionType === 'approve' ? leaseEndDate : undefined
      };
      
      await api.put(`/api/applications/${id}/status`, payload);
      
      // Update local state
      setApplication(prev => prev ? { ...prev, status: payload.status } : null);
      setShowModal(false);
      setActionLoading(false);
      
    } catch (err: any) {
      console.error(`Error ${actionType}ing application:`, err);
      setError(`Failed to ${actionType} application. Please try again later.`);
      setActionLoading(false);
    }
  };

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

  if (!application) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">Application not found</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Application Details</h2>
        <div>
          <Button variant="secondary" onClick={() => navigate(-1)} className="me-2">
            Back
          </Button>
          {user?.role === 'landlord' && application.status === 'pending' && (
            <>
              <Button 
                variant="success" 
                onClick={() => handleOpenModal('approve')}
                className="me-2"
              >
                Approve
              </Button>
              <Button 
                variant="danger" 
                onClick={() => handleOpenModal('reject')}
              >
                Reject
              </Button>
            </>
          )}
        </div>
      </div>

      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Application Status</h5>
          {getStatusBadge(application.status)}
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <p><strong>Application ID:</strong> #{application.id}</p>
              <p><strong>Submitted On:</strong> {new Date(application.created_at).toLocaleDateString()}</p>
              <p><strong>Desired Move-in Date:</strong> {new Date(application.move_in_date).toLocaleDateString()}</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Property Details</h5>
            </Card.Header>
            <Card.Body>
              <p><strong>Property:</strong> {application.property_title}</p>
              <p><strong>Address:</strong> {application.property_address}, {application.property_city}</p>
              <p><strong>Monthly Rent:</strong> ${application.property_rent}</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Tenant Information</h5>
            </Card.Header>
            <Card.Body>
              <p><strong>Name:</strong> {application.tenant_name}</p>
              <p><strong>Email:</strong> {application.tenant_email}</p>
              <p><strong>Phone:</strong> {application.tenant_phone || 'Not provided'}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Financial & Employment Information</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <p><strong>Monthly Income:</strong> ${application.monthly_income}</p>
              <p><strong>Employment Status:</strong> {application.employment_status}</p>
              <p><strong>Employer:</strong> {application.employer || 'Not provided'}</p>
            </Col>
            <Col md={6}>
              <p><strong>Income to Rent Ratio:</strong> {(application.monthly_income / application.property_rent).toFixed(1)}x</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {application.additional_notes && (
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">Additional Notes</h5>
          </Card.Header>
          <Card.Body>
            <p>{application.additional_notes}</p>
          </Card.Body>
        </Card>
      )}

      {/* Action Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {actionType === 'approve' ? 'Approve Application' : 'Reject Application'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitAction}>
          <Modal.Body>
            {actionType === 'approve' ? (
              <>
                <p>Are you sure you want to approve this application?</p>
                <Form.Group className="mb-3">
                  <Form.Label>Lease Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={leaseStartDate}
                    onChange={(e) => setLeaseStartDate(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Lease End Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={leaseEndDate}
                    onChange={(e) => setLeaseEndDate(e.target.value)}
                    required
                  />
                </Form.Group>
              </>
            ) : (
              <p>Are you sure you want to reject this application?</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button 
              variant={actionType === 'approve' ? 'success' : 'danger'} 
              type="submit"
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                  Processing...
                </>
              ) : (
                actionType === 'approve' ? 'Approve' : 'Reject'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default ApplicationDetails; 