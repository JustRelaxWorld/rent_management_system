import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge } from 'react-bootstrap';
import api from '../../utils/api';

const LandlordDashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
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

        // Get properties owned by landlord - using try/catch for each API call
        try {
          const propertiesResponse = await api.get(`/api/properties/landlord/${userResponse.data.data.id}`);
          setProperties(propertiesResponse.data.data || []);
        } catch (err) {
          console.error('Failed to load properties:', err);
          // Continue with other requests even if this one fails
        }

        // Get all invoices for properties
        try {
          const invoicesResponse = await api.get('/api/invoices');
          setInvoices(invoicesResponse.data.data || []);
        } catch (err) {
          console.error('Failed to load invoices:', err);
          // Continue with other requests even if this one fails
        }

        // Get maintenance requests
        try {
          const maintenanceResponse = await api.get('/api/maintenance');
          setMaintenanceRequests(maintenanceResponse.data.data || []);
        } catch (err) {
          console.error('Failed to load maintenance requests:', err);
          // Continue with other requests even if this one fails
        }

        // Get tenants
        try {
          const tenantsResponse = await api.get('/api/users?role=tenant');
          setTenants(tenantsResponse.data.data || []);
        } catch (err) {
          console.error('Failed to load tenants:', err);
          // Continue with other requests even if this one fails
        }

        setLoading(false);
      } catch (err: any) {
        setError('Failed to load user data');
        setLoading(false);
        console.error('Dashboard error:', err);
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

  // Calculate statistics
  const totalProperties = properties.length;
  const occupiedProperties = properties.filter(property => !property.is_available).length;
  const vacantProperties = totalProperties - occupiedProperties;
  const totalRent = properties.reduce((sum, property) => sum + parseFloat(property.rent_amount || 0), 0);
  const pendingPayments = invoices.filter(invoice => invoice.status === 'pending').length;
  const pendingMaintenanceRequests = maintenanceRequests.filter(req => req.status !== 'completed').length;

  return (
    <Container className="py-5">
      <h1 className="mb-4">Landlord Dashboard</h1>
      <p className="lead">Welcome back, {user?.name}!</p>

      <Row className="mb-5">
        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>My Profile</Card.Title>
              <hr />
              <p><strong>Name:</strong> {user?.name}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Phone:</strong> {user?.phone || 'Not provided'}</p>
              <Button variant="outline-primary" size="sm">Edit Profile</Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>Properties Summary</Card.Title>
              <hr />
              <div className="d-flex justify-content-between mb-3">
                <span>Total Properties:</span>
                <span className="fw-bold">{totalProperties}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span>Occupied:</span>
                <span className="fw-bold text-success">{occupiedProperties}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span>Vacant:</span>
                <span className="fw-bold text-warning">{vacantProperties}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span>Total Monthly Rent:</span>
                <span className="fw-bold">${totalRent.toFixed(2)}</span>
              </div>
              <Button variant="primary" size="sm">Manage Properties</Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>Action Items</Card.Title>
              <hr />
              <div className="d-flex justify-content-between mb-3">
                <span>Pending Payments:</span>
                <span className="fw-bold text-danger">{pendingPayments}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span>Maintenance Requests:</span>
                <span className="fw-bold text-warning">{pendingMaintenanceRequests}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span>Vacant Properties:</span>
                <span className="fw-bold">{vacantProperties}</span>
              </div>
              <Button variant="primary" size="sm">View All Invoices</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6} className="mb-4">
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">My Properties</h5>
            </Card.Header>
            <Card.Body>
              {properties.length > 0 ? (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Address</th>
                      <th>Rent</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.slice(0, 5).map(property => (
                      <tr key={property.id}>
                        <td>{property.title}</td>
                        <td>{property.address}</td>
                        <td>${parseFloat(property.rent_amount).toFixed(2)}</td>
                        <td>
                          <Badge bg={property.is_available ? 'warning' : 'success'}>
                            {property.is_available ? 'Vacant' : 'Occupied'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted">No properties found.</p>
              )}
              {properties.length > 5 && (
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
                      <th>Property</th>
                      <th>Issue</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenanceRequests.slice(0, 5).map(request => (
                      <tr key={request.id}>
                        <td>{properties.find(p => p.id === request.property_id)?.title || 'Unknown'}</td>
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

export default LandlordDashboard; 