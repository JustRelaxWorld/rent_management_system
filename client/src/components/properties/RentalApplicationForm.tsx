import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BuildingOfficeIcon, 
  CalendarIcon, 
  CurrencyDollarIcon,
  UserIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../utils/auth-context';
import api from '../../utils/api';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import LoadingSpinner from '../ui/LoadingSpinner';

interface RentalApplicationFormProps {
  propertyId?: string;
  propertyTitle?: string;
}

interface FormData {
  move_in_date: string;
  monthly_income: string;
  employment_status: string;
  employer: string;
  additional_notes: string;
}

interface ValidationErrors {
  move_in_date?: string;
  monthly_income?: string;
  employment_status?: string;
  employer?: string;
}

const RentalApplicationForm: React.FC<RentalApplicationFormProps> = ({ 
  propertyId: propPropertyId,
  propertyTitle: propPropertyTitle
}) => {
  const { propertyId: urlPropertyId } = useParams<{ propertyId: string }>();
  const propertyId = propPropertyId || urlPropertyId;
  
  const [formData, setFormData] = useState<FormData>({
    move_in_date: '',
    monthly_income: '',
    employment_status: 'employed',
    employer: '',
    additional_notes: ''
  });
  
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [propertyTitle, setPropertyTitle] = useState(propPropertyTitle || '');
  const [propertyDetails, setPropertyDetails] = useState<any>(null);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch property details if not provided
  useEffect(() => {
    if (!propPropertyTitle && propertyId) {
      const fetchPropertyDetails = async () => {
        try {
          const response = await api.get(`/api/properties/${propertyId}`);
          setPropertyTitle(response.data.data.title);
          setPropertyDetails(response.data.data);
        } catch (err) {
          console.error('Error fetching property details:', err);
          setError('Could not load property details');
        }
      };
      fetchPropertyDetails();
    }
  }, [propertyId, propPropertyTitle]);

  // Real-time validation
  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'move_in_date':
        if (!value) return 'Move-in date is required';
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) return 'Move-in date cannot be in the past';
        break;
      
      case 'monthly_income':
        if (!value) return 'Monthly income is required';
        const income = parseFloat(value);
        if (isNaN(income) || income <= 0) return 'Please enter a valid monthly income';
        if (propertyDetails && income < propertyDetails.rent_amount * 2) {
          return 'Income should be at least 2x the monthly rent';
        }
        break;
      
      case 'employment_status':
        if (!value) return 'Employment status is required';
        break;
      
      case 'employer':
        if (formData.employment_status === 'employed' && !value) {
          return 'Employer name is required for employed status';
        }
        break;
    }
    return undefined;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof FormData]);
      if (error) {
        errors[key as keyof ValidationErrors] = error;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!propertyId) {
      setError('Property ID is missing');
      return;
    }

    if (!validateForm()) {
      setError('Please fix the validation errors below');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await api.post('/api/applications', {
        property_id: propertyId,
        ...formData
      });
      
      setSuccess(true);
      setLoading(false);
      
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/tenant/applications');
      }, 3000);
      
    } catch (err: any) {
      setLoading(false);
      
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Failed to submit application');
      } else {
        setError('Network error. Please try again later.');
      }
    }
  };

  const getFieldError = (fieldName: string) => {
    return validationErrors[fieldName as keyof ValidationErrors];
  };

  const isFieldValid = (fieldName: string) => {
    return !validationErrors[fieldName as keyof ValidationErrors];
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
              Application Submitted!
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-neutral-600 mb-6"
            >
              Your rental application has been submitted successfully. 
              The landlord will review your application and contact you soon.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Button
                variant="default"
                onClick={() => navigate('/tenant/applications')}
                className="flex-1"
              >
                View My Applications
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/tenant/properties')}
                className="flex-1"
              >
                Browse More Properties
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
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Rental Application
          </h1>
          {propertyTitle && (
            <p className="text-lg text-neutral-600">
              for <span className="font-semibold text-primary-600">{propertyTitle}</span>
            </p>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Property Details Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="h-fit">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <BuildingOfficeIcon className="w-6 h-6 text-primary-600 mr-3" />
                  <h3 className="text-lg font-semibold text-neutral-900">Property Details</h3>
                </div>
                
                {propertyDetails ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-neutral-500">Monthly Rent</p>
                      <p className="text-lg font-semibold text-neutral-900">
                        ${propertyDetails.rent_amount?.toLocaleString()}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-neutral-500">Property Type</p>
                      <p className="text-neutral-900 capitalize">{propertyDetails.type}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-neutral-500">Location</p>
                      <p className="text-neutral-900">{propertyDetails.address}, {propertyDetails.city}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-neutral-500">Bedrooms</p>
                        <p className="text-neutral-900">{propertyDetails.bedrooms}</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-500">Bathrooms</p>
                        <p className="text-neutral-900">{propertyDetails.bathrooms}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="animate-pulse">
                    <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                    <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                    <div className="h-4 bg-neutral-200 rounded"></div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Application Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card>
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <DocumentTextIcon className="w-6 h-6 text-primary-600 mr-3" />
                  <h3 className="text-lg font-semibold text-neutral-900">Application Form</h3>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg flex items-start"
                  >
                    <ExclamationCircleIcon className="w-5 h-5 text-error-600 mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-error-700">{error}</p>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Move-in Date */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      <CalendarIcon className="w-4 h-4 inline mr-2" />
                      Desired Move-in Date
                    </label>
                    <Input
                      type="date"
                      name="move_in_date"
                      value={formData.move_in_date}
                      onChange={handleChange}
                      className={getFieldError('move_in_date') ? 'border-error-300' : ''}
                      required
                    />
                    {getFieldError('move_in_date') && (
                      <p className="mt-1 text-sm text-error-600">{getFieldError('move_in_date')}</p>
                    )}
                  </div>

                  {/* Monthly Income */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      <CurrencyDollarIcon className="w-4 h-4 inline mr-2" />
                      Monthly Income (Ksh)
                    </label>
                    <Input
                      type="number"
                      name="monthly_income"
                      value={formData.monthly_income}
                      onChange={handleChange}
                      placeholder="Enter your monthly income in Ksh"
                      className={getFieldError('monthly_income') ? 'border-error-300' : ''}
                      required
                    />
                    {getFieldError('monthly_income') && (
                      <p className="mt-1 text-sm text-error-600">{getFieldError('monthly_income')}</p>
                    )}
                    <p className="mt-1 text-sm text-neutral-500">
                      This helps verify you can afford the rent
                    </p>
                  </div>

                  {/* Employment Status */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      <BriefcaseIcon className="w-4 h-4 inline mr-2" />
                      Employment Status
                    </label>
                    <select
                      name="employment_status"
                      value={formData.employment_status}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                        getFieldError('employment_status') ? 'border-error-300' : 'border-neutral-300'
                      }`}
                      required
                    >
                      <option value="employed">Employed</option>
                      <option value="self-employed">Self-Employed</option>
                      <option value="unemployed">Unemployed</option>
                      <option value="retired">Retired</option>
                      <option value="student">Student</option>
                    </select>
                    {getFieldError('employment_status') && (
                      <p className="mt-1 text-sm text-error-600">{getFieldError('employment_status')}</p>
                    )}
                  </div>

                  {/* Employer */}
                  {formData.employment_status === 'employed' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        <UserIcon className="w-4 h-4 inline mr-2" />
                        Employer
                      </label>
                      <Input
                        type="text"
                        name="employer"
                        value={formData.employer}
                        onChange={handleChange}
                        placeholder="Enter your employer name"
                        className={getFieldError('employer') ? 'border-error-300' : ''}
                        required
                      />
                      {getFieldError('employer') && (
                        <p className="mt-1 text-sm text-error-600">{getFieldError('employer')}</p>
                      )}
                    </motion.div>
                  )}

                  {/* Additional Notes */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      name="additional_notes"
                      value={formData.additional_notes}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Any additional information you'd like to share with the landlord"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
                    />
                  </div>

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
                          Submitting...
                        </>
                      ) : (
                        'Submit Application'
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

export default RentalApplicationForm; 