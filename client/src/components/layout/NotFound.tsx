import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HomeIcon, ExclamationTriangleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useAuth } from '../../utils/auth-context';

const NotFound: React.FC = () => {
  const { user } = useAuth();
  
  // Determine where to redirect the user based on their role
  const getHomeLink = () => {
    if (!user) return '/';
    
    switch (user.role) {
      case 'tenant':
        return '/tenant/dashboard';
      case 'landlord':
        return '/landlord/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-neutral-900 dark:to-neutral-800 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full overflow-hidden">
        <div className="p-6 sm:p-10">
          <div className="flex flex-col items-center text-center">
            <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-4 mb-6">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
            
            <motion.h1 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                duration: 0.5,
                type: "spring",
                stiffness: 200
              }}
              className="text-7xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 dark:from-primary-400 dark:to-secondary-400 text-transparent bg-clip-text mb-4"
            >
              404
            </motion.h1>
            
            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-2">Page Not Found</h2>
            
            <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-md">
              The page you are looking for might have been removed, had its name changed,
              or is temporarily unavailable.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={getHomeLink()}>
                <Button 
                  variant="default"
                  size="lg"
                  className="flex items-center justify-center w-full sm:w-auto"
                >
                  <HomeIcon className="h-5 w-5 mr-2" />
                  Go to Dashboard
                </Button>
              </Link>
              
              <Button 
                variant="outline"
                size="lg"
                className="flex items-center justify-center w-full sm:w-auto"
                onClick={() => window.history.back()}
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NotFound; 