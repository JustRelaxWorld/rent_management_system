import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  LockClosedIcon,
  CameraIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../utils/auth-context';
import { Card } from '../ui/Card';
import LoadingSpinner from '../ui/LoadingSpinner';

interface FormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  idNumber: string;
}

interface ValidationErrors {
  name?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  idNumber?: string;
}

const TenantProfileEdit: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    idNumber: ''
  });
  
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [tenantDetails, setTenantDetails] = useState<any>(null);
  const [loadingTenantDetails, setLoadingTenantDetails] = useState(true);
  
  // Fetch user and tenant details
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user) {
          setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            password: '',
            confirmPassword: '',
            idNumber: ''
          });
          
          // Set avatar preview if user has an avatar
          if (user.avatar) {
            // Fix for image rendering by using proper URL format with API base URL
            const avatarPath = user.avatar.startsWith('http') 
              ? user.avatar 
              : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/${user.avatar}`;
            setAvatarPreview(avatarPath);
          }
          
          // Fetch tenant details
          const response = await api.get(`/api/tenants/${user.id}`);
          if (response.data.success) {
            setTenantDetails(response.data.data);
            setFormData(prev => ({
              ...prev,
              idNumber: response.data.data.id_number || ''
            }));
          }
        }
      } catch (err) {
        console.error('Error fetching tenant details:', err);
      } finally {
        setLoadingTenantDetails(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        break;
      
      case 'phone':
        // Updated phone validation to accept Kenyan format (07XXXXXXXX)
        if (value && !/^(07\d{8})$/.test(value.replace(/\s/g, ''))) {
          return 'Please enter a valid Kenyan phone number (e.g. 0712345678)';
        }
        break;
      
      case 'password':
        if (value && value.length < 6) {
          return 'Password must be at least 6 characters';
        }
        break;
      
      case 'confirmPassword':
        if (formData.password && value !== formData.password) {
          return 'Passwords do not match';
        }
        break;
        
      case 'idNumber':
        if (!value.trim()) return 'National ID number is required';
        break;
    }
    return undefined;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validate field on change
    const error = validateField(name, value);
    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };
  
  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    let isValid = true;
    
    // Validate name
    const nameError = validateField('name', formData.name);
    if (nameError) {
      errors.name = nameError;
      isValid = false;
    }
    
    // Validate phone
    const phoneError = validateField('phone', formData.phone);
    if (phoneError) {
      errors.phone = phoneError;
      isValid = false;
    }
    
    // Validate password and confirmPassword if password is provided
    if (formData.password) {
      const passwordError = validateField('password', formData.password);
      if (passwordError) {
        errors.password = passwordError;
        isValid = false;
      }
      
      const confirmPasswordError = validateField('confirmPassword', formData.confirmPassword);
      if (confirmPasswordError) {
        errors.confirmPassword = confirmPasswordError;
        isValid = false;
      }
    }
    
    // Validate ID number
    const idNumberError = validateField('idNumber', formData.idNumber);
    if (idNumberError) {
      errors.idNumber = idNumberError;
      isValid = false;
    }
    
    setValidationErrors(errors);
    return isValid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (!validateForm()) {
        setError('Please fix the validation errors below');
        setLoading(false);
        return;
      }
      
      // Create FormData for multipart/form-data submission
      const submitData = new FormData();
      
      // Add form fields
      submitData.append('name', formData.name);
      submitData.append('phone', formData.phone);
      submitData.append('idNumber', formData.idNumber);
      
      if (formData.password) {
        submitData.append('password', formData.password);
      }
      
      // Add avatar if selected
      if (avatarFile) {
        submitData.append('avatar', avatarFile);
      }
      
      // Update user profile
      const response = await api.put(`/api/users/${user?.id}`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        // Update tenant details
        const tenantResponse = await api.put(`/api/tenants/${user?.id}`, {
          id_number: formData.idNumber
        });
        
        setSuccess('Profile updated successfully');
        
        // Update local user data
        const updatedUser = {
          id: user!.id,
          name: formData.name,
          phone: formData.phone,
          avatar: response.data.data.avatar || user?.avatar,
          email: user!.email,
          role: user!.role
        };
        
        updateUser(updatedUser);
        
        // Clear form
        setFormData(prev => ({
          ...prev,
          password: '',
          confirmPassword: ''
        }));
        
        setAvatarFile(null);
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const getFieldError = (fieldName: string) => {
    return validationErrors[fieldName as keyof ValidationErrors];
  };
  
  if (loadingTenantDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  // Show success message
  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-lg mx-auto py-8 px-4"
      >
        <Card className="overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-neutral-900 dark:text-white">Profile Updated!</h2>
              <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                Your profile information has been successfully updated.
              </p>
              
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate('/tenant/dashboard')}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Back to Dashboard
                </button>
                <button
                  onClick={() => setSuccess(null)}
                  className="px-4 py-2 border border-primary-500 text-primary-500 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                >
                  Continue Editing
                </button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }
  
  return (
    <div className="max-w-lg mx-auto py-8 px-4">
      <Card className="overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Edit Profile</h1>
            <button
              onClick={() => navigate('/tenant/dashboard')}
              className="p-2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mr-3 flex-shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center">
              <div
                className="relative h-24 w-24 rounded-full overflow-hidden cursor-pointer border-2 border-primary-500 group"
                onClick={handleAvatarClick}
              >
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Avatar" 
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      // Fallback if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.onerror = null; 
                      // Replace with default icon
                      target.style.display = 'none';
                      const parent = target.parentNode as HTMLElement;
                      if (parent) {
                        const fallback = document.createElement('div');
                        fallback.className = "h-full w-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center";
                        fallback.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-12 w-12 text-primary-500 dark:text-primary-400"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>';
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                ) : (
                  <div className="h-full w-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                    <UserIcon className="h-12 w-12 text-primary-500 dark:text-primary-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <CameraIcon className="h-8 w-8 text-white" />
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
              />
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                Click to change profile picture
              </p>
            </div>
            
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    getFieldError('name') 
                      ? 'border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500' 
                      : 'border-neutral-300 dark:border-neutral-700 focus:ring-primary-500 focus:border-primary-500'
                  } rounded-md shadow-sm placeholder-neutral-400 dark:placeholder-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white`}
                  placeholder="Enter your full name"
                />
              </div>
              {getFieldError('name') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{getFieldError('name')}</p>
              )}
            </div>
            
            {/* Email (disabled) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="block w-full pl-10 pr-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white cursor-not-allowed"
                />
              </div>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Email cannot be changed
              </p>
            </div>
            
            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PhoneIcon className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    getFieldError('phone') 
                      ? 'border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500' 
                      : 'border-neutral-300 dark:border-neutral-700 focus:ring-primary-500 focus:border-primary-500'
                  } rounded-md shadow-sm placeholder-neutral-400 dark:placeholder-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white`}
                  placeholder="Enter phone number (e.g. 0712345678)"
                />
              </div>
              {getFieldError('phone') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{getFieldError('phone')}</p>
              )}
            </div>
            
            {/* ID Number */}
            <div>
              <label htmlFor="idNumber" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                National ID Number
                {tenantDetails?.id_number && (
                  <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                    (Cannot be changed once saved)
                  </span>
                )}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IdentificationIcon className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
                </div>
                <input
                  id="idNumber"
                  name="idNumber"
                  type="text"
                  value={formData.idNumber}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    getFieldError('idNumber') 
                      ? 'border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500' 
                      : tenantDetails?.id_number 
                        ? 'border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 text-neutral-500 cursor-not-allowed' 
                        : 'border-neutral-300 dark:border-neutral-700 focus:ring-primary-500 focus:border-primary-500'
                  } rounded-md shadow-sm placeholder-neutral-400 dark:placeholder-neutral-600 ${!tenantDetails?.id_number ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white' : ''}`}
                  placeholder="Enter your ID number (e.g. 12345678)"
                  readOnly={!!tenantDetails?.id_number}
                  title={tenantDetails?.id_number ? "National ID cannot be changed once set" : ""}
                />
              </div>
              {getFieldError('idNumber') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{getFieldError('idNumber')}</p>
              )}
              {tenantDetails?.id_number && (
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  National ID is already saved and cannot be modified for security reasons.
                </p>
              )}
            </div>
            
            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                New Password (optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    getFieldError('password') 
                      ? 'border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500' 
                      : 'border-neutral-300 dark:border-neutral-700 focus:ring-primary-500 focus:border-primary-500'
                  } rounded-md shadow-sm placeholder-neutral-400 dark:placeholder-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white`}
                  placeholder="Leave blank to keep current password"
                />
              </div>
              {getFieldError('password') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{getFieldError('password')}</p>
              )}
            </div>
            
            {/* Confirm Password */}
            {formData.password && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      getFieldError('confirmPassword') 
                        ? 'border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500' 
                        : 'border-neutral-300 dark:border-neutral-700 focus:ring-primary-500 focus:border-primary-500'
                    } rounded-md shadow-sm placeholder-neutral-400 dark:placeholder-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white`}
                    placeholder="Confirm your new password"
                  />
                </div>
                {getFieldError('confirmPassword') && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{getFieldError('confirmPassword')}</p>
                )}
              </div>
            )}
            
            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  loading
                    ? 'bg-primary-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                }`}
              >
                {loading ? (
                  <LoadingSpinner size="sm" className="text-white" />
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default TenantProfileEdit; 