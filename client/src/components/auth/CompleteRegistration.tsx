import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { PhoneIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../utils/auth-context';

const CompleteRegistration: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');
  const email = queryParams.get('email');
  
  useEffect(() => {
    if (!token || !email) {
      setError('Missing required information. Please try logging in again.');
    }
  }, [token, email]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone) {
      setError('Phone number is required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/auth/complete-registration', {
        email,
        phone
      });
      
      if (response.data.success) {
        setSuccess('Registration completed successfully!');
        
        // Store the token
        localStorage.setItem('token', response.data.token);
        
        // Redirect to dashboard using the URL from the response
        setTimeout(() => {
          navigate(response.data.redirectUrl || '/dashboard');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-accent-50 dark:bg-neutral-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="mx-auto h-14 w-14 bg-primary-500 rounded-2xl flex items-center justify-center mb-3 shadow-soft">
            <span className="text-xl font-bold text-white">R</span>
          </div>
          <h1 className="text-xl font-bold text-text-950 dark:text-white">
            RentEase
          </h1>
        </div>
        
        {/* Form */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-soft border border-accent-200 dark:border-neutral-700 p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-text-950 dark:text-white mb-2">
              Almost there!
            </h2>
            <p className="text-text-600 dark:text-neutral-400">
              Please provide your phone number to complete registration
            </p>
          </div>
          
          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center p-3 mb-4 text-sm text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-xl"
              role="status"
              aria-live="polite"
            >
              <CheckCircleIcon className="h-4 w-4 mr-2 flex-shrink-0" />
              {success}
            </motion.div>
          )}
          
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center p-3 mb-4 text-sm text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl"
              role="alert"
              aria-live="assertive"
            >
              <ExclamationCircleIcon className="h-4 w-4 mr-2 flex-shrink-0" />
              {error}
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="phone" className="text-sm font-semibold text-text-700 dark:text-neutral-300">
                Phone number
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                required
                leftIcon={<PhoneIcon className="h-4 w-4" />}
                className="w-full h-10"
                autoFocus
                disabled={loading || !!success}
              />
              <p className="text-xs text-text-500 dark:text-neutral-400 mt-1">
                We'll use this for important notifications about your account
              </p>
            </div>
            
            <Button
              type="submit"
              loading={loading}
              className="w-full h-11 text-sm font-semibold mt-4"
              size="md"
              disabled={loading || !!success}
            >
              {loading ? 'Completing...' : 'Complete Registration'}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CompleteRegistration; 