import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';

// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// Import Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './components/layout/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import NotFound from './components/layout/NotFound';

// Import Dashboard Components
import TenantDashboard from './components/dashboard/TenantDashboard';
import LandlordDashboard from './components/dashboard/LandlordDashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';

// Import Private Route Component
import PrivateRoute from './components/routing/PrivateRoute';

const App: React.FC = () => {
  return (
    <>
      <Header />
      <main className="py-3">
        <Container>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Private Routes */}
            <Route path="/tenant/dashboard" element={
              <PrivateRoute roles={['tenant']}>
                <TenantDashboard />
              </PrivateRoute>
            } />
            
            <Route path="/landlord/dashboard" element={
              <PrivateRoute roles={['landlord']}>
                <LandlordDashboard />
              </PrivateRoute>
            } />
            
            <Route path="/admin/dashboard" element={
              <PrivateRoute roles={['admin']}>
                <AdminDashboard />
              </PrivateRoute>
            } />
            
            {/* Catch all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Container>
      </main>
      <Footer />
    </>
  );
};

export default App;
