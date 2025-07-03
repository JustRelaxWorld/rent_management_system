import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import './App.css';
import { useAuth } from './utils/auth-context';

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
import DashboardLayout from './components/layout/DashboardLayout';
import LoadingSpinner from './components/ui/LoadingSpinner';
import AuthLoader from './components/ui/AuthLoader';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import EditProfile from './components/auth/EditProfile';
import Profile from './components/auth/Profile';
import CompleteRegistration from './components/auth/CompleteRegistration';
import CompleteProfile from './components/auth/CompleteProfile';
import TestWorkOS from './components/auth/TestWorkOS';
import WorkOSProfileSetup from './components/auth/WorkOSProfileSetup';
import ForgotPassword from './components/auth/ForgotPassword';
import AuthCallback from './components/auth/AuthCallback';
import TenantProfileEdit from './components/auth/TenantProfileEdit';
import Settings from './components/auth/Settings';

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
import TenantPaymentsPage from './components/payments/TenantPaymentsPage';
import TenantInvoicesPage from './components/payments/TenantInvoicesPage';
import TestMpesaStatus from './components/payments/TestMpesaStatus';

// Routing Component
import PrivateRoute from './components/routing/PrivateRoute';

// Debug flag - turn to false in production
const DEBUG = true;

// Debug logger function
const logDebug = (message: string, data?: any) => {
  if (DEBUG) {
    const timestamp = new Date().toISOString().substring(11, 23); // HH:MM:SS.sss
    if (data) {
      console.log(`[App Debug ${timestamp}] ${message}`, data);
    } else {
      console.log(`[App Debug ${timestamp}] ${message}`);
    }
  }
};

