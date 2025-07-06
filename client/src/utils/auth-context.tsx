import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import api from './api';
import { decodeToken, isTokenExpired } from './jwt';

// Debug flag - turn to false in production
const DEBUG_AUTH = true;

// Debug logger function
const logDebug = (message: string, data?: any) => {
  if (DEBUG_AUTH) {
    const timestamp = new Date().toISOString().substring(11, 23); // HH:MM:SS.sss
    if (data) {
      console.log(`[Auth Debug ${timestamp}] ${message}`, data);
    } else {
      console.log(`[Auth Debug ${timestamp}] ${message}`);
    }
  }
};

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authChecked: boolean;
  authError: string | null;
  preventRedirect: boolean;
  setPreventRedirect: (value: boolean) => void;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  register: (userData: any) => Promise<any>;
  updateUser: (userData: User) => void;
  setUser: (userData: User | null) => void;
  checkAuth: () => Promise<boolean>;
  cleanupAuth: () => void;
  handleAuthCallback: (token: string) => Promise<User | null>;
  forgotPassword: (email: string) => Promise<any>;
  verifyCode: (email: string, code: string) => Promise<any>;
  resetPassword: (email: string, code: string, password: string) => Promise<any>;
  uploadAvatar: (file: File) => Promise<any>;
  updateThemePreference: (theme: 'light' | 'dark') => Promise<any>;
  isProfileComplete: (user: User | null) => boolean;
  handlePostLogin: (userData: User, navigate?: (path: string, options?: any) => void) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  authChecked: false,
  authError: null,
  preventRedirect: false,
  setPreventRedirect: () => {},
  setToken: () => {},
  login: async () => { throw new Error('Not implemented'); },
  logout: () => {},
  register: async () => {},
  updateUser: () => {},
  setUser: () => {},
  checkAuth: async () => false,
  cleanupAuth: () => {},
  handleAuthCallback: async () => null,
  forgotPassword: async () => {},
  verifyCode: async () => {},
  resetPassword: async () => {},
  uploadAvatar: async () => {},
  updateThemePreference: async () => {},
  isProfileComplete: () => false,
  handlePostLogin: () => {}
});

export const useAuth = () => useContext(AuthContext);

// CRITICAL FIX: This creates a singleton to prevent repeated auth checks
// These variables are outside the component to persist across rerenders
let authCheckInProgress = false;
let lastAuthCheckTime = 0;
const AUTH_CHECK_COOLDOWN = 2000; // 2 seconds cooldown between auth checks
const checkCount = {count: 0};

