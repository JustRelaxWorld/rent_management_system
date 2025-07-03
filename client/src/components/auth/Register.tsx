import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../utils/auth-context';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { 
  UserIcon,
  EnvelopeIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  PhoneIcon,
  IdentificationIcon,
  DocumentIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Debug flag - turn to false in production
const DEBUG_REGISTER = true;

// Debug logger function
const logDebug = (message: string, data?: any) => {
  if (DEBUG_REGISTER) {
    const timestamp = new Date().toISOString().substring(11, 23); // HH:MM:SS.sss
    if (data) {
      console.log(`[Register Debug ${timestamp}] ${message}`, data);
    } else {
      console.log(`[Register Debug ${timestamp}] ${message}`);
    }
  }
};

const Register: React.FC = () => {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'tenant',
    idNumber: ''
  });
  const [ownershipDocument, setOwnershipDocument] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const redirectAttempted = useRef(false);
  
  const { register, isAuthenticated, user, isLoading, authChecked, setPreventRedirect } = useAuth();
  const navigate = useNavigate();
  
  // CRITICAL FIX: Set prevent redirect flag when on register page
  useEffect(() => {
    logDebug('Setting preventRedirect=true on Register mount');
    setPreventRedirect(true);
    
    return () => {
      logDebug('Clearing preventRedirect on Register unmount');
      setPreventRedirect(false);
    };
  }, [setPreventRedirect]);
  
  // Redirect authenticated users away from register page - only once!
  useEffect(() => {
    // Skip if we're loading or haven't completed auth check
    if (isLoading || !authChecked) {
      logDebug('Auth not ready yet, skipping redirect check');
      return;
    }
    
    // Skip redirect if redirect already attempted
    if (redirectAttempted.current) {
      logDebug('Already attempted redirect, skipping to prevent loop');
      return;
    }
    
    // Redirect based on auth state
    if (authChecked && isAuthenticated && user?.role) {
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
      logDebug('User not authenticated, staying on register page');
    }
  }, [authChecked, isAuthenticated, user, isLoading, navigate]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      logDebug(`Selected file: ${file.name}, ${file.size} bytes, ${file.type}`);
      setOwnershipDocument(file);
      setDocumentName(file.name);
      if (error) setError(null);
    }
  };

  const removeDocument = () => {
    setOwnershipDocument(null);
    setDocumentName('');
  };
  
  const validateForm = () => {
    // Clear previous errors
    setError(null);
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (!formData.phone) {
      setError('Phone number is required');
      return false;
    }
    if (formData.role === 'tenant' && !formData.idNumber) {
      setError('National ID number is required for tenants');
      return false;
    }
    if (formData.role === 'landlord' && !ownershipDocument) {
      setError('Property ownership document is required for landlords');
      return false;
    }
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    logDebug('Registration form submitted', formData.email);
    setLoading(true);
    setError(null);

    try {
      // Create a FormData object to handle file upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('role', formData.role);
      
      if (formData.role === 'tenant') {
        formDataToSend.append('idNumber', formData.idNumber);
      } else if (formData.role === 'landlord' && ownershipDocument) {
        // FIX: Ensure proper file appending with correct field name
        formDataToSend.append('ownershipDocument', ownershipDocument, ownershipDocument.name);
        logDebug('Added ownership document to form data', {
          name: ownershipDocument.name,
          size: ownershipDocument.size,
          type: ownershipDocument.type
        });
      }
      
      logDebug('Sending registration data to server');

      const response = await register(formDataToSend);
      logDebug('Registration successful', response);
      
      // Show success message
      setSuccess('Registration successful! Redirecting to login...');
      
      // Clear form data
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        role: 'tenant',
        idNumber: ''
      });
      setOwnershipDocument(null);
      setDocumentName('');
      
      // Redirect to login after a delay
      setTimeout(() => {
        logDebug('Redirecting to login page after registration');
        navigate('/login', { replace: true });
      }, 2000);
    } catch (err: any) {
      logDebug('Registration failed', err);
      // Display a more specific error message if available
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const redirectToWorkOS = (provider: string) => {
    logDebug(`Redirecting to WorkOS ${provider} registration`);
    // Append registration=true to indicate this is a registration flow
    window.location.href = `http://localhost:5000/auth/login?provider=${provider}&registration=true`;
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
            src="/registration.jpg.jpg"
            alt="Modern apartment building"
            className="w-full h-full object-cover"
          />
          {/* Brand overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/30 via-primary-600/20 to-primary-700/40"></div>
        </motion.div>
        
        {/* Brand overlay */}
        <div className="relative z-10 flex flex-col justify-end items-start h-full text-white px-16 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-left"
          >
            <div className="mb-6">
              <div className="h-20 w-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-4 border border-white/30">
                <div className="text-3xl font-bold text-white">R</div>
              </div>
              <h1 className="text-4xl font-bold mb-3 text-white">Join RentEase</h1>
              <p className="text-lg text-white/90 max-w-md leading-relaxed">
                Create an account to experience seamless property management
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
              {showEmailForm ? "Create your account" : "Get Started with RentEase"}
            </h2>
            <p className="text-text-600 dark:text-neutral-400 text-sm">
              {showEmailForm ? "Enter your details to register" : "Choose how you'd like to register"}
            </p>
          </div>

          {/* Registration Options */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-soft border border-accent-200 dark:border-neutral-700 p-4 sm:p-6">
            <AnimatePresence mode="wait">
              {!showEmailForm ? (
                <motion.div
                  key="provider-buttons"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3"
                >
                  {/* Register with Google */}
                  <button
                    onClick={() => redirectToWorkOS('google')}
                    className="w-full bg-white dark:bg-neutral-800 border border-accent-200 dark:border-neutral-700 rounded-xl py-3 px-4 flex items-center justify-center gap-2 hover:bg-accent-100 dark:hover:bg-neutral-700 transition-colors duration-200"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18.1711 8.36788H17.4998V8.33329H9.99984V11.6666H14.7094C14.0223 13.607 12.1761 14.9999 9.99984 14.9999C7.23859 14.9999 4.99984 12.7612 4.99984 9.99996C4.99984 7.23871 7.23859 4.99996 9.99984 4.99996C11.2744 4.99996 12.434 5.48079 13.3048 6.26621L15.7169 3.85413C14.1886 2.44538 12.1911 1.66663 9.99984 1.66663C5.39775 1.66663 1.6665 5.39788 1.6665 9.99996C1.6665 14.602 5.39775 18.3333 9.99984 18.3333C14.602 18.3333 18.3332 14.602 18.3332 9.99996C18.3332 9.44121 18.2757 8.89579 18.1711 8.36788Z" fill="#FFC107"/>
                      <path d="M2.62744 6.12121L5.36536 8.12913C6.10619 6.29496 7.90036 4.99996 9.99994 4.99996C11.2745 4.99996 12.4341 5.48079 13.3049 6.26621L15.7169 3.85413C14.1887 2.44538 12.1912 1.66663 9.99994 1.66663C6.79911 1.66663 4.02327 3.47371 2.62744 6.12121Z" fill="#FF3D00"/>
                      <path d="M9.9998 18.3334C12.1418 18.3334 14.0977 17.5875 15.6135 16.2292L12.9631 13.9834C12.1131 14.6142 11.0764 14.9999 9.9998 14.9999C7.83605 14.9999 5.99813 13.6209 5.30188 11.6959L2.52271 13.8542C3.90021 16.5359 6.70855 18.3334 9.9998 18.3334Z" fill="#4CAF50"/>
                      <path d="M18.1713 8.36788H17.5V8.33329H10V11.6666H14.7096C14.3809 12.5902 13.7889 13.3972 13.0004 13.9829L13.0021 13.9817L15.6525 16.2275C15.4771 16.3866 18.3333 14.1666 18.3333 9.99996C18.3333 9.44121 18.2758 8.89579 18.1713 8.36788Z" fill="#1976D2"/>
                    </svg>
                    <span className="text-text-800 dark:text-white font-medium">Continue with Google</span>
                  </button>

                  {/* Register with Apple */}
                  <button
                    onClick={() => redirectToWorkOS('apple')}
                    className="w-full bg-white dark:bg-neutral-800 border border-accent-200 dark:border-neutral-700 rounded-xl py-3 px-4 flex items-center justify-center gap-2 hover:bg-accent-100 dark:hover:bg-neutral-700 transition-colors duration-200"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14.0832 10.3333C14.0748 8.8975 14.7698 7.8775 16.1698 7.16083C15.3715 5.9575 14.1232 5.31083 12.4698 5.22083C10.9065 5.1325 9.2315 6.235 8.64817 6.235C8.03234 6.235 6.53651 5.27 5.33317 5.27C3.0415 5.30083 0.616504 7.0725 0.616504 10.67C0.616504 11.7825 0.845837 12.9358 1.30484 14.1283C1.9015 15.6625 3.87484 19.1717 5.9265 19.1108C6.99984 19.0808 7.74984 18.33 9.1415 18.33C10.4998 18.33 11.1998 19.1108 12.3848 19.1108C14.4582 19.0808 16.2398 15.895 16.8048 14.3592C14.2148 13.0983 14.0832 10.4117 14.0832 10.3333ZM11.7582 3.54083C12.8415 2.25333 12.7265 1.07417 12.6932 0.666664C11.7015 0.7175 10.5632 1.3225 9.9415 2.0475C9.25817 2.82583 8.9165 3.79333 8.9915 4.9525C10.0682 5.03417 10.9832 4.50667 11.7582 3.54083Z" fill="currentColor" className="text-text-900 dark:text-white"/>
                    </svg>
                    <span className="text-text-800 dark:text-white font-medium">Continue with Apple</span>
                  </button>

                  {/* Register with Email */}
                  <button
                    onClick={showEmailFormHandler}
                    className="w-full bg-white dark:bg-neutral-800 border border-accent-200 dark:border-neutral-700 rounded-xl py-3 px-4 flex items-center justify-center gap-2 hover:bg-accent-100 dark:hover:bg-neutral-700 transition-colors duration-200"
                  >
                    <EnvelopeIcon className="w-5 h-5 text-text-800 dark:text-white" />
                    <span className="text-text-800 dark:text-white font-medium">Continue with Email</span>
                  </button>

                  {/* Login Link */}
                  <div className="pt-4 text-center">
                    <p className="text-text-600 dark:text-neutral-400 text-sm">
                      Already have an account?{' '}
                      <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                        Sign in
                      </Link>
                    </p>
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
                    className="mb-4 flex items-center text-text-600 dark:text-neutral-400 hover:text-text-800 dark:hover:text-white transition-colors"
                  >
                    <ArrowLeftIcon className="w-4 h-4 mr-1" />
                    <span className="text-sm">Back to registration options</span>
                  </button>
                  
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
                    {/* Name Input */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-text-700 dark:text-neutral-300 mb-1">
                        Full Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        leftIcon={<UserIcon className="w-5 h-5 text-text-500" />}
                        required
                        autoFocus
                      />
                    </div>
                    
                    {/* Email Input */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-text-700 dark:text-neutral-300 mb-1">
                        Email Address
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        leftIcon={<EnvelopeIcon className="w-5 h-5 text-text-500" />}
                        required
                      />
                    </div>
                    
                    {/* Phone Input */}
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-text-700 dark:text-neutral-300 mb-1">
                        Phone Number
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                        leftIcon={<PhoneIcon className="w-5 h-5 text-text-500" />}
                        required
                      />
                    </div>

                    {/* Password Input */}
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-text-700 dark:text-neutral-300 mb-1">
                        Password
                      </label>
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a password"
                        leftIcon={<LockClosedIcon className="w-5 h-5 text-text-500" />}
                        rightIcon={
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="focus:outline-none"
                          >
                            {showPassword ? (
                              <EyeSlashIcon className="w-5 h-5 text-text-500 hover:text-text-700" />
                            ) : (
                              <EyeIcon className="w-5 h-5 text-text-500 hover:text-text-700" />
                            )}
                          </button>
                        }
                        required
                      />
                    </div>
                    
                    {/* Confirm Password Input */}
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-700 dark:text-neutral-300 mb-1">
                        Confirm Password
                      </label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        leftIcon={<LockClosedIcon className="w-5 h-5 text-text-500" />}
                        rightIcon={
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="focus:outline-none"
                          >
                            {showConfirmPassword ? (
                              <EyeSlashIcon className="w-5 h-5 text-text-500 hover:text-text-700" />
                            ) : (
                              <EyeIcon className="w-5 h-5 text-text-500 hover:text-text-700" />
                            )}
                          </button>
                        }
                        required
                      />
                    </div>
                    
                    {/* Role Selection */}
                    <div>
                      <label htmlFor="role" className="block text-sm font-medium text-text-700 dark:text-neutral-300 mb-1">
                        I am a:
                      </label>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, role: 'tenant' }))}
                          className={`flex-1 py-2 px-4 rounded-xl border ${
                            formData.role === 'tenant'
                              ? 'bg-primary-500 text-white border-primary-500'
                              : 'bg-white dark:bg-neutral-800 text-text-700 dark:text-white border-accent-200 dark:border-neutral-700'
                          } transition-colors duration-200`}
                        >
                          Tenant
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, role: 'landlord' }))}
                          className={`flex-1 py-2 px-4 rounded-xl border ${
                            formData.role === 'landlord'
                              ? 'bg-primary-500 text-white border-primary-500'
                              : 'bg-white dark:bg-neutral-800 text-text-700 dark:text-white border-accent-200 dark:border-neutral-700'
                          } transition-colors duration-200`}
                        >
                          Landlord
                        </button>
                      </div>
                    </div>
                    
                    {/* Role-specific fields */}
                    <AnimatePresence mode="wait">
                      {formData.role === 'tenant' ? (
                        <motion.div
                          key="tenant-fields"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="pt-2">
                            <label htmlFor="idNumber" className="block text-sm font-medium text-text-700 dark:text-neutral-300 mb-1">
                              National ID Number
                            </label>
                            <Input
                              id="idNumber"
                              name="idNumber"
                              type="text"
                              value={formData.idNumber}
                              onChange={handleChange}
                              placeholder="Enter your ID number"
                              leftIcon={<IdentificationIcon className="w-5 h-5 text-text-500" />}
                            />
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="landlord-fields"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="pt-2">
                            <label htmlFor="ownershipDocument" className="block text-sm font-medium text-text-700 dark:text-neutral-300 mb-1">
                              Property Ownership Document
                            </label>
                            
                            {!documentName ? (
                              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-accent-300 dark:border-neutral-700 border-dashed rounded-xl">
                                <div className="space-y-1 text-center">
                                  <DocumentIcon className="mx-auto h-12 w-12 text-text-400" />
                                  <div className="flex text-sm text-text-600 dark:text-neutral-400">
                                    <label
                                      htmlFor="ownershipDocument"
                                      className="relative cursor-pointer rounded-md font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 focus-within:outline-none"
                                    >
                                      <span>Upload a file</span>
                                      <input
                                        id="ownershipDocument"
                                        name="ownershipDocument"
                                        type="file"
                                        className="sr-only"
                                        onChange={handleDocumentChange}
                                      />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                  </div>
                                  <p className="text-xs text-text-500 dark:text-neutral-500">
                                    PDF, PNG, JPG, GIF up to 10MB
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="mt-1 flex items-center justify-between p-3 border border-accent-200 dark:border-neutral-700 rounded-xl">
                                <div className="flex items-center">
                                  <DocumentIcon className="h-6 w-6 text-text-500 mr-2" />
                                  <span className="text-sm text-text-700 dark:text-white truncate max-w-[200px]">
                                    {documentName}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={removeDocument}
                                  className="text-text-500 hover:text-red-500 transition-colors"
                                >
                                  <XMarkIcon className="h-5 w-5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {/* Register Button */}
                    <Button
                      type="submit"
                      className="w-full mt-2"
                      color="primary"
                      loading={loading}
                    >
                      Create Account
                    </Button>
                  </form>
                  
                  {/* Login Link */}
                  <div className="mt-4 text-center">
                    <p className="text-text-600 dark:text-neutral-400 text-sm">
                      Already have an account?{' '}
                      <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                        Sign in
                      </Link>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register; 