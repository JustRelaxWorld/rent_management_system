import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../utils/auth-context';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ExclamationCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

// Debug flag - turn to false in production
const DEBUG_LOGIN = true;

// Debug logger function
const logDebug = (message: string, data?: any) => {
  if (DEBUG_LOGIN) {
    const timestamp = new Date().toISOString().substring(11, 23); // HH:MM:SS.sss
    if (data) {
      console.log(`[Login Debug ${timestamp}] ${message}`, data);
    } else {
      console.log(`[Login Debug ${timestamp}] ${message}`);
    }
  }
};

const Login: React.FC = () => {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const redirectAttempted = useRef(false);
  const preventRedirectSet = useRef(false);
  
  const { login, isAuthenticated, user, isLoading, authChecked, preventRedirect, setPreventRedirect, handlePostLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // CRITICAL FIX: Set prevent redirect flag when on login page
  useEffect(() => {
    // Always set preventRedirect to true on login page - this is safe to call multiple times
    logDebug('Setting preventRedirect=true on Login mount');
    setPreventRedirect(true);
    
    // Only cleanup on unmount
    return () => {
      // Check if we're actually navigating away from login page
      // We can determine this by checking if we're in an unmount that's not caused by StrictMode
      const currentPath = window.location.pathname;
      if (currentPath !== '/login') {
        logDebug(`Clearing preventRedirect on actual navigation from /login to ${currentPath}`);
        setPreventRedirect(false);
      } else {
        logDebug('Skipping preventRedirect cleanup during StrictMode render');
      }
    };
  }, [setPreventRedirect]);

  // Redirect authenticated users away from login page - only once!
  useEffect(() => {
    // Skip if we're loading or haven't completed auth check
    if (isLoading || !authChecked) {
      logDebug('Auth not ready yet, skipping redirect check');
      return;
    }
    
    // Skip redirect on login page if redirect already attempted
    if (redirectAttempted.current) {
      logDebug('Already attempted redirect, skipping to prevent loop');
      return;
    }
    
    // Redirect based on auth state
    if (isAuthenticated && user?.role) {
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
      logDebug('User not authenticated, staying on login page');
    }
  }, [authChecked, isAuthenticated, user, isLoading, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    logDebug('Login form submitted', formData.email);
    setLoading(true);
    setError(null);

    try {
      // Call login and get the user data
      const userData = await login(formData.email, formData.password);
      logDebug('Login successful, received user data', userData);
      
      // Reset redirect attempted flag to allow redirect after successful login
      redirectAttempted.current = false;
      
      // Use centralized post-login handler for consistent behavior
      handlePostLogin(userData, navigate);
    } catch (err: any) {
      logDebug('Login failed', err);
      setError(err.response?.data?.message || err.message || 'Login failed. Please try again.');
      setLoading(false); // Make sure to reset loading state on error
    }
  };

  const redirectToWorkOS = (provider: string) => {
    logDebug(`Redirecting to WorkOS ${provider} login`);
    window.location.href = `http://localhost:5000/auth/login?provider=${provider}`;
  };
  
  const showEmailFormHandler = () => {
    setShowEmailForm(true);
  };
  
  const backToProviders = () => {
    setShowEmailForm(false);
    setError(null);
  };

  // Show loading indicator while auth check is in progress
  if (!authChecked || isLoading) {
    logDebug('Still loading auth state, showing loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent-50 dark:bg-neutral-900">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-text-700 dark:text-white">Checking authentication...</p>
        </div>
      </div>
    );
  }

  logDebug('Rendering login form', { isAuthenticated, authChecked });
  return (
    <div className="min-h-screen flex bg-accent-50 dark:bg-neutral-900">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <img
            src="/login.jpg.jpg"
            alt="Modern apartment building"
            className="w-full h-full object-cover"
          />
          {/* Brand overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/30 via-primary-600/20 to-primary-700/40"></div>
        </motion.div>
        
        {/* Brand overlay */}
        <div className="relative z-10 flex flex-col justify-end items-end h-full text-white px-12 pb-20 pr-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-center"
          >
            <div className="mb-6">
              <div className="mx-auto h-20 w-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-4 border border-white/30">
                <div className="text-3xl font-bold text-white">R</div>
              </div>
              <h1 className="text-4xl font-bold mb-3 text-white">RentEase</h1>
              <p className="text-lg text-white/90 max-w-md leading-relaxed">
                Streamline your property management with our comprehensive platform
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-4 sm:mb-6">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="mx-auto h-12 w-12 sm:h-14 sm:w-14 bg-primary-500 rounded-2xl flex items-center justify-center mb-3 shadow-soft"
            >
              <span className="text-lg sm:text-xl font-bold text-white">R</span>
            </motion.div>
            <h1 className="text-lg sm:text-xl font-bold text-text-950 dark:text-white">
              RentEase
            </h1>
          </div>

          {/* Form Header */}
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-text-950 dark:text-white mb-1">
              {showEmailForm ? "Log in with Email" : "Welcome back"}
            </h2>
            <p className="text-text-600 dark:text-neutral-400 text-sm">
              {showEmailForm ? "Enter your credentials to continue" : "Sign in to your account to continue"}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!showEmailForm ? (
              <motion.div
                key="auth-providers"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {/* Auth Provider Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => redirectToWorkOS('google')}
                    className="w-full flex items-center justify-center gap-2 bg-white dark:bg-neutral-800 border border-accent-200 dark:border-neutral-700 hover:bg-accent-50 dark:hover:bg-neutral-700 px-4 py-3 rounded-xl transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#FFC107"/>
                      <path d="M3.15295 7.3455L6.43845 9.755C7.32745 7.554 9.48045 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C8.15895 2 4.82795 4.1685 3.15295 7.3455Z" fill="#FF3D00"/>
                      <path d="M12 22C14.583 22 16.93 21.0115 18.7045 19.404L15.6095 16.785C14.5718 17.5742 13.3037 18.001 12 18C9.39903 18 7.19053 16.3415 6.35853 14.027L3.09753 16.5395C4.75253 19.778 8.11353 22 12 22Z" fill="#4CAF50"/>
                      <path d="M21.8055 10.0415H21V10H12V14H17.6515C17.2571 15.1082 16.5467 16.0766 15.608 16.7855L15.6095 16.7845L18.7045 19.4035C18.4855 19.6025 22 17 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#1976D2"/>
                    </svg>
                    <span className="text-text-700 dark:text-white font-medium">Continue with Google</span>
                  </button>
                  
                  <button
                    onClick={() => redirectToWorkOS('apple')}
                    className="w-full flex items-center justify-center gap-2 bg-white dark:bg-neutral-800 border border-accent-200 dark:border-neutral-700 hover:bg-accent-50 dark:hover:bg-neutral-700 px-4 py-3 rounded-xl transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.0005 0.333252C17.1505 0.333252 17.3005 0.333252 17.5005 0.333252C17.6755 1.88325 16.9672 3.04175 16.2255 3.79325C15.4838 4.59325 14.4338 5.33325 12.9338 5.19992C12.7338 3.69992 13.4422 2.58325 14.1838 1.83325C14.8755 1.14992 16.1338 0.499919 17.0005 0.333252Z" fill="currentColor"/>
                      <path d="M21.6602 17.6248C21.6602 17.6331 21.6602 17.6415 21.6602 17.6498C21.3352 18.6081 20.8935 19.4415 20.3435 20.2748C19.8768 20.9665 19.2102 21.7748 18.1935 21.7748C17.3268 21.7748 16.7102 21.3331 15.8685 21.3165C14.9768 21.2998 14.4185 21.7165 13.5602 21.7915C13.4518 21.7998 13.3435 21.7998 13.2352 21.7915C12.2852 21.7415 11.7185 20.9748 11.2268 20.2831C9.91016 18.2665 8.86683 16.0081 8.70016 13.1748C8.70016 13.0998 8.69183 13.0248 8.69183 12.9498C8.68183 11.2331 9.60016 9.83314 10.9518 9.04147C11.6852 8.59981 12.6018 8.3081 13.5185 8.3581C13.8768 8.3831 14.2268 8.4831 14.5685 8.59143C14.8768 8.6831 15.2018 8.8331 15.5518 8.8331C15.8185 8.8331 16.1018 8.70813 16.3935 8.62477C17.0268 8.44143 17.6602 8.24143 18.3268 8.3331C19.2768 8.44977 20.0768 8.8081 20.6685 9.34977C20.6268 9.3831 19.6685 9.9581 19.6768 11.2665C19.6935 12.7998 20.8852 13.2915 20.9102 13.2998C20.9102 13.2998 20.9102 13.2998 20.9102 13.3081C20.9102 13.3165 20.8685 13.5081 20.7852 13.7998C20.5352 14.6248 20.0518 15.6331 19.3268 16.3331C18.8185 16.8081 18.2518 17.1998 17.5102 17.1998C17.0185 17.1998 16.6018 17.0248 16.2018 16.8581C15.7768 16.6831 15.3685 16.4998 14.8102 16.4998C14.2935 16.4998 13.8518 16.6748 13.4102 16.8498C13.0102 17.0081 12.6185 17.1748 12.1852 17.1998C11.4852 17.1998 10.9352 16.8331 10.4685 16.3998C10.2428 16.1991 10.0392 15.9746 9.86016 15.7294C10.4766 15.3513 10.9647 14.8141 11.2688 14.1781C11.573 13.5421 11.6823 12.8308 11.5851 12.1337C11.4879 11.4366 11.1878 10.7823 10.7206 10.2466C10.2533 9.71085 9.63893 9.31492 8.95016 9.10811C9.11009 8.32346 9.40212 7.57635 9.81016 6.8998C10.4185 5.8831 11.2102 5.04143 12.2102 4.5081C12.7268 4.24143 13.4435 4.00812 14.3602 3.9581C15.2602 3.9081 16.1102 4.21643 16.8435 4.4831C17.3351 4.67647 17.7935 4.9581 18.3268 4.8831C18.7518 4.8331 19.1685 4.5998 19.5518 4.4081C20.0768 4.1581 20.6102 3.8998 21.2268 3.8831C21.2352 3.8831 21.2518 3.8831 21.2602 3.8831C21.0935 4.24143 20.9018 4.5831 20.6852 4.90813C20.1935 5.6581 19.5185 6.3081 18.5935 6.68312C18.6785 10.1331 17.6685 13.2998 15.7602 15.9915C14.8435 17.2915 13.6685 18.4081 12.1102 19.1415C11.7102 19.3248 10.9352 19.5665 10.0102 19.4748C9.59183 19.4331 9.18349 19.3248 8.79183 19.1581C8.21683 18.9165 7.71683 18.5498 7.29183 18.0831C6.51683 17.2581 5.94183 16.2081 5.63349 15.0498C5.3702 13.9033 5.29944 12.7243 5.42431 11.5623C5.55753 10.5248 5.86016 9.4998 6.33349 8.55813C7.26683 6.6581 8.71683 5.07477 10.3935 3.9581C12.0435 2.8081 14.0018 2.0748 16.3768 1.96646C16.4852 1.96646 16.5935 1.9581 16.7018 1.96646C16.7851 1.97477 16.8768 1.9831 16.9602 1.99977C15.1018 3.04977 13.5768 5.0081 13.3268 7.3581C13.2268 8.2581 13.3518 9.1081 13.7018 9.8998C14.0518 10.6831 14.6435 11.3331 15.4268 11.7415C16.1268 12.0998 16.8602 12.2331 17.6268 12.1498C18.3685 12.0748 19.1268 11.7748 19.6602 11.1665C19.6602 11.4248 19.6602 11.6831 19.6518 11.9415C19.6352 14.3831 20.4518 16.3081 21.6602 17.6248Z" fill="currentColor"/>
                    </svg>
                    <span className="text-text-700 dark:text-white font-medium">Continue with Apple</span>
                  </button>
                  
                  <div className="relative flex items-center my-6">
                    <div className="flex-grow border-t border-accent-200 dark:border-neutral-700"></div>
                    <span className="flex-shrink mx-4 text-text-500 dark:text-neutral-400 text-sm">or</span>
                    <div className="flex-grow border-t border-accent-200 dark:border-neutral-700"></div>
                  </div>
                  
                  <Button
                    onClick={showEmailFormHandler}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3"
                    variant="outline"
                  >
                    <EnvelopeIcon className="w-5 h-5" />
                    <span>Login with Email</span>
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="email-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {/* Back Button */}
                <button 
                  onClick={backToProviders}
                  className="flex items-center text-text-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-500 mb-4 text-sm font-medium"
                >
                  <ArrowLeftIcon className="w-4 h-4 mr-1" />
                  Back to all sign in options
                </button>
                
                {/* Email Login Form */}
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-text-700 dark:text-neutral-300 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          leftIcon={<EnvelopeIcon className="text-text-400 dark:text-neutral-500" />}
                          placeholder="Enter your email"
                          className={error ? 'border-red-500' : ''}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label htmlFor="password" className="block text-sm font-medium text-text-700 dark:text-neutral-300">
                          Password
                        </label>
                        <Link to="/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-500">
                          Forgot?
                        </Link>
                      </div>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          required
                          value={formData.password}
                          onChange={handleChange}
                          leftIcon={<LockClosedIcon className="text-text-400 dark:text-neutral-500" />}
                          placeholder="Enter your password"
                          className={error ? 'border-red-500' : ''}
                          rightIcon={
                            showPassword ? (
                              <EyeSlashIcon 
                                className="text-text-400 dark:text-neutral-500 cursor-pointer" 
                                onClick={() => setShowPassword(false)}
                              />
                            ) : (
                              <EyeIcon 
                                className="text-text-400 dark:text-neutral-500 cursor-pointer" 
                                onClick={() => setShowPassword(true)}
                              />
                            )
                          }
                        />
                      </div>
                    </div>
                    
                    {error && (
                      <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg flex items-start gap-2 text-sm">
                        <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    )}
                    
                    <Button
                      type="submit"
                      className="w-full"
                      loading={loading}
                      disabled={loading}
                    >
                      {loading ? 'Logging in...' : 'Login'}
                    </Button>
                    
                    <p className="text-center text-sm text-text-500 dark:text-neutral-400">
                      Don't have an account?{' '}
                      <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-500">
                        Register
                      </Link>
                    </p>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Login; 