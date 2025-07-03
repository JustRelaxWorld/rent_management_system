import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../utils/auth-context';
import { motion } from 'framer-motion';
import { extractTokenFromUrl } from '../../utils/jwt';
import AuthLoader from '../ui/AuthLoader';

// Debug flag - turn to false in production
const DEBUG = true;

// Debug logger function
const logDebug = (message: string, data?: any) => {
  if (DEBUG) {
    const timestamp = new Date().toISOString().substring(11, 23); // HH:MM:SS.sss
    if (data) {
      console.log(`[AuthCallback Debug ${timestamp}] ${message}`, data);
    } else {
      console.log(`[AuthCallback Debug ${timestamp}] ${message}`);
    }
  }
};

const AuthCallback: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { handleAuthCallback, handlePostLogin, setUser, setToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Create a unique key for this specific callback request to prevent duplicate processing
    const callbackKey = `auth_callback_${location.search}`;
    
    const processCallback = async () => {
      // Check if we've already processed this exact callback
      if (localStorage.getItem(callbackKey)) {
        logDebug('This callback was already processed, skipping duplicate processing');
        return;
      }
      
      // Mark this callback as being processed
      localStorage.setItem(callbackKey, Date.now().toString());
      
      try {
        // Get token from URL query parameters using our utility function
        const token = extractTokenFromUrl(location.search);
        
        if (!token) {
          setError('No valid authentication token provided. Please try again.');
          setLoading(false);
          return;
        }

        logDebug('Processing authentication callback with token');
        
        // Always save token first to ensure it's available for API calls
        localStorage.setItem('token', token);
        setToken(token);
        
        // If we're already on a dashboard, skip navigation but still process the token
        if (location.pathname.includes('/dashboard')) {
          logDebug('Already on dashboard page with token, processing authentication');
          
          try {
            // Process the authentication to update the user data
            const userData = await handleAuthCallback(token);
            
            if (userData) {
              logDebug('Auth successful on dashboard page, staying here', userData);
              setLoading(false);
            } else {
              // If token is invalid but we're on a dashboard, redirect to login
              logDebug('Invalid token on dashboard page, redirecting to login');
              navigate('/login', { replace: true });
            }
          } catch (err) {
            logDebug('Error processing token on dashboard', err);
            navigate('/login', { replace: true });
          }
          return;
        }
        
        // Standard auth flow for non-dashboard pages
        logDebug('Processing standard auth callback flow');
        const userData = await handleAuthCallback(token);
        
        if (userData) {
          logDebug('Auth successful, navigating based on role', userData);
          // Centralized redirection logic
          handlePostLogin(userData, navigate);
        } else {
          setError('Failed to authenticate. Please try again.');
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message || 'Authentication failed. Please try again.');
        setLoading(false);
      }
    };
    
    processCallback();
    
    // Clear the callback key after a while to allow re-processing if needed
    return () => {
      setTimeout(() => {
        localStorage.removeItem(callbackKey);
      }, 10000); // 10 seconds should be enough for the whole auth process
    };
  }, [location.search, handleAuthCallback, navigate, location.pathname, handlePostLogin, setToken, setUser]);
  
  if (loading) {
    return <AuthLoader message="Completing authentication..." />;
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent-50 dark:bg-neutral-900 px-4">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-soft border border-accent-200 dark:border-neutral-700 p-6 max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto h-14 w-14 bg-red-500 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-text-950 dark:text-white mb-2">
              Authentication Failed
            </h2>
            <p className="text-text-700 dark:text-neutral-400 mb-4">
              {error}
            </p>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-xl transition-colors"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return <AuthLoader message="Redirecting to dashboard..." />;
};

export default AuthCallback; 