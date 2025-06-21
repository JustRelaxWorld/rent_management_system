import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { isTokenExpired } from '../../utils/jwt';

interface PrivateRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, roles = [] }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      // Check if token exists
      const token = localStorage.getItem('token');
      
      if (!token || isTokenExpired(token)) {
        localStorage.removeItem('token'); // Remove expired token
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      
      try {
        // Set auth header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Get current user
        const res = await axios.get('/api/auth/me');
        
        setIsAuthenticated(true);
        setUserRole(res.data.data.role);
        setLoading(false);
      } catch (err) {
        // Token is invalid or expired
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Show loading spinner
  if (loading) {
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
  if (roles.length > 0 && userRole && !roles.includes(userRole)) {
    // User does not have required role, redirect to home
    return <Navigate to="/" replace />;
  }
  
  // User is authenticated and has required role
  return <>{children}</>;
};

export default PrivateRoute; 