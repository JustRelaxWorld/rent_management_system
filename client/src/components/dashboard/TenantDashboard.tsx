import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge } from 'react-bootstrap';
import api from '../../utils/api';

const TenantDashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get current user
        const userResponse = await api.get('/api/auth/me');
        setUser(userResponse.data.data);

        // Get invoices
        const invoicesResponse = await api.get('/api/invoices');
        setInvoices(invoicesResponse.data.data);

        // Get maintenance requests
        const maintenanceResponse = await api.get('/api/maintenance');
        setMaintenanceRequests(maintenanceResponse.data.data);

        setLoading(false);
      } catch (err: any) {
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading dashboard...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h1 className="mb-4">Tenant Dashboard</h1>
      <p className="lead">Welcome back, {user?.name}!</p>

      <Row className="mb-5">
        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>My Profile</Card.Title>
              <hr />
              <p><strong>Name:</strong> {user?.name}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Phone:</strong> {user?.phone}</p>
              <Button variant="outline-primary" size="sm">Edit Profile</Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>Payment Summary</Card.Title>
              <hr />
              <div className="d-flex justify-content-between mb-3">
                <span>Pending Payments:</span>
                <span className="fw-bold text-danger">
                  {invoices.filter(invoice => invoice.status === 'pending').length}
                </span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span>Total Due:</span>
                <span className="fw-bold">
                  ${invoices
                    .filter(invoice => invoice.status === 'pending')
                    .reduce((total, invoice) => total + parseFloat(invoice.amount), 0)
                    .toFixed(2)}
                </span>
              </div>
              <Button variant="primary" size="sm">View All Invoices</Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>Maintenance Requests</Card.Title>
              <hr />
              <div className="d-flex justify-content-between mb-3">
                <span>Open Requests:</span>
                <span className="fw-bold">
                  {maintenanceRequests.filter(req => req.status !== 'completed').length}
                </span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span>Completed:</span>
                <span className="fw-bold text-success">
                  {maintenanceRequests.filter(req => req.status === 'completed').length}
                </span>
              </div>
              <Button variant="primary" size="sm">New Request</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6} className="mb-4">
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Recent Invoices</h5>
            </Card.Header>
            <Card.Body>
              {invoices.length > 0 ? (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>Amount</th>
                      <th>Due Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.slice(0, 5).map(invoice => (
                      <tr key={invoice.id}>
                        <td>{invoice.id}</td>
                        <td>${parseFloat(invoice.amount).toFixed(2)}</td>
                        <td>{new Date(invoice.due_date).toLocaleDateString()}</td>
                        <td>
                          <Badge bg={
                            invoice.status === 'paid' ? 'success' :
                            invoice.status === 'overdue' ? 'danger' : 'warning'
                          }>
                            {invoice.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted">No invoices found.</p>
              )}
              {invoices.length > 5 && (
                <div className="text-end">
                  <Button variant="link" size="sm">View All</Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="mb-4">
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Maintenance Requests</h5>
            </Card.Header>
            <Card.Body>
              {maintenanceRequests.length > 0 ? (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenanceRequests.slice(0, 5).map(request => (
                      <tr key={request.id}>
                        <td>{request.title}</td>
                        <td>{new Date(request.request_date).toLocaleDateString()}</td>
                        <td>
                          <Badge bg={
                            request.status === 'completed' ? 'success' :
                            request.status === 'in_progress' ? 'info' : 'warning'
                          }>
                            {request.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted">No maintenance requests found.</p>
              )}
              {maintenanceRequests.length > 5 && (
                <div className="text-end">
                  <Button variant="link" size="sm">View All</Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TenantDashboard; 