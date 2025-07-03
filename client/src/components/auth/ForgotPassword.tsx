import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon, 
  ArrowLeftIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  KeyIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import api from '../../utils/api';

const ForgotPassword: React.FC = () => {
  // Multi-step form state
  const [step, setStep] = useState<'email' | 'verification' | 'reset'>('email');
  
  // Form data
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    password: '',
    confirmPassword: '',
  });
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isWorkOSUser, setIsWorkOSUser] = useState(false);
  const [authProvider, setAuthProvider] = useState<string | null>(null);
  const [checkedAuth, setCheckedAuth] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // First check if user is registered with WorkOS or local system
      const checkResponse = await axios.post('/api/auth/check-auth-provider', { email: formData.email });
      
      const provider = checkResponse.data.authProvider;
      setAuthProvider(provider);
      setCheckedAuth(true);
      
      if (provider === 'workos' || 
          provider === 'google' || 
          provider === 'apple') {
        
        setIsWorkOSUser(true);
        
        // For WorkOS users, trigger WorkOS password reset flow
        const workosResponse = await axios.post('/api/auth/workos-reset', { email: formData.email });
        
        if (workosResponse.data.success) {
          setSuccess('A password reset link has been sent to your email. Please check your inbox and follow the instructions.');
        }
      } else {
        // For local users, show message that they can't reset
        setError('Password reset is not available for local email accounts. Please contact support if you cannot access your account.');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Auth provider check failed:', err);
      if (err.response?.status === 404) {
        setError('No account found with this email');
      } else {
        setError(err.response?.data?.message || 'An error occurred. Please try again.');
      }
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code) {
      setError('Please enter the verification code');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/api/auth/verify-reset-code', { 
        email: formData.email, 
        code: formData.code 
      });
      
      if (response.data.success) {
        setSuccess('Code verified successfully.');
        setStep('reset');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.password) {
      setError('Please enter a new password');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/api/auth/reset-password', { 
        email: formData.email, 
        code: formData.code,
        password: formData.password
      });
      
      if (response.data.success) {
        setSuccess('Your password has been reset successfully. You can now log in with your new password.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step === 'verification') {
      setStep('email');
    } else if (step === 'reset') {
      setStep('verification');
    } else {
      navigate('/login');
    }
  };

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
              {step === 'email' && 'Reset your password'}
              {step === 'verification' && 'Enter verification code'}
              {step === 'reset' && 'Set new password'}
            </h2>
            <p className="text-text-600 dark:text-neutral-400 text-sm">
              {step === 'email' && 'Enter your email to receive password reset instructions'}
              {step === 'verification' && 'Check your email for a verification code'}
              {step === 'reset' && 'Create a new password for your account'}
            </p>
          </div>

          {/* Form Container */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-soft border border-accent-200 dark:border-neutral-700 p-4 sm:p-6">
            <AnimatePresence mode="wait">
              {/* Email Step */}
              {step === 'email' && (
                <motion.form
                  key="email-step"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleEmailSubmit}
                  className="space-y-4"
                >
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="inline-flex items-center text-sm font-medium text-text-600 dark:text-neutral-400 hover:text-text-800 dark:hover:text-white mb-2"
                  >
                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                    Back to Login
                  </button>
                  
                  {/* Success Message */}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="flex items-center p-3 text-sm text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-xl"
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
                      className="flex items-center p-3 text-sm text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl"
                      role="alert"
                      aria-live="assertive"
                    >
                      <ExclamationCircleIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                      {error}
                    </motion.div>
                  )}

                  {/* Email Field */}
                  <div className="space-y-1">
                    <label htmlFor="email" className="text-sm font-semibold text-text-700 dark:text-neutral-300">
                      Email address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                      leftIcon={<EnvelopeIcon className="h-4 w-4" />}
                      className="w-full h-11"
                      autoFocus
                      disabled={loading || isWorkOSUser || !!success}
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full mt-2"
                    disabled={loading || isWorkOSUser || !!success}
                  >
                    {loading ? 'Sending...' : 'Send Reset Instructions'}
                  </Button>
                  
                  <div className="text-center">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Remember your password?{' '}
                      <Link 
                        to="/login" 
                        className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                      >
                        Sign in
                      </Link>
                    </p>
                  </div>
                </motion.form>
              )}
              
              {/* Verification Step */}
              {step === 'verification' && !isWorkOSUser && (
                <motion.form
                  key="verification-step"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleVerificationSubmit}
                  className="space-y-4"
                >
                  <button
                    type="button"
                    onClick={goBack}
                    className="inline-flex items-center text-sm font-medium text-text-600 dark:text-neutral-400 hover:text-text-800 dark:hover:text-white mb-2"
                  >
                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                    Back
                  </button>
                  
                  {/* Success Message */}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="flex items-center p-3 text-sm text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-xl"
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
                      className="flex items-center p-3 text-sm text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl"
                      role="alert"
                      aria-live="assertive"
                    >
                      <ExclamationCircleIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                      {error}
                    </motion.div>
                  )}

                  {/* Email Display */}
                  <div className="bg-accent-50 dark:bg-neutral-700/30 p-3 rounded-lg text-sm">
                    <p className="text-text-700 dark:text-neutral-300">
                      We sent a verification code to:{' '}
                      <span className="font-medium">{formData.email}</span>
                    </p>
                  </div>

                  {/* Code Field */}
                  <div className="space-y-1">
                    <label htmlFor="code" className="text-sm font-semibold text-text-700 dark:text-neutral-300">
                      Verification code
                    </label>
                    <Input
                      id="code"
                      name="code"
                      type="text"
                      value={formData.code}
                      onChange={handleChange}
                      placeholder="Enter verification code"
                      required
                      leftIcon={<KeyIcon className="h-4 w-4" />}
                      className="w-full h-11"
                      autoFocus
                      disabled={loading || !!success}
                    />
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      Check your email inbox for the verification code we sent you
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full mt-2"
                    disabled={loading || !!success}
                  >
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </Button>
                  
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleEmailSubmit}
                      className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                      disabled={loading}
                    >
                      Didn't receive the code? Send again
                    </button>
                  </div>
                </motion.form>
              )}
              
              {/* Reset Password Step */}
              {step === 'reset' && !isWorkOSUser && (
                <motion.form
                  key="reset-password-step"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleResetSubmit}
                  className="space-y-4"
                >
                  <button
                    type="button"
                    onClick={goBack}
                    className="inline-flex items-center text-sm font-medium text-text-600 dark:text-neutral-400 hover:text-text-800 dark:hover:text-white mb-2"
                  >
                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                    Back
                  </button>
                  
                  {/* Success Message */}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="flex items-center p-3 text-sm text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-xl"
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
                      className="flex items-center p-3 text-sm text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl"
                      role="alert"
                      aria-live="assertive"
                    >
                      <ExclamationCircleIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                      {error}
                    </motion.div>
                  )}

                  {/* New Password Field */}
                  <div className="space-y-1">
                    <label htmlFor="password" className="text-sm font-semibold text-text-700 dark:text-neutral-300">
                      New Password
                    </label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create new password"
                        required
                        leftIcon={<LockClosedIcon className="h-4 w-4" />}
                        className="w-full h-11"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-1">
                    <label htmlFor="confirmPassword" className="text-sm font-semibold text-text-700 dark:text-neutral-300">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm new password"
                        required
                        leftIcon={<LockClosedIcon className="h-4 w-4" />}
                        className="w-full h-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full mt-2"
                    disabled={loading || !!success}
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword; 