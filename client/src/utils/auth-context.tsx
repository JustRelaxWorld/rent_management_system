import React, { createContext, useState, useContext, useEffect } from 'react';
import api from './api';
import { decodeToken, isTokenExpired } from './jwt';

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
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  register: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data from localStorage on initial load
  useEffect(() => {
    const loadUserData = () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && !isTokenExpired(storedToken)) {
          // Set token in state and API headers
          setToken(storedToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          // Parse and set user data
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
          } else {
            // If we have a token but no user data, try to fetch it
            api.get('/api/auth/me')
              .then(response => {
                if (response.data && response.data.data) {
                  setUser(response.data.data);
                  localStorage.setItem('user', JSON.stringify(response.data.data));
                }
              })
              .catch(error => {
                console.error('Failed to fetch user data:', error);
                // If we can't fetch user data, clear the token
                localStorage.removeItem('token');
                setToken(null);
              });
          }
        } else if (storedToken) {
          // Token is expired, remove it
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserData();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      console.log('Login API response:', response.data);
      
      // Check if the response is successful
      if (!response.data.success) {
        throw new Error(response.data.message || 'Login failed');
      }
      
      // Extract token and user data from response
      const newToken = response.data.token;
      const userData = response.data.user;
      
      if (!newToken || !userData) {
        throw new Error('Invalid response format from login API');
      }
      
      // Save token and user data to localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      setToken(newToken);
      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  const register = async (userData: any) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      console.log('Register API response:', response.data);
      
      // Check if the response is successful
      if (!response.data.success) {
        throw new Error(response.data.message || 'Registration failed');
      }
      
      // Extract token and user data from response
      const newToken = response.data.token;
      const newUser = response.data.user;
      
      if (!newToken || !newUser) {
        throw new Error('Invalid response format from register API');
      }
      
      // Save token and user data to localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      setToken(newToken);
      setUser(newUser);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 