import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import PublicHome from './components/layout/PublicHome';
import NotFound from './components/layout/NotFound';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import EditProfile from './components/auth/EditProfile';

// Dashboard Components
import AdminDashboard from './components/dashboard/AdminDashboard';
import LandlordDashboard from './components/dashboard/LandlordDashboard';
import TenantDashboard from './components/dashboard/TenantDashboard';

// Property Components
import PropertyList from './components/properties/PropertyList';
import PropertyForm from './components/properties/PropertyForm';
import PropertyView from './components/properties/PropertyView';
import TenantPropertyList from './components/properties/TenantPropertyList';

// Application Components
import RentalApplicationForm from './components/properties/RentalApplicationForm';
import TenantApplicationList from './components/applications/TenantApplicationList';
import LandlordApplicationList from './components/applications/LandlordApplicationList';
import ApplicationDetails from './components/applications/ApplicationDetails';

// Maintenance Components
import MaintenanceRequestForm from './components/properties/MaintenanceRequestForm';
import MaintenanceRequestList from './components/properties/MaintenanceRequestList';
import MaintenanceManagement from './components/properties/MaintenanceManagement';

// Payment Components
import PaymentsPage from './components/payments/PaymentsPage.jsx';

// Routing Component
import PrivateRoute from './components/routing/PrivateRoute';

function App() {
  const navigate = useNavigate();

  // We're not clearing authentication on app load anymore
  // This allows users to stay logged in between sessions

  return (
    <div className="App d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicHome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Shared Routes */}
          <Route path="/profile/edit" element={
            <PrivateRoute>
              <EditProfile />
            </PrivateRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <PrivateRoute role="admin">
              <AdminDashboard />
            </PrivateRoute>
          } />
          <Route path="/dashboard" element={
            <PrivateRoute role="admin">
              <AdminDashboard />
            </PrivateRoute>
          } />
          
          {/* Landlord Routes */}
          <Route path="/landlord" element={
            <PrivateRoute role="landlord">
              <LandlordDashboard />
            </PrivateRoute>
          } />
          <Route path="/landlord-dashboard" element={
            <PrivateRoute role="landlord">
              <LandlordDashboard />
            </PrivateRoute>
          } />
          <Route path="/landlord/dashboard" element={
            <PrivateRoute role="landlord">
              <LandlordDashboard />
            </PrivateRoute>
          } />
          <Route path="/landlord/properties" element={
            <PrivateRoute role="landlord">
              <PropertyList />
            </PrivateRoute>
          } />
          <Route path="/landlord/properties/add" element={
            <PrivateRoute role="landlord">
              <PropertyForm />
            </PrivateRoute>
          } />
          <Route path="/landlord/properties/:id" element={
            <PrivateRoute role="landlord">
              <PropertyView />
            </PrivateRoute>
          } />
          <Route path="/landlord/properties/:id/edit" element={
            <PrivateRoute role="landlord">
              <PropertyForm />
            </PrivateRoute>
          } />
          <Route path="/landlord/applications" element={
            <PrivateRoute role="landlord">
              <LandlordApplicationList />
            </PrivateRoute>
          } />
          <Route path="/landlord/applications/:id" element={
            <PrivateRoute role="landlord">
              <ApplicationDetails />
            </PrivateRoute>
          } />
          <Route path="/landlord/maintenance" element={
            <PrivateRoute role="landlord">
              <MaintenanceManagement />
            </PrivateRoute>
          } />
          <Route path="/landlord/maintenance/:id" element={
            <PrivateRoute role="landlord">
              <PropertyView />
            </PrivateRoute>
          } />
          
          {/* Tenant Routes */}
          <Route path="/tenant" element={
            <PrivateRoute role="tenant">
              <TenantDashboard />
            </PrivateRoute>
          } />
          <Route path="/tenant-dashboard" element={
            <PrivateRoute role="tenant">
              <TenantDashboard />
            </PrivateRoute>
          } />
          <Route path="/tenant/dashboard" element={
            <PrivateRoute role="tenant">
              <TenantDashboard />
            </PrivateRoute>
          } />
          <Route path="/tenant/properties" element={
            <PrivateRoute role="tenant">
              <TenantPropertyList />
            </PrivateRoute>
          } />
          <Route path="/tenant/properties/:id" element={
            <PrivateRoute role="tenant">
              <PropertyView />
            </PrivateRoute>
          } />
          <Route path="/tenant/properties/:propertyId/apply" element={
            <PrivateRoute role="tenant">
              <RentalApplicationForm />
            </PrivateRoute>
          } />
          <Route path="/tenant/applications" element={
            <PrivateRoute role="tenant">
              <TenantApplicationList />
            </PrivateRoute>
          } />
          <Route path="/tenant/applications/:id" element={
            <PrivateRoute role="tenant">
              <ApplicationDetails />
            </PrivateRoute>
          } />
          <Route path="/tenant/maintenance" element={
            <PrivateRoute role="tenant">
              <MaintenanceRequestList />
            </PrivateRoute>
          } />
          <Route path="/tenant/maintenance/new" element={
            <PrivateRoute role="tenant">
              <MaintenanceRequestForm />
            </PrivateRoute>
          } />
          <Route path="/tenant/maintenance/:id" element={
            <PrivateRoute role="tenant">
              <PropertyView />
            </PrivateRoute>
          } />
          {/* Payment Routes */}
          <Route path="/tenant/payments" element={
            <PrivateRoute role="tenant">
              <PaymentsPage />
            </PrivateRoute>
          } />
          <Route path="/tenant/payments/:invoiceId" element={
            <PrivateRoute role="tenant">
              <PaymentsPage />
            </PrivateRoute>
          } />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
