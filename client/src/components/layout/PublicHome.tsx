import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/auth-context';
import Home from './Home';
import LoadingSpinner from '../ui/LoadingSpinner';

// Debug flag - turn to false in production
const DEBUG_HOME = true;

// Debug logger function
const logDebug = (message: string, data?: any) => {
  if (DEBUG_HOME) {
    const timestamp = new Date().toISOString().substring(11, 23); // HH:MM:SS.sss
    if (data) {
      console.log(`[PublicHome Debug ${timestamp}] ${message}`, data);
    } else {
      console.log(`[PublicHome Debug ${timestamp}] ${message}`);
    }
  }
};

const PublicHome: React.FC = () => {
  const { user, isAuthenticated, isLoading, authChecked, preventRedirect } = useAuth();
  const navigate = useNavigate();
  const redirectAttempted = useRef(false);

  useEffect(() => {
    // Only redirect if authentication has been determined (not loading and auth check completed)
    // and the user is authenticated and has a valid role
    if (authChecked && !isLoading && isAuthenticated && user && user.role && !preventRedirect && !redirectAttempted.current) {
      // Don't redirect if user doesn't have a valid role
      if (user.role === 'undefined' || !user.role) {
        logDebug('User has no valid role, staying on home page');
        return;
      }
      
      logDebug(`User authenticated as ${user.role}, redirecting to dashboard`);
      redirectAttempted.current = true;
      
      // Redirect based on user role
      if (user.role === 'tenant') {
        navigate('/tenant/dashboard', { replace: true });
      } else if (user.role === 'landlord') {
        navigate('/landlord/dashboard', { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      }
    } else {
      logDebug('Staying on home page', { 
        authChecked, 
        isLoading, 
        isAuthenticated, 
        preventRedirect,
        redirectAttempted: redirectAttempted.current,
        userRole: user?.role
      });
    }
  }, [authChecked, isLoading, isAuthenticated, user, navigate, preventRedirect]);

  // Show loading indicator while auth check is in progress
  if (!authChecked || isLoading) {
    logDebug('Still loading auth state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent-50 dark:bg-neutral-900">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-text-700 dark:text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated or no valid role, show the regular home page
  logDebug('Rendering home page');
  return <Home />;
};

export default PublicHome; 