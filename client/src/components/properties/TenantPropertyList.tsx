import React, { useState, useEffect, ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import LoadingSpinner from '../ui/LoadingSpinner';
import ResponsiveGrid from '../ui/ResponsiveGrid';
import { 
  BuildingOfficeIcon,
  MapPinIcon,
  HomeIcon,
  UserIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  Square3Stack3DIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';

interface Property {
  id: string;
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
  images?: string[];
}

const TenantPropertyList: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    city: '',
    type: '',
    minBedrooms: '',
    maxRent: '',
    onlyAvailable: true
  });

  // Get unique cities for the filter dropdown
  const uniqueCities = Array.from(new Set(properties.map(property => property.city)));

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        // Get all properties
        setLoading(true);
        const response = await api.get('/api/properties');
        setProperties(response.data.data || []);
      } catch (err: any) {
        setError('Failed to load properties');
        console.error('Error fetching properties:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  useEffect(() => {
    // Apply filters whenever filters or properties change
    let result = [...properties];
    
    if (filters.city) {
      result = result.filter(property => 
        property.city.toLowerCase().includes(filters.city.toLowerCase())
      );
    }
    
    if (filters.type) {
      result = result.filter(property => property.type === filters.type);
    }
    
    if (filters.minBedrooms) {
      const minBeds = parseInt(filters.minBedrooms);
      result = result.filter(property => parseInt(property.bedrooms) >= minBeds);
    }
    
    if (filters.maxRent) {
      const maxRent = parseFloat(filters.maxRent);
      result = result.filter(property => parseFloat(property.rent_amount) <= maxRent);
    }
    
    if (filters.onlyAvailable) {
      result = result.filter(property => property.is_available);
    }
    
    setFilteredProperties(result);
  }, [properties, filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : value
    }));
  };

  const resetFilters = () => {
    setFilters({
      city: '',
      type: '',
      minBedrooms: '',
      maxRent: '',
      onlyAvailable: true
    });
  };

  const PropertyCard = ({ property }: { property: Property }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="h-full overflow-hidden group hover:shadow-xl transition-all duration-300">
          {/* Property Image with Overlay */}
          <div className="relative h-52 overflow-hidden">
            {property.images && property.images.length > 0 ? (
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
                <BuildingOfficeIcon className="h-12 w-12 text-neutral-400" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Status Badge */}
            {property.is_available && (
              <div className="absolute top-3 right-3">
                <span className="px-3 py-1.5 text-xs font-semibold rounded-full shadow-sm backdrop-blur-sm bg-green-500/90 text-white">
                  Available Now
                </span>
              </div>
            )}
            
            {/* Rent Amount - Positioned in the image */}
            <div className="absolute bottom-3 right-3 bg-white dark:bg-neutral-800 rounded-lg shadow-lg px-3 py-2 border border-neutral-100 dark:border-neutral-700">
              <div className="flex items-center">
                <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                  ${parseFloat(property.rent_amount).toLocaleString()}
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 ml-1">/month</span>
              </div>
            </div>
          </div>

          <CardContent className="p-5">
            {/* Property Title */}
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2 line-clamp-1">
              {property.title}
            </h3>

            {/* Location */}
            <div className="flex items-center text-neutral-600 dark:text-neutral-400 mb-4">
              <MapPinIcon className="h-4 w-4 flex-shrink-0 mr-1.5" />
              <span className="text-sm truncate">{property.address}, {property.city}</span>
            </div>

            {/* Property Details */}
            <div className="flex items-center justify-between mb-4 px-2 py-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
              <div className="text-center flex flex-col items-center">
                <HomeIcon className="h-4 w-4 text-neutral-500 dark:text-neutral-400 mb-1" />
                <p className="text-sm font-medium text-neutral-900 dark:text-white">{property.bedrooms}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Beds</p>
              </div>
              <div className="text-center flex flex-col items-center">
                <UserIcon className="h-4 w-4 text-neutral-500 dark:text-neutral-400 mb-1" />
                <p className="text-sm font-medium text-neutral-900 dark:text-white">{property.bathrooms}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Baths</p>
              </div>
              <div className="text-center flex flex-col items-center">
                <Square3Stack3DIcon className="h-4 w-4 text-neutral-500 dark:text-neutral-400 mb-1" />
                <p className="text-sm font-medium text-neutral-900 dark:text-white">{property.size || 'N/A'}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Sq ft</p>
              </div>
            </div>

            {/* Property Type */}
            <div className="mb-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-primary-50 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300 border border-primary-100 dark:border-primary-800/30">
                {property.type}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 mt-auto">
              <Button 
                variant="default"
                onClick={() => navigate(`/tenant/properties/${property.id}/apply`)}
                className="flex-1"
                leftIcon={<ClipboardDocumentCheckIcon className="h-4 w-4" />}
              >
                Apply Now
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate(`/tenant/properties/${property.id}`)}
                className="flex-1"
                leftIcon={<MagnifyingGlassIcon className="h-4 w-4" />}
              >
                Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 py-12">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-neutral-600 dark:text-neutral-400 animate-pulse">Loading properties...</p>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-5 max-w-5xl mx-auto my-6"
      >
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/30 to-secondary-50/30 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-r from-primary-600/90 to-primary-800/90 rounded-2xl shadow-lg overflow-hidden mb-8 w-full"
        >
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
          <div className="relative p-6 sm:p-8 w-full">
            <div className="max-w-full overflow-hidden">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Available Properties
              </h1>
              <p className="text-base text-primary-100 break-words">
                Find your perfect place to call home
              </p>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="overflow-hidden shadow-md bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md">
            {/* Mobile View - Filter Toggle */}
            <div className="block sm:hidden p-4 border-b border-neutral-200 dark:border-neutral-700">
              <Button
                variant="outline"
                onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                className="w-full flex items-center justify-center"
                leftIcon={<AdjustmentsHorizontalIcon className="h-5 w-5" />}
              >
                {isFilterMenuOpen ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>
            
            {/* Desktop View - Always Visible */}
            <div className={`p-5 ${isFilterMenuOpen ? 'block' : 'hidden sm:block'}`}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center">
                  <FunnelIcon className="w-5 h-5 mr-2 text-primary-500" />
                  Filter Properties
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="text-sm"
                  leftIcon={<ArrowPathIcon className="h-4 w-4" />}
                >
                  Reset
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* City Filter */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                    City
                  </label>
                  <select
                    name="city"
                    value={filters.city}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  >
                    <option value="" className="text-neutral-900 dark:text-white">Any City</option>
                    {uniqueCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                
                {/* Property Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Property Type
                  </label>
                  <select
                    name="type"
                    value={filters.type}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  >
                    <option value="" className="text-neutral-900 dark:text-white">Any Type</option>
                    <option value="apartment" className="text-neutral-900 dark:text-white">Apartment</option>
                    <option value="house" className="text-neutral-900 dark:text-white">House</option>
                    <option value="condo" className="text-neutral-900 dark:text-white">Condo</option>
                    <option value="townhouse" className="text-neutral-900 dark:text-white">Townhouse</option>
                    <option value="commercial" className="text-neutral-900 dark:text-white">Commercial</option>
                  </select>
                </div>
                
                {/* Min Bedrooms Filter */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Min Bedrooms
                  </label>
                  <select
                    name="minBedrooms"
                    value={filters.minBedrooms}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  >
                    <option value="" className="text-neutral-900 dark:text-white">Any</option>
                    <option value="1" className="text-neutral-900 dark:text-white">1+</option>
                    <option value="2" className="text-neutral-900 dark:text-white">2+</option>
                    <option value="3" className="text-neutral-900 dark:text-white">3+</option>
                    <option value="4" className="text-neutral-900 dark:text-white">4+</option>
                  </select>
                </div>
                
                {/* Max Rent Filter */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Max Rent
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-neutral-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="maxRent"
                      value={filters.maxRent}
                      onChange={handleFilterChange}
                      placeholder="Any"
                      className="w-full pl-7 pr-3 py-2 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
              
              {/* Available Only Checkbox */}
              <div className="mt-4">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="onlyAvailable"
                    checked={filters.onlyAvailable}
                    onChange={handleFilterChange}
                    className="h-4 w-4 text-primary-600 rounded border-neutral-300 dark:border-neutral-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">
                    Show only available properties
                  </span>
                </label>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Results Count */}
        <div className="flex items-center justify-between px-1 mb-5">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Showing <span className="font-medium text-neutral-900 dark:text-white">{filteredProperties.length}</span> {filteredProperties.length === 1 ? 'property' : 'properties'}
          </p>
        </div>

        {/* Property List */}
        {filteredProperties.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 px-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700"
          >
            <BuildingOfficeIcon className="mx-auto h-16 w-16 text-neutral-400" />
            <h3 className="mt-4 text-lg font-medium text-neutral-900 dark:text-white">No properties found</h3>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
              No properties match your search criteria. Try adjusting your filters.
            </p>
            <div className="mt-6">
              <Button
                onClick={resetFilters}
                leftIcon={<ArrowPathIcon className="h-5 w-5" />}
                size="lg"
              >
                Reset Filters
              </Button>
            </div>
          </motion.div>
        ) : (
          <ResponsiveGrid
            cols={{ xs: 1, sm: 1, md: 2, lg: 3, xl: 3 }}
            gap={{ xs: 6, sm: 6, md: 6 }}
          >
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </ResponsiveGrid>
        )}
      </div>
    </div>
  );
};

export default TenantPropertyList;
