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
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../utils/auth-context';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import LoadingSpinner from '../ui/LoadingSpinner';

interface FormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  idNumber?: string;
  ownershipDocument?: File | null;
}

interface ValidationErrors {
  name?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  idNumber?: string;
  ownershipDocument?: string;
}

const EditProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    idNumber: '',
    ownershipDocument: null
  });
  
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  
  // Check if user has immutable fields set
  const [hasIdNumberSet, setHasIdNumberSet] = useState(false);
  const [hasOwnershipDocumentSet, setHasOwnershipDocumentSet] = useState(false);
  
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '',
        confirmPassword: '',
        idNumber: user.idNumber || '',
        ownershipDocument: user.ownershipDocument || null
      });
      
      // Set avatar preview if user has an avatar
      if (user.avatar) {
        setAvatarPreview(user.avatar);
      }
    }
  }, [user]);

  useEffect(() => {
    // Check if user has immutable credentials set
    const checkImmutableFields = async () => {
      try {
        if (user?.role === 'tenant') {
          const response = await api.get(`/api/users/${user.id}/tenant-details`);
          if (response.data.success && response.data.data?.id_number) {
            setHasIdNumberSet(true);
          }
        } else if (user?.role === 'landlord') {
          const response = await api.get(`/api/users/${user.id}/landlord-details`);
          if (response.data.success && response.data.data?.ownership_document_path) {
            setHasOwnershipDocumentSet(true);
          }
        }
      } catch (err) {
        console.error('Error checking immutable fields:', err);
      }
    };
    
    if (user?.id) {
      checkImmutableFields();
    }
  }, [user]);

  const validateField = (name: string, value: string | File | null | undefined): string | undefined => {
    // Handle undefined values
    if (name !== 'idNumber' && name !== 'ownershipDocument' && value === undefined) {
      return 'Field is required';
    }
    
    switch (name) {
      case 'name':
        if (!value || typeof value !== 'string' || !value.trim()) return 'Name is required';
        if (typeof value === 'string' && value.trim().length < 2) return 'Name must be at least 2 characters';
        break;
      
      case 'phone':
        if (value && typeof value === 'string' && !/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/\s/g, ''))) {
          return 'Please enter a valid phone number';
        }
        break;
      
      case 'password':
        if (value && typeof value === 'string' && value.length < 6) {
          return 'Password must be at least 6 characters';
        }
        break;
      
      case 'confirmPassword':
        if (typeof value === 'string' && formData.password && value !== formData.password) {
          return 'Passwords do not match';
        }
        break;
      
      case 'idNumber':
        if (value && typeof value === 'string' && !/^[A-Za-z0-9]{1,20}$/.test(value)) {
          return 'Invalid ID number format';
        }
        break;
      
      case 'ownershipDocument':
        if (value && !(value instanceof File)) {
          return 'Invalid ownership document format';
        }
        break;
    }
    return undefined;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error for this field
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }

    // Real-time validation
    const error = validateField(name, value);
    if (error) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const inputName = e.target.name;
      
      // Validate file type
      if (!file.type.startsWith('image/') && inputName === 'avatar') {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      if (inputName === 'avatar') {
        setAvatarFile(file);
        const preview = URL.createObjectURL(file);
        setAvatarPreview(preview);
      } else if (inputName === 'ownershipDocument') {
        setFormData(prev => ({
          ...prev,
          ownershipDocument: file
        }));
      }
      
      setError(null);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    Object.keys(formData).forEach(key => {
      const value = formData[key as keyof FormData];
      const error = validateField(key, value);
      if (error) {
        errors[key as keyof ValidationErrors] = error;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
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
      submitData.append('idNumber', formData.idNumber || '');
      
      if (formData.password) {
        submitData.append('password', formData.password);
      }
      
      // Add avatar if selected
      if (avatarFile) {
        submitData.append('avatar', avatarFile);
      }
      
      // Add ownership document if selected
      if (formData.ownershipDocument) {
        submitData.append('ownershipDocument', formData.ownershipDocument);
      }
      
      // Update user profile
      const response = await api.put(`/api/users/${user?.id}`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        setSuccess('Profile updated successfully');
        
        // Update local user data
        const updatedUser = {
          id: user!.id,
          name: formData.name,
          phone: formData.phone,
          avatar: response.data.data.avatar || user?.avatar,
          email: user!.email,
          role: user!.role,
          idNumber: formData.idNumber,
          ownershipDocument: formData.ownershipDocument
        };
        
        updateUser(updatedUser);
        
        // Clear form
        setFormData(prev => ({
          ...prev,
          password: '',
          confirmPassword: '',
          idNumber: '',
          ownershipDocument: null
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

  // Render ID number field for tenants
  const renderIdNumberField = () => {
    if (user?.role !== 'tenant') return null;
    
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          National ID Number
        </label>
        <input
          type="text"
          name="idNumber"
          value={formData.idNumber || ''}
          onChange={handleChange}
          disabled={hasIdNumberSet}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${
            hasIdNumberSet 
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : 'focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
          }`}
          placeholder={hasIdNumberSet ? "ID number cannot be changed" : "Enter your national ID number"}
        />
        {hasIdNumberSet && (
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
            ID number cannot be changed once set for security reasons
          </p>
        )}
      </div>
    );
  };
  
  // Render ownership document field for landlords
  const renderOwnershipDocumentField = () => {
    if (user?.role !== 'landlord') return null;
    
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Property Ownership Document
        </label>
        {hasOwnershipDocumentSet ? (
          <div className="flex items-center space-x-2">
            <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg text-gray-500 dark:text-gray-400 flex-1">
              Document already uploaded
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Cannot be changed
            </p>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <input
              type="file"
              name="ownershipDocument"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        )}
      </div>
    );
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4"
      >
        <Card className="max-w-md w-full text-center">
          <div className="p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mb-6"
            >
              <CheckCircleIcon className="w-8 h-8 text-success-600" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-neutral-900 mb-4"
            >
              Profile Updated!
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-neutral-600 mb-6"
            >
              Your profile has been updated successfully.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Button
                variant="default"
                onClick={() => navigate('/tenant/dashboard')}
                className="flex-1"
              >
                Back to Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => setSuccess(null)}
                className="flex-1"
              >
                Continue Editing
              </Button>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-8 px-4"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center mb-4">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex items-center"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
          
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Edit Profile</h1>
          <p className="text-lg text-neutral-600">
            Update your personal information and profile picture
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Avatar Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="h-fit">
              <div className="p-6 text-center">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Profile Picture</h3>
                
                <div className="relative inline-block mb-4">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-neutral-100 border-4 border-white shadow-lg">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UserIcon className="w-16 h-16 text-neutral-400" />
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={triggerFileInput}
                    className="absolute bottom-0 right-0 w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors shadow-lg"
                  >
                    <CameraIcon className="w-5 h-5" />
                  </button>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                <p className="text-sm text-neutral-500 mb-4">
                  Click the camera icon to upload a new profile picture
                </p>
                
                <div className="text-xs text-neutral-400">
                  <p>Supported formats: JPG, PNG</p>
                  <p>Maximum size: 5MB</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-6">Personal Information</h3>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg flex items-start"
                  >
                    <ExclamationTriangleIcon className="w-5 h-5 text-error-600 mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-error-700">{error}</p>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      <UserIcon className="w-4 h-4 inline mr-2" />
                      Full Name
                    </label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className={getFieldError('name') ? 'border-error-300' : ''}
                      required
                    />
                    {getFieldError('name') && (
                      <p className="mt-1 text-sm text-error-600">{getFieldError('name')}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      <EnvelopeIcon className="w-4 h-4 inline mr-2" />
                      Email Address
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="bg-neutral-50"
                    />
                    <p className="mt-1 text-sm text-neutral-500">
                      Email cannot be changed directly. Contact support for assistance.
                    </p>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      <PhoneIcon className="w-4 h-4 inline mr-2" />
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      className={getFieldError('phone') ? 'border-error-300' : ''}
                    />
                    {getFieldError('phone') && (
                      <p className="mt-1 text-sm text-error-600">{getFieldError('phone')}</p>
                    )}
                  </div>

                  {/* ID Number */}
                  {renderIdNumberField()}

                  {/* Password Section */}
                  <div className="border-t pt-6">
                    <h4 className="text-md font-medium text-neutral-900 mb-4">Change Password</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          <LockClosedIcon className="w-4 h-4 inline mr-2" />
                          New Password
                        </label>
                        <Input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Enter new password (leave blank to keep current)"
                          className={getFieldError('password') ? 'border-error-300' : ''}
                        />
                        {getFieldError('password') && (
                          <p className="mt-1 text-sm text-error-600">{getFieldError('password')}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          <LockClosedIcon className="w-4 h-4 inline mr-2" />
                          Confirm New Password
                        </label>
                        <Input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm new password"
                          className={getFieldError('confirmPassword') ? 'border-error-300' : ''}
                        />
                        {getFieldError('confirmPassword') && (
                          <p className="mt-1 text-sm text-error-600">{getFieldError('confirmPassword')}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ownership Document */}
                  {renderOwnershipDocumentField()}

                  {/* Submit Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      type="submit"
                      variant="default"
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Updating...
                        </>
                      ) : (
                        'Update Profile'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate(-1)}
                      disabled={loading}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default EditProfile; 