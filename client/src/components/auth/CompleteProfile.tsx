import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { 
  PhoneIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  UserIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  MoonIcon,
  SunIcon,
  CameraIcon,
  ArrowPathIcon,
  HomeIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../utils/auth-context';
import AvatarUpload from '../ui/AvatarUpload';

const CompleteProfile: React.FC = () => {
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'tenant', // Default to tenant
    idNumber: '', // For tenants
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usingCamera, setUsingCamera] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [ownershipDocument, setOwnershipDocument] = useState<File | null>(null);
  const [ownershipDocumentName, setOwnershipDocumentName] = useState<string>('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, checkAuth, updateThemePreference, setUser } = useAuth();
  
  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const urlToken = queryParams.get('token');
  
  useEffect(() => {
    console.log('CompleteProfile mounted, token present:', !!urlToken);
    
    if (!urlToken) {
      setError('Missing authentication token. Please try logging in again.');
      return;
    }
    
    // Check if token contains SSO info to determine if password is required
    try {
      // This is a simplified check - in real implementation, properly decode and verify the token
      const tokenData = JSON.parse(atob(urlToken.split('.')[1] || '{}'));
      console.log('Decoded token data:', tokenData);
      
      const authProvider = tokenData.authProvider || tokenData.auth_provider;
      console.log('Auth provider from token:', authProvider);
      
      setPasswordRequired(authProvider === 'email' || !authProvider);
      
      // Set theme based on user preference or system preference
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = prefersDarkMode ? 'dark' : 'light';
      setTheme(initialTheme);
      
      // Apply theme to document
      document.documentElement.classList.toggle('dark', initialTheme === 'dark');
    } catch (err) {
      console.error('Error parsing token:', err);
      // Default to requiring password if we can't parse the token
      setPasswordRequired(true);
      
      // Use system preference for theme
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDarkMode ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', prefersDarkMode);
    }
  }, [urlToken]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'avatar' | 'document') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (fileType === 'avatar') {
        setAvatar(file);
        setAvatarPreview(URL.createObjectURL(file));
      } else if (fileType === 'document') {
        setOwnershipDocument(file);
        setOwnershipDocumentName(file.name);
      }
    }
  };
  
  const handleCameraCapture = (dataUrl: string) => {
    // Convert data URL to a file object
    const blobBin = atob(dataUrl.split(',')[1]);
    const array = [];
    for(let i = 0; i < blobBin.length; i++) {
      array.push(blobBin.charCodeAt(i));
    }
    const file = new File([new Uint8Array(array)], 'camera-capture.jpg', {type: 'image/jpeg'});
    
    setAvatar(file);
    setAvatarPreview(dataUrl);
    setUsingCamera(false);
  };
  
  const toggleCamera = () => {
    setUsingCamera(!usingCamera);
  };
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };
  
  const validateForm = () => {
    // Clear previous errors
    setError(null);
    
    // Validate phone number
    if (!formData.phone) {
      setError('Phone number is required');
      return false;
    }
    
    // Validate password if required
    if (passwordRequired) {
      if (!formData.password) {
        setError('Password is required');
        return false;
      }
      
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }
    
    // Validate role-specific fields
    if (formData.role === 'tenant') {
      if (!formData.idNumber) {
        setError('National ID number is required for tenants');
        return false;
      }
    } else if (formData.role === 'landlord') {
      if (!ownershipDocument) {
        setError('Property ownership document is required for landlords');
        return false;
      }
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Create FormData object to handle multipart/form-data
      const formDataToSend = new FormData();
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('theme_preference', theme);
      formDataToSend.append('role', formData.role);
      
      // Add role-specific fields
      if (formData.role === 'tenant') {
        formDataToSend.append('idNumber', formData.idNumber);
      } else if (formData.role === 'landlord' && ownershipDocument) {
        formDataToSend.append('ownershipDocument', ownershipDocument);
      }
      
      // Add password if required
      if (passwordRequired && formData.password) {
        formDataToSend.append('password', formData.password);
      }
      
      // Add avatar if available
      if (avatar) {
        formDataToSend.append('avatar', avatar);
      }
      
      // Get the token from URL query parameters if not already in state
      if (!token) {
        const queryParams = new URLSearchParams(location.search);
        const urlToken = queryParams.get('token');
        
        if (urlToken) {
          // Save token to localStorage and state
          localStorage.setItem('token', urlToken);
          setToken(urlToken);
        } else {
          throw new Error('No authentication token found');
        }
      }
      
      // Use the token from state or localStorage
      const authToken = token || localStorage.getItem('token');
      
      if (!authToken) {
        throw new Error('Authentication required');
      }
      
      // Send the complete profile request
      const response = await axios.post(
        'http://localhost:5000/auth/complete-profile',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
      
      if (response.data.success) {
        setSuccess('Profile completed successfully!');
        
        // Store the user data
        const userData = response.data.data;
        
        if (userData) {
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Mark profile as completed to prevent future redirects to this page
          if (userData.id) {
            localStorage.setItem(`profile_completed_${userData.id}`, 'true');
          }
          
          // Update the user context
          setUser(userData);
        }
        
        // Apply theme preference
        document.documentElement.classList.toggle('dark', theme === 'dark');
        
        // Redirect to appropriate dashboard after a delay
        setTimeout(() => {
          try {
            if (userData?.role === 'tenant') {
              navigate('/tenant/dashboard', { replace: true });
            } else if (userData?.role === 'landlord') {
              navigate('/landlord/dashboard', { replace: true });
            } else if (userData?.role === 'admin') {
              navigate('/admin/dashboard', { replace: true });
            } else {
              // Default fallback
              navigate('/', { replace: true });
            }
          } catch (err) {
            // If can't determine role, redirect to login
            navigate('/login', { replace: true });
          }
        }, 1500);
      } else {
        setError('Failed to complete profile. Please try again.');
      }
    } catch (err: any) {
      console.error('Profile completion error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to complete profile setup. Please try again.');
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
              Complete your profile
            </h2>
            <p className="text-text-600 dark:text-neutral-400">
              Just a few more details to get started
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
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center justify-center mb-2">
              <label className="block text-sm font-medium text-text-700 dark:text-neutral-300 mb-3 text-center">
                Profile Picture
              </label>
              
              {usingCamera ? (
                <div className="w-full mb-4">
                  <AvatarUpload 
                    onCapture={handleCameraCapture}
                    onCancel={() => setUsingCamera(false)}
                  />
                </div>
              ) : (
                <>
                  <div className="relative w-24 h-24 mb-4">
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt="Avatar preview" 
                        className="w-24 h-24 rounded-full object-cover border-2 border-primary-500"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-accent-200 dark:bg-neutral-700 flex items-center justify-center border border-accent-300 dark:border-neutral-600">
                        <UserIcon className="w-12 h-12 text-accent-500 dark:text-neutral-500" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 mb-2">
                    <label className="cursor-pointer flex items-center justify-center gap-2 px-3 py-1.5 bg-accent-100 dark:bg-neutral-700 border border-accent-200 dark:border-neutral-600 rounded-lg text-sm font-medium text-text-700 dark:text-neutral-300 hover:bg-accent-200 dark:hover:bg-neutral-600 transition-colors">
                      Choose File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'avatar')}
                        className="hidden"
                      />
                    </label>
                    
                    <button
                      type="button"
                      onClick={toggleCamera}
                      className="flex items-center justify-center gap-2 px-3 py-1.5 bg-accent-100 dark:bg-neutral-700 border border-accent-200 dark:border-neutral-600 rounded-lg text-sm font-medium text-text-700 dark:text-neutral-300 hover:bg-accent-200 dark:hover:bg-neutral-600 transition-colors"
                    >
                      <CameraIcon className="w-4 h-4" />
                      Take Photo
                    </button>
                  </div>
                </>
              )}
            </div>
            
            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-text-700 dark:text-neutral-300 mb-2">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'tenant' }))}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                    formData.role === 'tenant' 
                      ? 'bg-primary-50 border-primary-500 dark:bg-primary-900/20 dark:border-primary-500' 
                      : 'bg-accent-100 border-accent-200 dark:bg-neutral-700 dark:border-neutral-600'
                  }`}
                >
                  <UserGroupIcon className={`w-6 h-6 mb-2 ${
                    formData.role === 'tenant' 
                      ? 'text-primary-500' 
                      : 'text-text-500 dark:text-neutral-400'
                  }`} />
                  <span className={`text-sm font-medium ${
                    formData.role === 'tenant' 
                      ? 'text-primary-700 dark:text-primary-400' 
                      : 'text-text-700 dark:text-neutral-300'
                  }`}>
                    Tenant
                  </span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'landlord' }))}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                    formData.role === 'landlord' 
                      ? 'bg-primary-50 border-primary-500 dark:bg-primary-900/20 dark:border-primary-500' 
                      : 'bg-accent-100 border-accent-200 dark:bg-neutral-700 dark:border-neutral-600'
                  }`}
                >
                  <HomeIcon className={`w-6 h-6 mb-2 ${
                    formData.role === 'landlord' 
                      ? 'text-primary-500' 
                      : 'text-text-500 dark:text-neutral-400'
                  }`} />
                  <span className={`text-sm font-medium ${
                    formData.role === 'landlord' 
                      ? 'text-primary-700 dark:text-primary-400' 
                      : 'text-text-700 dark:text-neutral-300'
                  }`}>
                    Landlord
                  </span>
                </button>
              </div>
            </div>
            
            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-text-700 dark:text-neutral-300 mb-1">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-accent-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-text-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500 transition-colors"
                placeholder="Enter your phone number"
              />
            </div>
            
            {/* Conditional Fields Based on Role */}
            {formData.role === 'tenant' && (
              <div>
                <label htmlFor="idNumber" className="block text-sm font-medium text-text-700 dark:text-neutral-300 mb-1">
                  National ID Number
                </label>
                <input
                  id="idNumber"
                  name="idNumber"
                  type="text"
                  value={formData.idNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-accent-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-text-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500 transition-colors"
                  placeholder="Enter your National ID number"
                />
              </div>
            )}
            
            {formData.role === 'landlord' && (
              <div>
                <label className="block text-sm font-medium text-text-700 dark:text-neutral-300 mb-1">
                  Property Ownership Document
                </label>
                <div className="flex items-center">
                  <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-4 py-2 bg-accent-100 dark:bg-neutral-700 border border-accent-200 dark:border-neutral-600 rounded-l-xl text-sm font-medium text-text-700 dark:text-neutral-300 hover:bg-accent-200 dark:hover:bg-neutral-600 transition-colors">
                    {ownershipDocument ? 'Change File' : 'Upload Document'}
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => handleFileChange(e, 'document')}
                      className="hidden"
                    />
                  </label>
                  <div className="flex-1 px-4 py-2 bg-white dark:bg-neutral-800 border border-accent-300 dark:border-neutral-700 border-l-0 rounded-r-xl text-sm text-text-700 dark:text-neutral-300 truncate">
                    {ownershipDocumentName || 'No file selected'}
                  </div>
                </div>
                <p className="mt-1 text-xs text-text-500 dark:text-neutral-400">
                  Upload a document proving property ownership (PDF, image, or document)
                </p>
              </div>
            )}
            
            {/* Theme Preference */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-text-700 dark:text-neutral-300 mb-2">
                Theme Preference
              </label>
              <div className="flex justify-between p-3 bg-accent-100 dark:bg-neutral-700 rounded-xl">
                <span className="text-sm font-medium text-text-700 dark:text-neutral-300">
                  {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </span>
                <button 
                  type="button"
                  onClick={toggleTheme}
                  className="flex items-center justify-center w-10 h-6 bg-white dark:bg-neutral-800 rounded-full p-1 transition-colors"
                >
                  <div className={`
                    w-4 h-4 rounded-full transition-transform duration-200 flex items-center justify-center
                    ${theme === 'dark' ? 'translate-x-4 bg-primary-500' : 'translate-x-0 bg-accent-400'}
                  `}>
                    {theme === 'dark' ? 
                      <MoonIcon className="w-3 h-3 text-white" /> : 
                      <SunIcon className="w-3 h-3 text-white" />
                    }
                  </div>
                </button>
              </div>
            </div>
            
            {/* Password Fields (if required) */}
            {passwordRequired && (
              <>
                <div className="relative">
                  <label htmlFor="password" className="block text-sm font-medium text-text-700 dark:text-neutral-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-2 pr-10 rounded-xl border border-accent-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-text-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500 transition-colors"
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-text-500 dark:text-neutral-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-text-500 dark:text-neutral-400" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="relative">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-700 dark:text-neutral-300 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-2 pr-10 rounded-xl border border-accent-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-text-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500 transition-colors"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-text-500 dark:text-neutral-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-text-500 dark:text-neutral-400" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl text-white font-medium transition-colors ${
                loading
                  ? 'bg-primary-400 cursor-not-allowed'
                  : 'bg-primary-500 hover:bg-primary-600'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                  Setting up your profile...
                </div>
              ) : (
                'Complete Profile'
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CompleteProfile;
