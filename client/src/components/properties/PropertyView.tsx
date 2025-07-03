import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BuildingOfficeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  HomeIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { useAuth } from '../../utils/auth-context';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import LoadingSpinner from '../ui/LoadingSpinner';

interface Property {
  id: number;
  title: string;
  description: string;
  address: string;
  city: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  size: number;
  rent_amount: number;
  is_available: boolean;
  images: string[];
  landlord: {
    name: string;
    email: string;
    phone: string;
  };
}

const PropertyView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/properties/${id}`);
        setProperty(response.data.data);
      } catch (err: any) {
        console.error('Error fetching property:', err);
        setError('Failed to load property details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);

  const nextImage = () => {
    if (property?.images && property.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === property.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (property?.images && property.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? property.images.length - 1 : prev - 1
      );
    }
  };

  const openImageModal = (index: number) => {
    setCurrentImageIndex(index);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center"
      >
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-neutral-600">Loading property details...</p>
        </div>
      </motion.div>
    );
  }

  if (error || !property) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4"
      >
        <Card className="max-w-md w-full text-center">
          <div className="p-8">
            <XMarkIcon className="w-12 h-12 text-error-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">Property Not Found</h2>
            <p className="text-neutral-600 mb-6">{error || 'The property you are looking for does not exist.'}</p>
            <Button
              variant="default"
              onClick={() => navigate('/tenant/properties')}
            >
              Back to Properties
            </Button>
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex items-center"
            >
              <ChevronLeftIcon className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            {user?.role === 'tenant' && property.is_available && (
              <Button
                variant="default"
                onClick={() => navigate(`/tenant/properties/${property.id}/apply`)}
              >
                Apply Now
              </Button>
            )}
          </div>
          
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">{property.title}</h1>
          <div className="flex items-center text-neutral-600">
            <MapPinIcon className="w-5 h-5 mr-2" />
            <span>{property.address}, {property.city}</span>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            {/* Image Gallery */}
            <Card className="mb-8 overflow-hidden">
              {property.images && property.images.length > 0 ? (
                <div className="relative">
                  {/* Main Image */}
                  <div className="relative h-96 bg-neutral-100">
                    <img
                      src={`${process.env.REACT_APP_API_URL || ''}/${property.images[currentImageIndex]}`}
                      alt={`${property.title} - Image ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => openImageModal(currentImageIndex)}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
                      }}
                    />
                    
                    {/* Navigation Arrows */}
                    {property.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                        >
                          <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                        >
                          <ChevronRightIcon className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    
                    {/* Image Counter */}
                    <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {property.images.length}
                    </div>
                  </div>
                  
                  {/* Thumbnail Gallery */}
                  {property.images.length > 1 && (
                    <div className="p-4 bg-neutral-50">
                      <div className="flex gap-2 overflow-x-auto">
                        {property.images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                              index === currentImageIndex 
                                ? 'border-primary-500' 
                                : 'border-transparent hover:border-primary-300'
                            }`}
                          >
                            <img
                              src={`${process.env.REACT_APP_API_URL || ''}/${image}`}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x64?text=Image';
                              }}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-96 bg-neutral-100 flex items-center justify-center">
                  <div className="text-center text-neutral-500">
                    <BuildingOfficeIcon className="w-16 h-16 mx-auto mb-4" />
                    <p>No images available for this property</p>
                  </div>
                </div>
              )}
            </Card>

            {/* Property Details */}
            <Card className="mb-8">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">Property Details</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <HomeIcon className="w-5 h-5 text-primary-600 mr-3" />
                      <div>
                        <p className="text-sm text-neutral-500">Property Type</p>
                        <p className="font-medium text-neutral-900 capitalize">{property.type}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="w-5 h-5 text-primary-600 mr-3" />
                      <div>
                        <p className="text-sm text-neutral-500">Bedrooms</p>
                        <p className="font-medium text-neutral-900">{property.bedrooms}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="w-5 h-5 text-primary-600 mr-3" />
                      <div>
                        <p className="text-sm text-neutral-500">Bathrooms</p>
                        <p className="font-medium text-neutral-900">{property.bathrooms}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="w-5 h-5 text-primary-600 mr-3" />
                      <div>
                        <p className="text-sm text-neutral-500">Monthly Rent</p>
                        <p className="font-medium text-neutral-900">${property.rent_amount?.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="w-5 h-5 text-primary-600 mr-3" />
                      <div>
                        <p className="text-sm text-neutral-500">Size</p>
                        <p className="font-medium text-neutral-900">{property.size} sq ft</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <CheckCircleIcon className="w-5 h-5 text-primary-600 mr-3" />
                      <div>
                        <p className="text-sm text-neutral-500">Status</p>
                        <p className="font-medium text-neutral-900">
                          {property.is_available ? 'Available' : 'Not Available'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Description */}
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">Description</h2>
                <p className="text-neutral-700 leading-relaxed">
                  {property.description || 'No description available for this property.'}
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            {/* Contact Information */}
            <Card className="mb-6">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Contact Information</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <UserIcon className="w-5 h-5 text-primary-600 mr-3" />
                    <div>
                      <p className="text-sm text-neutral-500">Landlord</p>
                      <p className="font-medium text-neutral-900">{property.landlord?.name || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <EnvelopeIcon className="w-5 h-5 text-primary-600 mr-3" />
                    <div>
                      <p className="text-sm text-neutral-500">Email</p>
                      <p className="font-medium text-neutral-900">{property.landlord?.email || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <PhoneIcon className="w-5 h-5 text-primary-600 mr-3" />
                    <div>
                      <p className="text-sm text-neutral-500">Phone</p>
                      <p className="font-medium text-neutral-900">{property.landlord?.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h3>
                
                <div className="space-y-3">
                  {user?.role === 'tenant' && property.is_available && (
                    <Button
                      variant="default"
                      onClick={() => navigate(`/tenant/properties/${property.id}/apply`)}
                      className="w-full"
                    >
                      Apply for This Property
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/tenant/maintenance/new?propertyId=${property.id}`)}
                    className="w-full"
                  >
                    Report Maintenance Issue
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => window.print()}
                    className="w-full"
                  >
                    Print Details
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && property.images && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 overflow-y-auto"
            onClick={closeImageModal}
          >
            <div className="relative max-w-4xl max-h-full z-[101]">
              <button
                onClick={closeImageModal}
                className="absolute -top-12 right-0 text-white hover:text-neutral-300 transition-colors"
              >
                <XMarkIcon className="w-8 h-8" />
              </button>
              
              <img
                src={`${process.env.REACT_APP_API_URL || ''}/${property.images[currentImageIndex]}`}
                alt={`${property.title} - Image ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
              
              {property.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeftIcon className="w-6 h-6" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    <ChevronRightIcon className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PropertyView; 