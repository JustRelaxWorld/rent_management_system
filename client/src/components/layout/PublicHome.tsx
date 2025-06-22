import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/auth-context';
import Home from './Home';

const PublicHome: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on user role
      if (user.role === 'tenant') {
        navigate('/tenant-dashboard');
      } else if (user.role === 'landlord') {
        navigate('/landlord-dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  // If not authenticated, show the regular home page
  return <Home />;
};

export default PublicHome; 