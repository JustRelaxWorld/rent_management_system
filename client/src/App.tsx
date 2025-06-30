import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import './App.css';

// Providers
import { ThemeProvider } from './contexts/ThemeContext';

// Layout Components
import AuthLayout from './components/layout/AuthLayout';
import MainLayout from './components/layout/MainLayout';
import ModernSidebar from './components/layout/ModernSidebar';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import PublicHome from './components/layout/PublicHome';
import NotFound from './components/layout/NotFound';
import PageTransition from './components/layout/PageTransition';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import EditProfile from './components/auth/EditProfile';
import Profile from './components/auth/Profile';

// Dashboard Components
import AdminDashboard from './components/dashboard/AdminDashboard';
import LandlordDashboard from './components/dashboard/LandlordDashboard';
import TenantDashboard from './components/dashboard/TenantDashboard';

// Property Components
import PropertyList from './components/properties/PropertyList';
import PropertyForm from './components/properties/PropertyForm';
import AddProperty from './components/properties/AddProperty';
import EditProperty from './components/properties/EditProperty';
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
import TestMpesaStatus from './components/payments/TestMpesaStatus';

// Routing Component
import PrivateRoute from './components/routing/PrivateRoute';

function App() {
  const location = useLocation();

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-accent-50 dark:bg-neutral-900 transition-colors duration-200 app-content">
        <PageTransition type="fade" duration={0.4}>
          <Routes location={location}>
            {/* Public Home Route */}
            <Route path="/" element={
              <>
                <Header />
                <main className="flex-grow">
                  <PublicHome />
                </main>
                <Footer />
              </>
            } />

            {/* Auth Routes - Direct components (no AuthLayout wrapper) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Dashboard Routes with MainLayout */}
            <Route path="/profile/edit" element={
              <MainLayout sidebar={<ModernSidebar />}>
                <PrivateRoute>
                  <EditProfile />
                </PrivateRoute>
              </MainLayout>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <MainLayout sidebar={<ModernSidebar />}>
                <PrivateRoute role="admin">
                  <AdminDashboard />
                </PrivateRoute>
              </MainLayout>
            } />
            
            <Route path="/dashboard" element={
              <MainLayout sidebar={<ModernSidebar />}>
                <PrivateRoute role="admin">
                  <AdminDashboard />
                </PrivateRoute>
              </MainLayout>
            } />
            
            {/* Landlord Routes */}
            <Route path="/landlord" element={
              <MainLayout sidebar={<ModernSidebar />}>
                <PrivateRoute role="landlord">
                  <LandlordDashboard />
                </PrivateRoute>
              </MainLayout>
            } />
            
            <Route path="/landlord-dashboard" element={
              <MainLayout sidebar={<ModernSidebar />}>
                <PrivateRoute role="landlord">
                  <LandlordDashboard />
                </PrivateRoute>
              </MainLayout>
            } />
            
            <Route path="/landlord/dashboard" element={
              <MainLayout sidebar={<ModernSidebar />}>
                <PrivateRoute role="landlord">
                  <LandlordDashboard />
                </PrivateRoute>
              </MainLayout>
            } />
            
            <Route path="/landlord/properties" element={
              <MainLayout sidebar={<ModernSidebar />}>
                <PrivateRoute role="landlord">
                  <PropertyList />
                </PrivateRoute>
              </MainLayout>
            } />
            
            <Route path="/landlord/properties/add" element={
              <MainLayout sidebar={<ModernSidebar />}>
                <PrivateRoute role="landlord">
                  <AddProperty />
                </PrivateRoute>
              </MainLayout>
            } />
            
            <Route path="/landlord/properties/:id" element={
              <MainLayout sidebar={<ModernSidebar />}>
                <PrivateRoute role="landlord">
                  <PropertyView />
                </PrivateRoute>
              </MainLayout>
            } />
            
            <Route path="/landlord/properties/:id/edit" element={
              <MainLayout sidebar={<ModernSidebar />}>
                <PrivateRoute role="landlord">
                  <EditProperty />
                </PrivateRoute>
              </MainLayout>
            } />
            
            <Route path="/landlord/applications" element={
              <MainLayout sidebar={<ModernSidebar />}>
                <PrivateRoute role="landlord">
                  <LandlordApplicationList />
                </PrivateRoute>
              </MainLayout>
            } />
            
            <Route path="/landlord/applications/:id" element={
              <MainLayout sidebar={<ModernSidebar />}>
                <PrivateRoute role="landlord">
                  <ApplicationDetails />
                </PrivateRoute>
              </MainLayout>
            } />
            
            <Route path="/landlord/maintenance" element={
              <MainLayout sidebar={<ModernSidebar />}>
                <PrivateRoute role="landlord">
                  <MaintenanceManagement />
                </PrivateRoute>
              </MainLayout>
            } />
            
            <Route path="/landlord/maintenance/:id" element={
              <MainLayout sidebar={<ModernSidebar />}>
                <PrivateRoute role="landlord">
                  <PropertyView />
                </PrivateRoute>
              </MainLayout>
            } />
            
            {/* Tenant Routes */}
            <Route path="/tenant" element={
              <MainLayout sidebar={<ModernSidebar />}>
                <PrivateRoute role="tenant">
                  <TenantDashboard />
                </PrivateRoute>
              </MainLayout>
            } />
            
            <Route path="/tenant-dashboard" element={
              <MainLayout sidebar={<ModernSidebar />}>
                <PrivateRoute role="tenant">
                  <TenantDashboard />
                </PrivateRoute>
              </MainLayout>
            } />
            
            <Route path="/tenant/dashboard" element={
              <MainLayout sidebar={<ModernSidebar />}>
                <PrivateRoute role="tenant">
                  <TenantDashboard />
                </PrivateRoute>
              </MainLayout>
            } />
            
            <Route path="/tenant/properties" element={
              <MainLayout sidebar={<ModernSidebar />}>
                <PrivateRoute role="tenant">
                  <TenantPropertyList />
                </PrivateRoute>
              </MainLayout>
            } />
            
            <Route path="/tenant/properties/:id" element={
              <MainLayout sidebar={<ModernSidebar />}>
                <PrivateRoute role="tenant">
                  <PropertyView />
                </PrivateRoute>
              </MainLayout>
            } />
            
            <Route path="/tenant/properties/:propertyId/apply" element={
              <MainLayout sidebar={<ModernSidebar />}>
                <PrivateRoute role="tenant">
                  <RentalApplicationForm />
                </PrivateRoute>
              </MainLayout>
            } />
            
            <Route path="/tenant/applications" element={
              <MainLayout sidebar={<ModernSidebar />}>
                <PrivateRoute role="tenant">
                  <TenantApplicationList />
                </PrivateRoute>
              </MainLayout>
            } />
            
            <Route path="/tenant/applications/:id" element={
              <MainLayout sidebar={<ModernSidebar />}>
                <PrivateRoute role="tenant">
                  <ApplicationDetails />
                </PrivateRoute>
              </MainLayout>
            } />
            
            <Route path="/tenant/maintenance" element={
              <MainLayout sidebar={<ModernSidebar />}>
                <PrivateRoute role="tenant">
                  <MaintenanceRequestList />
                </PrivateRoute>
              </MainLayout>
            } />
            
            <Route path="/tenant/maintenance/new" element={
              <MainLayout sidebar={<ModernSidebar />}>
                <PrivateRoute role="tenant">
                  <MaintenanceRequestForm />
                </PrivateRoute>
              </MainLayout>
            } />
            
            <Route path="/tenant/maintenance/:id" element={
              <MainLayout sidebar={<ModernSidebar />}>
                <PrivateRoute role="tenant">
                  <MaintenanceRequestForm />
                </PrivateRoute>
              </MainLayout>
            } />
            
            {/* Payment Routes */}
            <Route path="/tenant/payments" element={
              <MainLayout sidebar={<ModernSidebar />}>
                <PrivateRoute role="tenant">
                  <PaymentsPage />
                </PrivateRoute>
              </MainLayout>
            } />
            
            <Route path="/tenant/payments/:invoiceId" element={
              <MainLayout sidebar={<ModernSidebar />}>
                <PrivateRoute role="tenant">
                  <PaymentsPage />
                </PrivateRoute>
              </MainLayout>
            } />

            {/* General payment route (can be used by any role) */}
            <Route path="/payments/:invoiceId" element={
              <MainLayout sidebar={<ModernSidebar />}>
                <PrivateRoute>
                  <PaymentsPage />
                </PrivateRoute>
              </MainLayout>
            } />

            {/* Test M-Pesa Status page */}
            <Route path="/test-mpesa" element={
              <MainLayout sidebar={<ModernSidebar />}>
                <TestMpesaStatus />
              </MainLayout>
            } />

            <Route path="/profile" element={
              <MainLayout sidebar={<ModernSidebar />}>
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              </MainLayout>
            } />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PageTransition>
      </div>
    </ThemeProvider>
  );
}

export default App;
