import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge } from 'react-bootstrap';
import api from '../../utils/api';

const AdminDashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get current user
        const userResponse = await api.get('/api/auth/me');
        setUser(userResponse.data.data);

        // Get all users
        const usersResponse = await api.get('/api/users');
        setUsers(usersResponse.data.data || []);

        // Get all properties
        const propertiesResponse = await api.get('/api/properties');
        setProperties(propertiesResponse.data.data || []);

        // Get all invoices
        const invoicesResponse = await api.get('/api/invoices');
        setInvoices(invoicesResponse.data.data || []);

        // Get all payments
        const paymentsResponse = await api.get('/api/payments');
        setPayments(paymentsResponse.data.data || []);

        // Get all maintenance requests
        const maintenanceResponse = await api.get('/api/maintenance');
        setMaintenanceRequests(maintenanceResponse.data.data || []);

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

  // Calculate statistics
  const tenantCount = users.filter(user => user.role === 'tenant').length;
  const landlordCount = users.filter(user => user.role === 'landlord').length;
  const totalProperties = properties.length;
  const vacantProperties = properties.filter(property => property.is_available).length;
  const totalInvoices = invoices.length;
  const pendingInvoices = invoices.filter(invoice => invoice.status === 'pending').length;
  const overdueInvoices = invoices.filter(invoice => invoice.status === 'overdue').length;
  const totalPayments = payments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
  const pendingMaintenanceRequests = maintenanceRequests.filter(req => req.status !== 'completed').length;

  return (
    <Container className="py-5">
      <h1 className="mb-4">Admin Dashboard</h1>
      <p className="lead">Welcome back, {user?.name}!</p>

      <Row className="mb-5">
        <Col lg={3} md={6} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <h1 className="display-4 fw-bold text-primary">{users.length}</h1>
              <p className="text-muted">Total Users</p>
              <hr />
              <div className="d-flex justify-content-between">
                <span>Tenants: {tenantCount}</span>
                <span>Landlords: {landlordCount}</span>
              </div>
            </Card.Body>
            <Card.Footer className="bg-white border-0">
              <Button variant="outline-primary" size="sm" className="w-100">Manage Users</Button>
            </Card.Footer>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <h1 className="display-4 fw-bold text-success">{totalProperties}</h1>
              <p className="text-muted">Total Properties</p>
              <hr />
              <div className="d-flex justify-content-between">
                <span>Occupied: {totalProperties - vacantProperties}</span>
                <span>Vacant: {vacantProperties}</span>
              </div>
            </Card.Body>
            <Card.Footer className="bg-white border-0">
              <Button variant="outline-success" size="sm" className="w-100">Manage Properties</Button>
            </Card.Footer>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <h1 className="display-4 fw-bold text-warning">{totalInvoices}</h1>
              <p className="text-muted">Total Invoices</p>
              <hr />
              <div className="d-flex justify-content-between">
                <span>Pending: {pendingInvoices}</span>
                <span>Overdue: {overdueInvoices}</span>
              </div>
            </Card.Body>
            <Card.Footer className="bg-white border-0">
              <Button variant="outline-warning" size="sm" className="w-100">Manage Invoices</Button>
            </Card.Footer>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <h1 className="display-4 fw-bold text-info">${totalPayments.toFixed(2)}</h1>
              <p className="text-muted">Total Payments</p>
              <hr />
              <div className="d-flex justify-content-between">
                <span>Maintenance: {pendingMaintenanceRequests}</span>
                <span>Payments: {payments.length}</span>
              </div>
            </Card.Body>
            <Card.Footer className="bg-white border-0">
              <Button variant="outline-info" size="sm" className="w-100">Payment Reports</Button>
            </Card.Footer>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6} className="mb-4">
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Users</h5>
              <Button variant="light" size="sm">Add User</Button>
            </Card.Header>
            <Card.Body>
              {users.length > 0 ? (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.slice(0, 5).map(user => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <Badge bg={
                            user.role === 'admin' ? 'danger' :
                            user.role === 'landlord' ? 'success' : 'info'
                          }>
                            {user.role}
                          </Badge>
                        </td>
                        <td>
                          <Button variant="outline-primary" size="sm" className="me-2">Edit</Button>
                          <Button variant="outline-danger" size="sm">Delete</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted">No users found.</p>
              )}
              {users.length > 5 && (
                <div className="text-end">
                  <Button variant="link" size="sm">View All Users</Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="mb-4">
          <Card className="shadow-sm">
            <Card.Header className="bg-success text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Properties</h5>
              <Button variant="light" size="sm">Add Property</Button>
            </Card.Header>
            <Card.Body>
              {properties.length > 0 ? (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Title</th>
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
                  <Button variant="link" size="sm">View All Properties</Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6} className="mb-4">
          <Card className="shadow-sm">
            <Card.Header className="bg-warning text-white">
              <h5 className="mb-0">Recent Invoices</h5>
            </Card.Header>
            <Card.Body>
              {invoices.length > 0 ? (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>Tenant</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.slice(0, 5).map(invoice => (
                      <tr key={invoice.id}>
                        <td>{invoice.id}</td>
                        <td>{users.find(u => u.id === invoice.tenant_id)?.name || 'Unknown'}</td>
                        <td>${parseFloat(invoice.amount).toFixed(2)}</td>
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
                  <Button variant="link" size="sm">View All Invoices</Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="mb-4">
          <Card className="shadow-sm">
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">Recent Payments</h5>
            </Card.Header>
            <Card.Body>
              {payments.length > 0 ? (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Payment #</th>
                      <th>Tenant</th>
                      <th>Amount</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.slice(0, 5).map(payment => (
                      <tr key={payment.id}>
                        <td>{payment.id}</td>
                        <td>{users.find(u => u.id === payment.tenant_id)?.name || 'Unknown'}</td>
                        <td>${parseFloat(payment.amount).toFixed(2)}</td>
                        <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted">No payments found.</p>
              )}
              {payments.length > 5 && (
                <div className="text-end">
                  <Button variant="link" size="sm">View All Payments</Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard; 