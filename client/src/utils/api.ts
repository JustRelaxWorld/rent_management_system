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
        // Token is expired, remove it
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(new Error('Token expired'));
      }
      
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 