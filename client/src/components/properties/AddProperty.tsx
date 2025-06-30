import React, { useState, useRef, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/auth-context';
import api from '../../utils/api';
import { 
  BuildingOfficeIcon, 
  MapPinIcon, 
  CurrencyDollarIcon, 
  HomeIcon, 
  PhotoIcon, 
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowUpTrayIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../ui/LoadingSpinner';
import { Button } from '../ui/Button';

interface FormData {
  title: string;
  description: string;
  address: string;
  city: string;
  type: string;
  bedrooms: string;
  bathrooms: string;
  size: string;
  rent_amount: string;
  is_available: boolean;
  amenities: string[];
}

const AMENITIES_OPTIONS = [
  'Wi-Fi', 'Parking', 'Security', 'Gym', 'Swimming Pool', 
  'Furnished', 'Balcony', 'Air Conditioning', 'Heating',
  'Laundry', 'Pets Allowed', 'Storage'
];

const AddProperty: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    address: '',
    city: '',
    type: 'apartment',
    bedrooms: '1',
    bathrooms: '1',
    size: '',
    rent_amount: '',
    is_available: true,
    amenities: []
  });

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Image state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : value
    }));

    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle amenity checkbox changes
  const handleAmenityChange = (amenity: string) => {
    setFormData(prev => {
      const amenities = [...prev.amenities];
      
      if (amenities.includes(amenity)) {
        return { ...prev, amenities: amenities.filter(a => a !== amenity) };
      } else {
        return { ...prev, amenities: [...amenities, amenity] };
      }
    });
  };

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.title.trim()) errors.title = 'Property name is required';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.rent_amount) errors.rent_amount = 'Rent amount is required';
    else if (isNaN(parseFloat(formData.rent_amount)) || parseFloat(formData.rent_amount) <= 0) {
      errors.rent_amount = 'Rent must be a positive number';
    }
    
    if (!formData.bedrooms) errors.bedrooms = 'Number of bedrooms is required';
    if (!formData.bathrooms) errors.bathrooms = 'Number of bathrooms is required';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fix the errors in the form');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Convert string values to numbers
      const propertyData = {
        ...formData,
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseFloat(formData.bathrooms),
        size: formData.size ? parseFloat(formData.size) : 0,
        rent_amount: parseFloat(formData.rent_amount),
        amenities: JSON.stringify(formData.amenities)
      };

      // If there's an image, use FormData to submit
      if (selectedImage) {
        const formDataToSubmit = new FormData();
        
        // Append all property data
        Object.entries(propertyData).forEach(([key, value]) => {
          formDataToSubmit.append(key, value as string | Blob);
        });
        
        // Append the image with the correct field name
        formDataToSubmit.append('image', selectedImage);
        
        // Submit with multipart/form-data
        const response = await api.post('/api/properties', formDataToSubmit, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        setSuccess('Property created successfully!');
        setTimeout(() => navigate('/landlord/properties'), 1500);
      } else {
        // Submit without image
        const response = await api.post('/api/properties', propertyData);
        setSuccess('Property created successfully!');
        setTimeout(() => navigate('/landlord/properties'), 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create property');
      console.error('Error creating property:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Property</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create a new property listing for your portfolio
          </p>
        </div>
        <Button 
          onClick={() => navigate('/landlord/properties')}
          variant="outline"
          size="sm"
        >
          Cancel
        </Button>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start">
          <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start">
          <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form Content */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Basic Information Section */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Basic Information
                </h2>
                
                <div className="space-y-4">
                  {/* Property Name */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Property Name*
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        validationErrors.title ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Enter property name"
                    />
                    {validationErrors.title && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.title}</p>
                    )}
                  </div>
                  
                  {/* Property Type */}
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Property Type*
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="condo">Condo</option>
                      <option value="townhouse">Townhouse</option>
                      <option value="commercial">Commercial</option>
                    </select>
                  </div>
                  
                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Describe your property"
                    />
                  </div>
                </div>
              </div>
              
              {/* Location Section */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <MapPinIcon className="h-5 w-5 mr-2 text-primary-500" />
                  Location Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Address */}
                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Address*
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        validationErrors.address ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Street address"
                    />
                    {validationErrors.address && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.address}</p>
                    )}
                  </div>
                  
                  {/* City */}
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      City*
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        validationErrors.city ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="City"
                    />
                    {validationErrors.city && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.city}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Property Details Section */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <HomeIcon className="h-5 w-5 mr-2 text-primary-500" />
                  Property Details
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Bedrooms */}
                  <div>
                    <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Bedrooms*
                    </label>
                    <input
                      type="number"
                      id="bedrooms"
                      name="bedrooms"
                      value={formData.bedrooms}
                      onChange={handleChange}
                      min="0"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        validationErrors.bedrooms ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    {validationErrors.bedrooms && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.bedrooms}</p>
                    )}
                  </div>
                  
                  {/* Bathrooms */}
                  <div>
                    <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Bathrooms*
                    </label>
                    <input
                      type="number"
                      id="bathrooms"
                      name="bathrooms"
                      value={formData.bathrooms}
                      onChange={handleChange}
                      min="0"
                      step="0.5"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        validationErrors.bathrooms ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    {validationErrors.bathrooms && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.bathrooms}</p>
                    )}
                  </div>
                  
                  {/* Size */}
                  <div>
                    <label htmlFor="size" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Size (sq ft)
                    </label>
                    <input
                      type="number"
                      id="size"
                      name="size"
                      value={formData.size}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="0"
                    />
                  </div>
                  
                  {/* Rent Amount */}
                  <div>
                    <label htmlFor="rent_amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Monthly Rent (Ksh)*
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 dark:text-gray-400">Ksh</span>
                      </div>
                      <input
                        type="number"
                        id="rent_amount"
                        name="rent_amount"
                        value={formData.rent_amount}
                        onChange={handleChange}
                        min="0"
                        className={`w-full pl-12 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                          validationErrors.rent_amount ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder="0"
                      />
                    </div>
                    {validationErrors.rent_amount && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.rent_amount}</p>
                    )}
                  </div>
                </div>
                
                {/* Availability */}
                <div className="mt-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_available"
                      name="is_available"
                      checked={formData.is_available}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_available" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Property is available for rent
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Amenities Section */}
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Amenities (Optional)
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {AMENITIES_OPTIONS.map(amenity => (
                    <div key={amenity} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`amenity-${amenity}`}
                        checked={formData.amenities.includes(amenity)}
                        onChange={() => handleAmenityChange(amenity)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`amenity-${amenity}`} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        {amenity}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="mt-6 flex justify-end">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full md:w-auto"
              >
                {submitting ? (
                  <>
                    <LoadingSpinner className="mr-2" />
                    Saving...
                  </>
                ) : 'Save Property'}
              </Button>
            </div>
          </form>
        </div>
        
        {/* Sidebar - Image Upload */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <PhotoIcon className="h-5 w-5 mr-2 text-primary-500" />
              Property Image
            </h2>
            
            {imagePreview ? (
              <div className="relative rounded-lg overflow-hidden mb-4">
                <img 
                  src={imagePreview} 
                  alt="Property preview" 
                  className="w-full h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            ) : (
              <div 
                onClick={triggerFileInput}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
              >
                <ArrowUpTrayIcon className="h-10 w-10 text-gray-400 dark:text-gray-500 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  Click to upload a property image
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 text-center">
                  PNG, JPG, JPEG up to 5MB
                </p>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            
            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={triggerFileInput}
                className="w-full"
              >
                {imagePreview ? 'Change Image' : 'Select Image'}
              </Button>
            </div>
            
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              Adding a high-quality image can significantly increase interest in your property.
              For best results, use a well-lit photo showing the property's exterior or best feature.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProperty; 