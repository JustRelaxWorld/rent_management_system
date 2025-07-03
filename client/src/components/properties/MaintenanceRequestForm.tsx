import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  XMarkIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ArrowLeftIcon,
  ClockIcon,
  XCircleIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../utils/auth-context';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';
import { Input } from '../ui/Input';
import LoadingSpinner from '../ui/LoadingSpinner';

interface Property {
  id: number;
  title: string;
}

interface MaintenanceRequest {
  id: number;
  title: string;
  property_id: number;
  property_name: string;
  type: string;
  priority: string;
  status: string;
  request_date: string;
  updated_at: string;
  description: string;
  comments?: Comment[];
  images?: string[];
}

interface Comment {
  id: number;
  user_name: string;
  created_at: string;
  content: string;
}

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
}

const MaintenanceRequestForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingRequest, setExistingRequest] = useState<MaintenanceRequest | null>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [dragActive, setDragActive] = useState(false);
  
  const [formValues, setFormValues] = useState({
    propertyId: '',
    title: '',
    type: 'plumbing',
    priority: 'medium',
    description: ''
  });

  useEffect(() => {
    // Fetch properties for dropdown
    const fetchUserProperties = async () => {
      if (!user) return;
      
      try {
        setLoadingProperties(true);
        const response = await api.get('/api/properties/user');
        setProperties(response.data.data || []);
        setLoadingProperties(false);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setLoadingProperties(false);
        setError('Failed to load your properties.');
      }
    };

    // Check if viewing an existing request
    const fetchExistingRequest = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await api.get(`/api/maintenance/${id}`);
        const requestData = response.data.data;
        
        if (requestData) {
          setExistingRequest(requestData);
          // Populate form with existing data
          setFormValues({
            propertyId: requestData.property_id.toString(),
            title: requestData.title,
            type: requestData.type,
            priority: requestData.priority,
            description: requestData.description
          });
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching maintenance request:', err);
        setError('Failed to load maintenance request details.');
        setLoading(false);
      }
    };

    fetchUserProperties();
    if (id) {
      fetchExistingRequest();
    } else {
      setLoading(false);
    }
  }, [user, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    const newImages: UploadedImage[] = [];
    
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const imageId = Math.random().toString(36).substr(2, 9);
        const preview = URL.createObjectURL(file);
        
        newImages.push({
          id: imageId,
          file,
          preview
        });
      }
    });

    setUploadedImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (imageId: string) => {
    setUploadedImages(prev => {
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter(img => img.id !== imageId);
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoadingSubmit(true);
      
      // Use FormData to handle both text and file uploads
      const formData = new FormData();
      formData.append('propertyId', formValues.propertyId);
      formData.append('title', formValues.title);
      formData.append('type', formValues.type);
      formData.append('priority', formValues.priority);
      formData.append('description', formValues.description);
      
      // Append images if any
      uploadedImages.forEach(image => {
        formData.append('images', image.file);
      });
      
      let response;
      const headers = { 'Content-Type': 'multipart/form-data' };
      
      if (id) {
        // Update existing request
        response = await api.put(`/api/maintenance/${id}`, formData, { headers });
      } else {
        // Create new request
        response = await api.post('/api/maintenance', formData, { headers });
      }
      
      setLoadingSubmit(false);
      navigate('/tenant/maintenance');
      
    } catch (err) {
      console.error('Error submitting maintenance request:', err);
      setLoadingSubmit(false);
      setError('Failed to submit maintenance request. Please try again later.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-1.5 rounded-md text-sm font-medium bg-amber-100 text-amber-800 border border-amber-200">
            <ClockIcon className="h-4 w-4 mr-1.5" />
            Pending
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center px-2.5 py-1.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
            <ArrowPathIcon className="h-4 w-4 mr-1.5" />
            In Progress
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-1.5 rounded-md text-sm font-medium bg-green-100 text-green-800 border border-green-200">
            <CheckCircleIcon className="h-4 w-4 mr-1.5" />
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return (
          <span className="inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            Low
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
            Medium
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium bg-red-100 text-red-800 border border-red-200">
            <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
            High
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
            {priority}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 py-12">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-neutral-600 dark:text-neutral-400 animate-pulse">
          {id ? 'Loading maintenance request details...' : 'Preparing form...'}
        </p>
      </div>
    );
  }

  // Viewing existing maintenance request
  if (id && existingRequest) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-2"
        >
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
          >
            Back to Maintenance Requests
          </Button>
        </motion.div>

        {/* Header with Glass Effect */}
        <div className="relative bg-gradient-to-r from-primary-600/90 to-primary-800/90 rounded-2xl shadow-lg overflow-hidden mb-8 w-full">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
          <div className="relative p-6 sm:p-8 w-full">
            <div className="max-w-full overflow-hidden">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Maintenance Request Details
                </h1>
                <div>{getStatusBadge(existingRequest.status)}</div>
              </div>
              <p className="text-primary-100 break-words">
                View your maintenance request details and updates
              </p>
            </div>
          </div>
        </div>

        {/* Request Details Card */}
        <Card className="overflow-hidden border border-neutral-200 dark:border-neutral-700 shadow-md">
          <CardHeader className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                {existingRequest.title}
              </h2>
              <div className="flex items-center space-x-2 text-sm text-neutral-500 dark:text-neutral-400">
                <BuildingOfficeIcon className="h-4 w-4" />
                <span>{existingRequest.property_name}</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
              <div className="flex items-center">
                <div className="w-24 text-sm text-neutral-500 dark:text-neutral-400">Type:</div>
                <div className="text-neutral-900 dark:text-neutral-200 capitalize">{existingRequest.type}</div>
              </div>
              
              <div className="flex items-center">
                <div className="w-24 text-sm text-neutral-500 dark:text-neutral-400">Priority:</div>
                <div>{getPriorityBadge(existingRequest.priority)}</div>
              </div>
              
              <div className="flex items-center">
                <div className="w-24 text-sm text-neutral-500 dark:text-neutral-400">Submitted:</div>
                <div className="text-neutral-900 dark:text-neutral-200">{new Date(existingRequest.request_date).toLocaleDateString()}</div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium text-neutral-900 dark:text-neutral-100">Description:</h3>
              <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-100 dark:border-neutral-800">
                {existingRequest.description}
              </p>
            </div>
            
            {/* Request Images */}
            {existingRequest.images && existingRequest.images.length > 0 && (
              <div className="space-y-3 pt-4">
                <h3 className="font-medium text-neutral-900 dark:text-neutral-100 flex items-center">
                  <PhotoIcon className="h-5 w-5 mr-2 text-primary-500" />
                  Attached Images
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {existingRequest.images.map((image, index) => (
                    <div 
                      key={index} 
                      className="relative rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 cursor-pointer"
                      onClick={() => window.open(image, '_blank')}
                    >
                      <img 
                        src={image} 
                        alt={`Image ${index + 1}`} 
                        className="w-full h-32 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {existingRequest.comments && existingRequest.comments.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <h3 className="font-medium text-neutral-900 dark:text-neutral-100 flex items-center">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2 text-primary-500" />
                  Comments & Updates
                </h3>
                <div className="space-y-4">
                  {existingRequest.comments.map((comment) => (
                    <div key={comment.id} className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-lg border border-neutral-100 dark:border-neutral-800">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-medium text-neutral-900 dark:text-neutral-100">{comment.user_name}</div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                          {new Date(comment.created_at).toLocaleString()}
                        </div>
                      </div>
                      <p className="text-neutral-700 dark:text-neutral-300">{comment.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Form for creating a new maintenance request
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-2"
      >
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
          leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
        >
          Back to Maintenance Requests
        </Button>
      </motion.div>

      {/* Header with Glass Effect */}
      <div className="relative bg-gradient-to-r from-primary-600/90 to-primary-800/90 rounded-2xl shadow-lg overflow-hidden mb-8 w-full">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
        <div className="relative p-6 sm:p-8 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
            <div className="w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {id ? 'Edit Maintenance Request' : 'New Maintenance Request'}
              </h1>
              <p className="text-primary-100 break-words">
                {id ? 'Update your existing maintenance request' : 'Submit a new maintenance request for your property'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-5"
        >
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Maintenance Request Form */}
      <Card className="overflow-hidden border border-neutral-200 dark:border-neutral-700 shadow-md">
        <CardHeader className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-6">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
            {id ? 'Edit Request Details' : 'Request Details'}
          </h2>
        </CardHeader>

        <CardContent className="p-6">
          <form id="maintenanceForm" onSubmit={handleSubmit} className="space-y-6">
            {/* Property Selection */}
            <div>
              <label htmlFor="propertyId" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Property
              </label>
              <select
                id="propertyId"
                name="propertyId"
                value={formValues.propertyId}
                onChange={handleChange}
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
                disabled={loadingProperties || !!id}
              >
                <option value="">Select a property</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>{property.title}</option>
                ))}
              </select>
            </div>

            {/* Request Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Request Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formValues.title}
                onChange={handleChange}
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., Leaking Faucet in Master Bathroom"
                required
              />
            </div>

            {/* Type and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Type of Issue
                </label>
                <select
                  id="type"
                  name="type"
                  value={formValues.type}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="plumbing">Plumbing</option>
                  <option value="electrical">Electrical</option>
                  <option value="hvac">HVAC/Heating/Cooling</option>
                  <option value="appliance">Appliance</option>
                  <option value="pest">Pest Control</option>
                  <option value="structural">Structural</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Priority Level
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formValues.priority}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="low">Low - Not urgent</option>
                  <option value="medium">Medium - Needs attention soon</option>
                  <option value="high">High - Urgent issue</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Detailed Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formValues.description}
                onChange={handleChange}
                rows={5}
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Please describe the issue in detail. Include when it started, what you've observed, and any other relevant information."
                required
              />
            </div>
            
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Upload Images (Optional)
              </label>
              <div 
                className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                  dragActive 
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                    : 'border-neutral-300 dark:border-neutral-700 hover:border-primary-400'
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileInput}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/*" 
                  multiple 
                  onChange={handleFileSelect}
                />
                <div className="flex flex-col items-center justify-center text-center">
                  <PhotoIcon className="h-12 w-12 text-neutral-400 dark:text-neutral-500 mb-3" />
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Drag & drop images here, or click to select
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    JPEG, PNG, GIF up to 5MB each
                  </p>
                </div>
              </div>

              {/* Preview uploaded images */}
              {uploadedImages.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {uploadedImages.map((image) => (
                    <div 
                      key={image.id} 
                      className="relative group rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700"
                    >
                      <img 
                        src={image.preview} 
                        alt="Preview" 
                        className="w-full h-24 object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(image.id);
                        }}
                        className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 rounded-full p-1 text-white"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </CardContent>

        <CardFooter className="bg-neutral-50 dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate('/tenant/maintenance')}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              type="submit"
              form="maintenanceForm"
              loading={loadingSubmit}
              leftIcon={<WrenchScrewdriverIcon className="h-5 w-5" />}
            >
              {id ? 'Update Request' : 'Submit Request'}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default MaintenanceRequestForm; 