// Helper function to check if a user profile is complete
const isProfileComplete = (user: User | null): boolean => {
  if (!user) return false;
  
  // Check for required fields based on user role
  const hasBasicInfo = !!user.name && !!user.phone;
  const hasAvatar = !!user.avatar;
  
  if (user.role === 'tenant') {
    return hasBasicInfo && hasAvatar && !!user.id_number;
  } else if (user.role === 'landlord') {
    return hasBasicInfo && hasAvatar && !!user.ownership_document;
  }
  
  return hasBasicInfo && hasAvatar;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [preventRedirect, setPreventRedirect] = useState(false);
  const initAttempted = useRef(false);
  
  const location = window.location.pathname;
  
  // Log every render with current auth state
  useEffect(() => {
    logDebug(`Auth state updated - URL: ${location}, isLoading: ${isLoading}, authChecked: ${authChecked}, isAuthenticated: ${!!user && !!token}, preventRedirect: ${preventRedirect}`);
  }, [user, token, isLoading, authChecked, preventRedirect, location]);

  // Function to check authentication status
  const checkAuth = async (): Promise<boolean> => {
    // If already loading, don't start another check
    if (isLoading) {
      logDebug('Auth check skipped - already loading');
      return !!user && !!token;
    }
    
    // If no token, quick return false
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      logDebug('Auth check - no token found');
      setAuthChecked(true);
      return false;
    }
    
    // If token is expired, clean up and return false
    if (isTokenExpired(storedToken)) {
      logDebug('Auth check - token is expired');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      setToken(null);
      setUser(null);
      setAuthChecked(true);
      return false;
    }
    
    try {
      // Set loading state
      setIsLoading(true);
      logDebug('Checking authentication with API');
      
      // Ensure token is in API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      
      // Try to fetch user data from the server
      const response = await api.get('/api/auth/me');
      
      if (response.data && response.data.data) {
        const userData = response.data.data;
        logDebug('Auth check successful, received user data', userData);
        
        // Update state and localStorage
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(storedToken);
        setAuthError(null);
        
        return true;
      }
      
      // If we get here, authentication failed
      logDebug('Auth check failed, no valid user data');
      setAuthError('Authentication check failed - no valid user data');
      
      // Clean up auth state
      cleanupAuth();
      
      return false;
    } catch (error: any) {
      console.error('Auth check failed:', error);
      logDebug('Auth check error', error);
      setAuthError('Authentication check failed: ' + (error.message || 'Unknown error'));
      
      // Clean up auth state
      cleanupAuth();
      
      return false;
    } finally {
      setIsLoading(false);
      setAuthChecked(true);
      logDebug('Auth check completed');
    }
  };
  
  // Helper to clean up authentication state
  const cleanupAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  // Load user data from localStorage on initial load - only once!
  useEffect(() => {
    if (initAttempted.current) {
      logDebug('Auth initialization already attempted, skipping');
      return;
    }
    
    initAttempted.current = true;
    
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        logDebug(`Initial auth load started at path: ${location}`);
        
        // CRITICAL FIX: For login/register pages, don't try to auto-authenticate
        // but still set the authChecked flag to true
        if (location === '/login' || location === '/register') {
          logDebug('On auth page, setting minimal state and skipping auth check');
          setIsLoading(false);
          setAuthChecked(true);
          return;
        }
        
        const storedToken = localStorage.getItem('token');
        
        // No token case - clear auth state
        if (!storedToken) {
          logDebug('No token found, clearing auth state');
          setToken(null);
          setUser(null);
          setIsLoading(false);
          setAuthChecked(true);
          return;
        }
        
        // Check for expired tokens
        if (isTokenExpired(storedToken)) {
          logDebug('Token is expired, removing it');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
          setIsLoading(false);
          setAuthChecked(true);
          setAuthError('Token expired');
          return;
        }
        
        logDebug('Found valid token, setting in state and API headers');
        
        // Set token in state and API headers
        setToken(storedToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        
        // Always fetch fresh user data from API when token exists
        try {
          logDebug('Fetching current user data from API');
          const response = await api.get('/api/auth/me');
          
          if (response.data && response.data.data) {
            const userData = response.data.data;
            logDebug('Successfully loaded user data from API', userData);
            
            // Update user state and localStorage
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Track successful initialization
            localStorage.setItem('auth_initialized', 'true');
            
            // Clear any previous errors
            setAuthError(null);
          } else {
            // Invalid response from API
            logDebug('API returned invalid user data', response.data);
            throw new Error('Invalid user data returned from API');
          }
        } catch (apiError: any) {
          // API call failed - token might be invalid or server error
          logDebug('Failed to fetch user data from API', apiError);
          
          // Clear token and user data on API error
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete api.defaults.headers.common['Authorization'];
          setToken(null);
          setUser(null);
          setAuthError('Failed to restore session: ' + (apiError.message || 'API error'));
        }
      } catch (error) {
        // Unexpected error in initialization
        console.error('Unexpected auth initialization error:', error);
        logDebug('Auth initialization error', error);
        setAuthError('Authentication initialization failed');
        setUser(null);
        setToken(null);
      } finally {
        // Always set these flags regardless of outcome
        setIsLoading(false);
        setAuthChecked(true);
        logDebug('Auth initialization completed');
      }
    };

    // Start the initialization process
    initializeAuth();
  }, [location]);
  
  // Silent auth check that doesn't change loading state
  // CRITICAL FIX: This function is no longer called to prevent loops
  const checkAuthSilently = async () => {
    logDebug('Silent auth check disabled to prevent loops');
    return;
    
    /* Original implementation removed to prevent loops
    try {
      logDebug('Silently checking auth in background');
      
      // Try to fetch user data from the server
      const response = await api.get('/api/auth/me');
      
      if (response.data && response.data.data) {
        logDebug('Silent auth check successful');
        setUser(response.data.data);
        localStorage.setItem('user', JSON.stringify(response.data.data));
      } else {
        logDebug('Silent auth check failed');
        // Clear any stored tokens and user data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      logDebug('Silent auth check error', error);
      
      // Clear any stored tokens and user data on error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      setToken(null);
      setUser(null);
    }
    */
  };

  // Handle auth callback from WorkOS
  const handleAuthCallback = async (token: string): Promise<User | null> => {
    try {
      setIsLoading(true);
      logDebug('Handling auth callback with token');
      
      // Save the token
      localStorage.setItem('token', token);
      setToken(token);
      
      // Set the token in API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Fetch user data
      const response = await api.get('/api/auth/me');
      
      if (response.data && response.data.data) {
        const userData = response.data.data;
        logDebug('Auth callback successful, received user data:', userData);
        
        // Save user data
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Set auth status
        setAuthChecked(true);
        
        // Clear any previous errors
        setAuthError(null);
        
        // Centralized post-login handler for consistent behavior
        handlePostLogin(userData);
        
        return userData;
      } else {
        logDebug('Auth callback failed, no valid user data received');
        setAuthError('Failed to get user data from token');
        setToken(null);
        setUser(null);
        return null;
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      logDebug('Auth callback error', error);
      setAuthError('Authentication callback failed');
      setToken(null);
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Login with email and password
  const login = async (email: string, password: string): Promise<User> => {
    try {
      setIsLoading(true);
      logDebug('Logging in with email:', email);
      
      // Make the login request
      const response = await api.post('/api/auth/login', {
        email,
        password
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Login failed');
      }
      
      // Extract token and user data
      const { token: newToken, user: userData } = response.data;
      
      logDebug('Login successful, received token and user data:', userData);
      
      // Save the token
      localStorage.setItem('token', newToken);
      setToken(newToken);
      
      // Set the token in API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      // Save user data
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set auth status
      setAuthChecked(true);
      setAuthError(null);
      
      // Centralized post-login handler for consistent behavior
      handlePostLogin(userData);
      
      // Return the user data for further processing if needed
      return userData;
    } catch (error: any) {
      logDebug('Login failed', error);
      setAuthError(error.response?.data?.message || error.message || 'Authentication failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    logDebug('Logout called');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    setAuthError(null);
    
    // CRITICAL FIX: Reset auth check counters after logout
    checkCount.count = 0;
    authCheckInProgress = false;
  };

  const register = async (userData: any) => {
    try {
      logDebug('Registration attempt', userData instanceof FormData ? 'with FormData' : userData);
      setIsLoading(true);
      
      // Check if userData is FormData (for file uploads) or a plain object
      let response;
      
      if (userData instanceof FormData) {
        // For FormData (with file uploads)
        logDebug('Sending registration with FormData');
        // Log the form data keys for debugging
        const formDataKeys: string[] = [];
        userData.forEach((value, key) => {
          if (value instanceof File) {
            formDataKeys.push(`${key} (File: ${value.name}, ${value.size} bytes, ${value.type})`);
          } else {
            formDataKeys.push(`${key}: ${value}`);
          }
        });
        logDebug('FormData contents:', formDataKeys);
        
        response = await api.post('/api/auth/email-register', userData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // For regular JSON data
        logDebug('Sending registration with JSON data');
        response = await api.post('/api/auth/email-register', userData);
      }
      
      logDebug('Register API response:', response.data);
      
      // Check if the response is successful
      if (!response.data.success) {
        throw new Error(response.data.message || 'Registration failed');
      }
      
      // Return the response without auto-logging in
      return response.data;
    } catch (error: any) {
      console.error('Registration error:', error);
      logDebug('Registration failed', error);
      
      // Detailed error logging to help debug server errors
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        logDebug('Error response from server:', {
          data: error.response.data,
          status: error.response.status,
          headers: error.response.headers
        });
      } else if (error.request) {
        // The request was made but no response was received
        logDebug('No response received:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        logDebug('Error during request setup:', error.message);
      }
      
      setAuthError('Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (userData: User) => {
    if (userData && userData.avatar) {
      // Ensure the avatar URL has a cache-busting parameter
      // First check if the avatar URL already has a timestamp parameter
      if (!userData.avatar.includes('?t=') && !userData.avatar.includes('&t=')) {
        userData = {
          ...userData,
          avatar: `${userData.avatar}${userData.avatar.includes('?') ? '&' : '?'}t=${Date.now()}`
        };
      }
    }
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    logDebug('User data updated', userData);
  };

  // Forgot Password
  const forgotPassword = async (email: string): Promise<any> => {
    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  };
  
  // Verify Code
  const verifyCode = async (email: string, code: string): Promise<any> => {
    try {
      const response = await api.post('/api/auth/verify-code', { email, code });
      return response.data;
    } catch (error) {
      console.error('Verify code error:', error);
      throw error;
    }
  };
  
  // Reset Password
  const resetPassword = async (email: string, code: string, password: string): Promise<any> => {
    try {
      const response = await api.post('/api/auth/reset-password', { email, code, password });
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };
  
  // Upload Avatar
  const uploadAvatar = async (file: File): Promise<any> => {
    try {
      // Create form data object
      const formData = new FormData();
      formData.append('avatar', file);
      
      // Set token in header
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');
      
      // Set up request
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      };
      
      // Make API request
      const response = await api.post('/api/auth/avatar', formData, config);
      
      // If successful, update user state with new avatar
      if (response.data.success) {
        setUser((prevUser) => {
          if (prevUser) {
            return {
              ...prevUser,
              avatar: response.data.data.avatar
            };
          }
          return prevUser;
        });
        
        // Update stored user data
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        userData.avatar = response.data.data.avatar;
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      return response.data;
    } catch (error) {
      console.error('Avatar upload error:', error);
      throw error;
    }
  };
  
  // Update Theme Preference
  const updateThemePreference = async (theme: 'light' | 'dark'): Promise<any> => {
    try {
      // Set token in header
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');
      
      // Make API request
      const response = await api.put(
        '/api/auth/profile',
        { theme_preference: theme },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // If successful, update user state with new theme preference
      if (response.data.success) {
        setUser((prevUser) => {
          if (prevUser) {
            return {
              ...prevUser,
              theme_preference: theme
            };
          }
          return prevUser;
        });
        
        // Update stored user data
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        userData.theme_preference = theme;
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      return response.data;
    } catch (error) {
      console.error('Theme preference update error:', error);
      throw error;
    }
  };

  // Centralized post-login handler for consistent behavior
  const handlePostLogin = (userData: User, navigate?: (path: string, options?: any) => void): void => {
    logDebug('Handling post-login actions', { userData });
    
    if (!userData || !userData.role) {
      logDebug('Invalid user data in post-login handler');
      return;
    }
    
    // Generate a unique key for this login session
    const sessionKey = `auth_session_${userData.id}_${userData.role}_${Date.now()}`;
    
    // Check for recent redirects to prevent duplicates
    const recentRedirect = localStorage.getItem('last_auth_redirect');
    const now = Date.now();
    
    if (recentRedirect) {
      const redirectData = JSON.parse(recentRedirect);
      const timeSinceLastRedirect = now - redirectData.time;
      
      // If we redirected to the same place for the same user in the last 2 seconds, skip
      if (
        timeSinceLastRedirect < 2000 && 
        redirectData.userId === userData.id && 
        redirectData.role === userData.role
      ) {
        logDebug('Skipping duplicate redirect that happened within 2 seconds', redirectData);
        return;
      }
    }
    
    // Set this user as authenticated in local storage
    localStorage.setItem('authenticated_user', JSON.stringify({
      id: userData.id,
      role: userData.role,
      time: now
    }));
    
    // If navigate function is provided, redirect based on role
    if (navigate) {
      let targetPath = '/';
      
      // Determine the correct dashboard path based on role
      if (userData.role === 'tenant') {
        targetPath = '/tenant/dashboard';
      } else if (userData.role === 'landlord') {
        targetPath = '/landlord/dashboard';
      } else if (userData.role === 'admin') {
        targetPath = '/admin/dashboard';
      }
      
      // Check if we're already on the target path to avoid unnecessary navigation
      if (window.location.pathname === targetPath) {
        logDebug(`Already on ${targetPath}, skipping navigation`);
        return;
      }
      
      // Record this redirect to prevent duplicates
      localStorage.setItem('last_auth_redirect', JSON.stringify({
        userId: userData.id,
        role: userData.role,
        path: targetPath,
        time: now,
        sessionKey
      }));
      
      logDebug(`Redirecting to ${targetPath}`);
      navigate(targetPath, { replace: true });
    }
  };

  return (
    <AuthContext.Provider 
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        authChecked,
        authError,
        preventRedirect,
        setPreventRedirect,
        setToken,
        login,
        logout,
        register,
        updateUser,
        setUser,
        checkAuth,
        cleanupAuth,
        handleAuthCallback,
        forgotPassword,
        verifyCode,
        resetPassword,
        uploadAvatar,
        updateThemePreference,
        isProfileComplete,
        handlePostLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 