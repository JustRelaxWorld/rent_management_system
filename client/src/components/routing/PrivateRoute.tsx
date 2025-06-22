import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../utils/auth-context';

interface PrivateRouteProps {
  children: React.ReactNode;
  role?: string;
  roles?: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, role, roles = [] }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // Convert single role to array for consistent checking
  const allowedRoles = role ? [role] : roles;
  
  // Show loading spinner
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  // Not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if user has required role
  if (allowedRoles.length > 0 && user?.role && !allowedRoles.includes(user.role)) {
    // User does not have required role, redirect to home
    return <Navigate to="/" replace />;
  }
  
  // User is authenticated and has required role
  return <>{children}</>;
};

export default PrivateRoute; 