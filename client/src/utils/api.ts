import axios from 'axios';
import { isTokenExpired } from './jwt';

// Create an instance of axios with a base URL
const api = axios.create({
  baseURL: 'http://localhost:5001',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include the auth token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Check if token is expired
      if (isTokenExpired(token)) {
        console.warn('Token is expired, removing from localStorage and redirecting to login');
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(new Error('Token expired'));
      }
      
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
      console.log('Adding Authorization header with token:', token.substring(0, 20) + '...');
      config.headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url} (no token)`);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(`API Error Response: ${error.response.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response.data);
      
      if (error.response.status === 401) {
        console.warn('Unauthorized response received, clearing token and redirecting to login');
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } else if (error.request) {
      console.error('API Error: No response received', error.request);
    } else {
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api; 