// Page Loader Component
const PageLoader = () => (
  <div className="fixed inset-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm flex items-center justify-center z-50">
    <LoadingSpinner size="lg" color="primary" message="Loading page..." />
  </div>
);

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [processingToken, setProcessingToken] = useState(false);
  const { handleAuthCallback, setToken } = useAuth();
  
  // Check for token in URL globally
  useEffect(() => {
    const processTokenFromUrl = async () => {
      const queryParams = new URLSearchParams(location.search);
      const token = queryParams.get('token');
      
      if (token) {
        logDebug('Token detected in URL globally, processing...', { 
          pathName: location.pathname,
          tokenStart: token.substring(0, 10) + '...'
        });
        
        setProcessingToken(true);
        
        try {
          // Store the token first
          localStorage.setItem('token', token);
          setToken(token);
          
          // Process authentication
          const userData = await handleAuthCallback(token);
          
          if (userData) {
            logDebug('Successfully processed token from URL globally', { 
              role: userData.role,
              userId: userData.id
            });
            
            // Remove token from URL by replacing current entry with clean URL
            const cleanUrl = location.pathname; // Just keep the path without query params
            navigate(cleanUrl, { replace: true });
          } else {
            logDebug('Failed to process token from URL globally');
          }
        } catch (error) {
          logDebug('Error processing token from URL globally', error);
        } finally {
          setProcessingToken(false);
        }
      }
    };
    
    processTokenFromUrl();
  }, [location.search, handleAuthCallback, navigate, location.pathname, setToken]);
  
  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Show loading state during navigation
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500); // Short delay to prevent flashing on quick loads
    
    return () => clearTimeout(timer);
  }, [location.pathname]);
  
  // Show loading state while processing token
  if (processingToken) {
    return <AuthLoader message="Authenticating your session..." />;
  }
  
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-accent-50 dark:bg-neutral-900 transition-colors duration-200 app-content">
        {loading && <PageLoader />}
        <PageTransition type="fade" duration={0.4}>
          <Routes location={location}>
            {/* Public Home Route */}
            <Route index element={<PublicHome />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/complete-registration" element={<CompleteRegistration />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/test-workos" element={<TestWorkOS />} />
            
            {/* Dashboard Routes */}
            <Route path="/tenant/dashboard" element={
              <PrivateRoute role="tenant">
                <DashboardLayout>
                  <TenantDashboard />
                </DashboardLayout>
              </PrivateRoute>
            } />
            
            <Route path="/tenant-dashboard" element={
              <PrivateRoute role="tenant">
                <DashboardLayout>
                  <TenantDashboard />
                </DashboardLayout>
              </PrivateRoute>
            } />
            
            <Route path="/landlord/dashboard" element={
              <PrivateRoute role="landlord">
                <DashboardLayout>
                  <LandlordDashboard />
                </DashboardLayout>
              </PrivateRoute>
            } />
            
            <Route path="/landlord-dashboard" element={
              <PrivateRoute role="landlord">
                <DashboardLayout>
                  <LandlordDashboard />
                </DashboardLayout>
              </PrivateRoute>
            } />
            
            <Route path="/admin/dashboard" element={
              <PrivateRoute role="admin">
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </PrivateRoute>
            } />
            
            {/* User Profile Routes */}
            <Route path="/profile" element={
              <PrivateRoute>
                <DashboardLayout>
                  <Profile />
                </DashboardLayout>
              </PrivateRoute>
            } />
            
            <Route path="/edit-profile" element={
              <PrivateRoute>
                <DashboardLayout>
                  <EditProfile />
                </DashboardLayout>
              </PrivateRoute>
            } />
            
            <Route path="/tenant/profile/edit" element={
              <PrivateRoute role="tenant">
                <DashboardLayout>
                  <TenantProfileEdit />
                </DashboardLayout>
              </PrivateRoute>
            } />
            
            <Route path="/profile/edit" element={
              <PrivateRoute>
                <DashboardLayout>
                  <TenantProfileEdit />
                </DashboardLayout>
              </PrivateRoute>
            } />
            
            <Route path="/settings" element={
              <PrivateRoute>
                <DashboardLayout>
                  <Settings />
                </DashboardLayout>
              </PrivateRoute>
            } />
            
            {/* Property Routes */}
            <Route path="/properties" element={
              <PrivateRoute role="landlord">
                <DashboardLayout>
                  <PropertyList />
                </DashboardLayout>
              </PrivateRoute>
            } />
            
            <Route path="/landlord/properties" element={
              <PrivateRoute role="landlord">
                <DashboardLayout>
                  <PropertyList />
                </DashboardLayout>
              </PrivateRoute>
            } />
            
            <Route path="/properties/add" element={
              <PrivateRoute role="landlord">
                <DashboardLayout>
                  <AddProperty />
                </DashboardLayout>
              </PrivateRoute>
            } />
            
            <Route path="/landlord/properties/add" element={
              <PrivateRoute role="landlord">
                <DashboardLayout>
                  <AddProperty />
                </DashboardLayout>
              </PrivateRoute>
            } />
            
            <Route path="/properties/edit/:id" element={
              <PrivateRoute role="landlord">
                <DashboardLayout>
                  <EditProperty />
                </DashboardLayout>
              </PrivateRoute>
            } />
            
            <Route path="/landlord/properties/edit/:id" element={
              <PrivateRoute role="landlord">
                <DashboardLayout>
                  <EditProperty />
                </DashboardLayout>
              </PrivateRoute>
            } />
            
            <Route path="/properties/:id" element={
              <PrivateRoute>
                <DashboardLayout>
                  <PropertyView />
                </DashboardLayout>
              </PrivateRoute>
            } />
            
            <Route path="/landlord/properties/:id" element={
              <PrivateRoute role="landlord">
                <DashboardLayout>
                  <PropertyView />
                </DashboardLayout>
              </PrivateRoute>
            } />
            
            <Route path="/tenant/properties" element={
              <PrivateRoute role="tenant">
                <DashboardLayout>
                  <TenantPropertyList />
                </DashboardLayout>
              </PrivateRoute>
            } />
            
            {/* Application Routes */}
            <Route path="/properties/:id/apply" element={
              <PrivateRoute role="tenant">
                <DashboardLayout>
                  <RentalApplicationForm />
                </DashboardLayout>
              </PrivateRoute>
            } />
            
            <Route path="/tenant/applications" element={
              <PrivateRoute role="tenant">
                <DashboardLayout>
                  <TenantApplicationList />
                </DashboardLayout>
              </PrivateRoute>
            } />
            
            <Route path="/landlord/applications" element={
              <PrivateRoute role="landlord">
                <DashboardLayout>
                  <LandlordApplicationList />
                </DashboardLayout>
              </PrivateRoute>
            } />
            
            <Route path="/applications/:id" element={
              <PrivateRoute>
                <DashboardLayout>
                  <ApplicationDetails />
                </DashboardLayout>
              </PrivateRoute>
            } />
            
            {/* Maintenance Routes */}
            <Route path="/properties/:id/maintenance" element={
              <PrivateRoute role="tenant">
                <DashboardLayout>
                  <MaintenanceRequestForm />
                </DashboardLayout>
              </PrivateRoute>
            } />
            
            <Route path="/tenant/maintenance" element={
              <PrivateRoute role="tenant">
                <DashboardLayout>
                  <MaintenanceRequestList />
                </DashboardLayout>
              </PrivateRoute>
            } />
            
            <Route path="/landlord/maintenance" element={
              <PrivateRoute role="landlord">
                <DashboardLayout>
                  <MaintenanceManagement />
                </DashboardLayout>
              </PrivateRoute>
            } />
            
            {/* Payment Routes */}
            <Route path="/payments" element={
              <PrivateRoute>
                <DashboardLayout>
                  <PaymentsPage />
                </DashboardLayout>
              </PrivateRoute>
            } />
            
            <Route path="/tenant/payments" element={
              <PrivateRoute role="tenant">
                <DashboardLayout>
                  <TenantPaymentsPage />
                </DashboardLayout>
              </PrivateRoute>
            } />
            
            <Route path="/tenant/invoices" element={
              <PrivateRoute role="tenant">
                <DashboardLayout>
                  <TenantInvoicesPage />
                </DashboardLayout>
              </PrivateRoute>
            } />
            
            <Route path="/tenant/maintenance/new" element={
              <PrivateRoute role="tenant">
                <DashboardLayout>
                  <MaintenanceRequestForm />
                </DashboardLayout>
              </PrivateRoute>
            } />
            
            <Route path="/test-mpesa" element={
              <PrivateRoute>
                <DashboardLayout>
                  <TestMpesaStatus />
                </DashboardLayout>
              </PrivateRoute>
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
