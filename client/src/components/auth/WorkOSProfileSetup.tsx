import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import AvatarUpload from '../ui/AvatarUpload';
import { 
  PhoneIcon, 
  UserIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ExclamationCircleIcon, 
  CheckCircleIcon,
  MoonIcon,
  SunIcon,
  IdentificationIcon,
  DocumentIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../utils/auth-context';

const WorkOSProfileSetup: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'tenant',
    theme_preference: 'light',
    idNumber: ''
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [ownershipDocument, setOwnershipDocument] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [usingCamera, setUsingCamera] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { checkAuth } = useAuth();
  
  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');
  const email = queryParams.get('email');
  
  useEffect(() => {
    if (!token) {
      setError('Missing authentication token. Please try logging in again.');
    } else {
      // Pre-fill name from email if available
      const nameFromEmail = email ? email.split('@')[0] : '';
      if (nameFromEmail) {
        setFormData(prev => ({
          ...prev,
          name: nameFromEmail
        }));
      }

      // Set initial preview to null to ensure proper initialization
      setAvatarPreview(null);
      
      // Try to get role from query params if available
      const roleParam = queryParams.get('role');
      if (roleParam && (roleParam === 'tenant' || roleParam === 'landlord')) {
        setFormData(prev => ({
          ...prev,
          role: roleParam
        }));
      }
      
      // Apply theme preference immediately on load
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = prefersDarkMode ? 'dark' : 'light';
      
      setFormData(prev => ({
        ...prev,
        theme_preference: initialTheme
      }));
      
      applyTheme(initialTheme);
    }
  }, [token, email]);
  
  // Apply theme changes to document
  const applyTheme = (theme: string) => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleThemeToggle = () => {
    const newTheme = formData.theme_preference === 'light' ? 'dark' : 'light';
    setFormData(prev => ({
      ...prev,
      theme_preference: newTheme
    }));
    
    // Apply theme change immediately
    applyTheme(newTheme);
  };
  
  const handleAvatarChange = (file: File | null) => {
    setAvatar(file);
    setUsingCamera(false);
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setAvatarPreview(null);
    }
  };
  
  const handleAvatarCapture = (imageSrc: string, imageFile: File) => {
    setAvatarPreview(imageSrc);
    setAvatar(imageFile);
    setUsingCamera(false);
  };
  
  const toggleCamera = () => {
    setUsingCamera(!usingCamera);
  };
  
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
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
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
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
    
    setLoading(true);
    setError(null);
    
    try {
      // Create form data for multipart/form-data
      const formDataToSend = new FormData();
      if (email) {
        formDataToSend.append('email', email);
      }
      formDataToSend.append('name', formData.name);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('role', formData.role);
      formDataToSend.append('theme_preference', formData.theme_preference);
      
      // Add role-specific fields
      if (formData.role === 'tenant') {
        formDataToSend.append('idNumber', formData.idNumber);
      } else if (formData.role === 'landlord' && ownershipDocument) {
        formDataToSend.append('ownershipDocument', ownershipDocument);
      }
      
      // Password is now required
      formDataToSend.append('password', formData.password);
      
      if (avatar) {
        formDataToSend.append('avatar', avatar);
      }
      
      // Send the data
      const response = await axios.post(
        'http://localhost:5000/auth/complete-profile', 
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
          withCredentials: true
        }
      );
      
      if (response.data.success) {
        setSuccess('Profile setup completed successfully!');
        
        // Store the token if provided
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        
        // Check auth status to update context
        await checkAuth();
        
        // Redirect to dashboard based on role after a short delay
        setTimeout(() => {
          let dashboardUrl = '/';
          
          if (formData.role === 'tenant') {
            dashboardUrl = '/tenant/dashboard';
          } else if (formData.role === 'landlord') {
            dashboardUrl = '/landlord/dashboard';
          } else if (formData.role === 'admin') {
            dashboardUrl = '/admin/dashboard';
          }
          
          console.log('Redirecting to:', dashboardUrl);
          navigate(dashboardUrl);
        }, 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete profile setup. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-accent-50 dark:bg-neutral-900 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
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
              Complete Your Profile
            </h2>
            <p className="text-text-600 dark:text-neutral-400">
              Set up your account preferences to get started
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
          
          <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
            {/* Avatar Upload */}
            <div className="flex justify-center mb-2">
              <AvatarUpload 
                initialImage={avatarPreview}
                onChange={handleAvatarChange}
                onCapture={handleAvatarCapture}
                allowCamera={true}
                className="w-24 h-24"
              />
            </div>
            
            {/* Name Field */}
            <div className="space-y-1">
              <label htmlFor="name" className="text-sm font-semibold text-text-700 dark:text-neutral-300">
                Full Name
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                leftIcon={<UserIcon className="h-4 w-4" />}
                className="w-full h-11"
                autoFocus
              />
            </div>
            
            {/* Phone Field */}
            <div className="space-y-1">
              <label htmlFor="phone" className="text-sm font-semibold text-text-700 dark:text-neutral-300">
                Phone Number
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                required
                leftIcon={<PhoneIcon className="h-4 w-4" />}
                className="w-full h-11"
              />
            </div>
            
            {/* Role Selection */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-text-700 dark:text-neutral-300">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'tenant' }))}
                  className={`flex items-center justify-center px-3 py-2.5 rounded-lg border ${
                    formData.role === 'tenant'
                      ? 'bg-primary-50 border-primary-500 text-primary-700 dark:bg-primary-900/30 dark:border-primary-400 dark:text-primary-300'
                      : 'bg-white border-accent-300 text-text-700 dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-300'
                  } transition-colors`}
                >
                  <span className="text-sm font-medium">Tenant</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'landlord' }))}
                  className={`flex items-center justify-center px-3 py-2.5 rounded-lg border ${
                    formData.role === 'landlord'
                      ? 'bg-primary-50 border-primary-500 text-primary-700 dark:bg-primary-900/30 dark:border-primary-400 dark:text-primary-300'
                      : 'bg-white border-accent-300 text-text-700 dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-300'
                  } transition-colors`}
                >
                  <span className="text-sm font-medium">Landlord</span>
                </button>
              </div>
            </div>
            
            {/* National ID Field - Show only for tenants */}
            {formData.role === 'tenant' && (
              <div className="space-y-1">
                <label htmlFor="idNumber" className="text-sm font-semibold text-text-700 dark:text-neutral-300">
                  National ID Number
                </label>
                <Input
                  id="idNumber"
                  name="idNumber"
                  type="text"
                  value={formData.idNumber}
                  onChange={handleChange}
                  placeholder="Enter your National ID number"
                  required
                  leftIcon={<IdentificationIcon className="h-4 w-4" />}
                  className="w-full h-11"
                />
              </div>
            )}
            
            {/* Ownership Document - Show only for landlords */}
            {formData.role === 'landlord' && (
              <div className="space-y-1">
                <label htmlFor="ownershipDocument" className="text-sm font-semibold text-text-700 dark:text-neutral-300">
                  Property Ownership Document
                </label>
                <div className="mt-1 flex items-center">
                  <label 
                    htmlFor="ownership-document-upload" 
                    className={`flex items-center justify-center w-full px-4 py-2 border ${
                      ownershipDocument 
                        ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:border-primary-400 dark:text-primary-300' 
                        : 'border-accent-300 dark:border-neutral-600 text-text-700 dark:text-neutral-300'
                    } rounded-lg cursor-pointer hover:bg-accent-50 dark:hover:bg-neutral-700`}
                  >
                    <DocumentIcon className="h-5 w-5 mr-2" />
                    <span className="text-sm">
                      {documentName || 'Upload ownership document'}
                    </span>
                    {ownershipDocument && (
                      <button 
                        type="button" 
                        onClick={(e) => {
                          e.preventDefault();
                          removeDocument();
                        }}
                        className="ml-auto p-1 text-text-500 hover:text-text-700 dark:text-neutral-400 dark:hover:text-white"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    )}
                  </label>
                  <input 
                    id="ownership-document-upload" 
                    name="ownershipDocument" 
                    type="file" 
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={handleDocumentChange}
                    required={formData.role === 'landlord'}
                  />
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Upload PDF, DOC, or image files (max 5MB)
                </p>
              </div>
            )}
            
            {/* Theme Preference */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-text-700 dark:text-neutral-300">
                Theme Preference
              </label>
              <div className="flex mt-1 space-x-3">
                <button
                  type="button"
                  onClick={handleThemeToggle}
                  className={`flex items-center justify-center w-full px-4 py-2.5 rounded-lg border ${
                    formData.theme_preference === 'light'
                      ? 'bg-primary-50 border-primary-500 text-primary-700 dark:bg-primary-900/30 dark:border-primary-400 dark:text-primary-300'
                      : 'border-accent-300 dark:border-neutral-600 text-text-700 dark:text-neutral-300'
                  } transition-colors`}
                >
                  <SunIcon className="h-4 w-4 mr-2" />
                  <span className="text-sm">Light</span>
                </button>
                <button
                  type="button"
                  onClick={handleThemeToggle}
                  className={`flex items-center justify-center w-full px-4 py-2.5 rounded-lg border ${
                    formData.theme_preference === 'dark'
                      ? 'bg-primary-50 border-primary-500 text-primary-700 dark:bg-primary-900/30 dark:border-primary-400 dark:text-primary-300'
                      : 'border-accent-300 dark:border-neutral-600 text-text-700 dark:text-neutral-300'
                  } transition-colors`}
                >
                  <MoonIcon className="h-4 w-4 mr-2" />
                  <span className="text-sm">Dark</span>
                </button>
              </div>
            </div>
            
            {/* Password Field (required) */}
            <div className="space-y-1">
              <label htmlFor="password" className="text-sm font-semibold text-text-700 dark:text-neutral-300">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  required
                  leftIcon={<LockClosedIcon className="h-4 w-4" />}
                  className="w-full h-11"
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
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Password must be at least 8 characters
              </p>
            </div>
            
            {/* Confirm Password Field */}
            <div className="space-y-1">
              <label htmlFor="confirmPassword" className="text-sm font-semibold text-text-700 dark:text-neutral-300">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
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
              className="w-full mt-6"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Complete Setup'}
            </Button>
          </form>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-text-500 dark:text-neutral-400">
            By completing your profile, you agree to our{' '}
            <a href="/terms" className="text-primary-500 dark:text-primary-400 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-primary-500 dark:text-primary-400 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default WorkOSProfileSetup; 