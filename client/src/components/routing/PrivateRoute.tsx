import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../utils/auth-context';
import AuthLoader from '../ui/AuthLoader';

// Debug flag - turn to false in production
const DEBUG_ROUTE = true;

// Debug logger function
const logDebug = (message: string, data?: any) => {
  if (DEBUG_ROUTE) {
    const timestamp = new Date().toISOString().substring(11, 23); // HH:MM:SS.sss
    if (data) {
      console.log(`[PrivateRoute Debug ${timestamp}] ${message}`, data);
    } else {
      console.log(`[PrivateRoute Debug ${timestamp}] ${message}`);
    }
  }
};

interface PrivateRouteProps {
  children: React.ReactNode;
  role?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, role }) => {
  const { isAuthenticated, isLoading, authChecked, user, checkAuth } = useAuth();
  const location = useLocation();

  // Force a recheck of authentication if not authenticated yet or checking isn't complete
  useEffect(() => {
    const verifyAuth = async () => {
      // Only try to recheck if we're not already loading and either authChecked is false or user isn't authenticated
      if (!isLoading && (!authChecked || !isAuthenticated)) {
        logDebug('Authentication state uncertain, rechecking...');
        await checkAuth();
      }
    };

    verifyAuth();
  }, [checkAuth, isAuthenticated, isLoading, authChecked]);

  // Show loading spinner while checking authentication
  if (isLoading || !authChecked) {
    logDebug('Authentication check in progress, showing loader');
    return <AuthLoader message="Verifying your access..." />;
  }

  // If not authenticated, redirect to login and save the current location
  if (!isAuthenticated || !user) {
    logDebug('User not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is required but user doesn't have that role
  if (role && user.role !== role) {
    logDebug(`User role "${user.role}" doesn't match required role "${role}", redirecting`);
    
    // Redirect to appropriate dashboard based on user role
    if (user.role === 'tenant') {
      return <Navigate to="/tenant/dashboard" replace />;
    } else if (user.role === 'landlord') {
      return <Navigate to="/landlord/dashboard" replace />;
    } else if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      // Fallback if role is unknown
      return <Navigate to="/" replace />;
    }
  }

  // User is authenticated and has required role, render children
  logDebug('Authentication successful, rendering protected route');
  return <>{children}</>;
};

export default PrivateRoute; 