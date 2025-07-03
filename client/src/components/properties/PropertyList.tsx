import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { useAuth } from '../../utils/auth-context';
import { Button } from '../ui/Button';
import { Card, CardContent, CardFooter } from '../ui/Card';
import { Input } from '../ui/Input';
import ResponsiveGrid from '../ui/ResponsiveGrid';
import LoadingSpinner from '../ui/LoadingSpinner';
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  HomeIcon,
  UserIcon,
  Square3Stack3DIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ExclamationCircleIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  AdjustmentsHorizontalIcon
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
  created_at: string;
  image_url?: string;
}

const PropertyList: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/properties');
      console.log('Properties data:', response.data.data);
      // Log image paths for debugging
      response.data.data?.forEach((property: Property) => {
        console.log(`Property ${property.id} - Image URL:`, property.image_url);
        console.log(`Property ${property.id} - Images array:`, property.images);
      });
      setProperties(response.data.data || []);
    } catch (err: any) {
      setError('Failed to load properties');
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (propertyId: string) => {
    if (!window.confirm('Are you sure you want to delete this property?')) {
      return;
    }

    try {
      await api.delete(`/api/properties/${propertyId}`);
      setProperties(properties.filter(property => property.id !== propertyId));
    } catch (err: any) {
      setError('Failed to delete property');
      console.error('Error deleting property:', err);
    }
  };

  // Filter and sort properties
  const filteredAndSortedProperties = React.useMemo(() => {
    let filtered = [...properties];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(property => 
        property.title.toLowerCase().includes(term) || 
        property.address.toLowerCase().includes(term) || 
        property.city.toLowerCase().includes(term) ||
        property.type.toLowerCase().includes(term)
      );
    }
    
    // Apply type filter
    if (filterType === 'available') {
      filtered = filtered.filter(property => property.is_available);
    } else if (filterType === 'unavailable') {
      filtered = filtered.filter(property => !property.is_available);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let valueA: any = a[sortBy as keyof Property];
      let valueB: any = b[sortBy as keyof Property];
      
      // Handle numeric values
      if (sortBy === 'rent_amount') {
        valueA = parseFloat(valueA);
        valueB = parseFloat(valueB);
      }
      
      // Handle dates
      if (sortBy === 'created_at') {
        valueA = new Date(valueA).getTime();
        valueB = new Date(valueB).getTime();
      }
      
      if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtered;
  }, [properties, searchTerm, filterType, sortBy, sortOrder]);

  const PropertyCard = ({ property }: { property: Property }) => {
    // Function to get proper image URL
    const getImageUrl = () => {
      if (!property.image_url) {
        return 'https://via.placeholder.com/800x600?text=No+Image+Available';
      }
      
      // If it's already a full URL, use it as is
      if (property.image_url.startsWith('http')) {
        return property.image_url;
      }
      
      // If it's a relative path, prepend the server URL
      return `http://localhost:5000/${property.image_url}`;
    };
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="h-full overflow-hidden group hover:shadow-xl transition-all duration-300">
          {/* Property Image with Overlay */}
          <div className="relative h-52 overflow-hidden">
            <img
              src={getImageUrl()}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                console.error(`Image load error for property ${property.id}:`, e);
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=No+Image+Available';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Status Badge */}
            <div className="absolute top-3 right-3">
              <span className={`px-3 py-1.5 text-xs font-semibold rounded-full shadow-sm backdrop-blur-sm ${
                property.is_available
                  ? 'bg-green-500/90 text-white'
                  : 'bg-red-500/90 text-white'
              }`}>
                {property.is_available ? 'Available' : 'Unavailable'}
              </span>
            </div>
            
            {/* Rent Amount - Positioned in image */}
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
                <p className="text-sm font-medium text-neutral-900 dark:text-white">{property.size}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Sq ft</p>
              </div>
            </div>

            {/* Property Type */}
            <div className="mb-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-primary-50 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300 border border-primary-100 dark:border-primary-800/30">
                {property.type}
              </span>
            </div>
          </CardContent>

          {/* Actions */}
          <CardFooter className="bg-neutral-50 dark:bg-neutral-800/50 p-4 border-t border-neutral-100 dark:border-neutral-700">
            <div className="flex justify-between items-center">
              <Button
                onClick={() => navigate(`/landlord/properties/${property.id}`)}
                leftIcon={<EyeIcon className="h-4 w-4" />}
                variant="default"
                size="sm"
              >
                View
              </Button>
              <div className="flex space-x-2">
                <Button
                  onClick={() => navigate(`/landlord/properties/edit/${property.id}`)}
                  leftIcon={<PencilIcon className="h-4 w-4" />}
                  variant="outline"
                  size="sm"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => handleDelete(property.id)}
                  leftIcon={<TrashIcon className="h-4 w-4" />}
                  variant="destructive"
                  size="sm"
                >
                  Delete
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Floating Add Property Button (Mobile) */}
      <div className="fixed bottom-6 right-6 md:hidden z-10">
        <Button
          onClick={() => navigate('/landlord/properties/add')}
          leftIcon={<PlusIcon className="h-5 w-5" />}
          variant="default"
          size="lg"
          className="rounded-full h-14 w-14 p-0 flex items-center justify-center shadow-xl"
        >
          <span className="sr-only">Add New Property</span>
        </Button>
      </div>

      {/* Header with Glass Effect */}
      <div className="relative bg-gradient-to-r from-primary-600/90 to-primary-800/90 rounded-2xl shadow-lg overflow-hidden mb-8 w-full">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
        <div className="relative p-6 sm:p-8 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
            <div className="w-full sm:w-auto">
              <h1 className="text-3xl font-bold text-white mb-2">My Properties</h1>
              <p className="text-primary-100 break-words">
                Manage your rental properties and listings
              </p>
            </div>
            <div className="w-full sm:w-auto flex justify-end">
              <Button
                onClick={() => navigate('/landlord/properties/add')}
                leftIcon={<PlusIcon className="h-5 w-5" />}
                variant="white"
                size="lg"
                className="whitespace-nowrap min-w-[160px]"
              >
                Add New Property
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters with Glassmorphism Effect */}
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          {/* Mobile Search and Filter Toggle */}
          <div className="flex items-center justify-between sm:hidden mb-3">
            <div className="flex-1 mr-2">
              <Input
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
              />
            </div>
            <Button
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
              leftIcon={<AdjustmentsHorizontalIcon className="h-5 w-5" />}
              variant="outline"
              size="sm"
              className="flex-shrink-0"
            >
              Filter
            </Button>
          </div>
          
          {/* Desktop Search and Filters */}
          <div className="hidden sm:grid sm:grid-cols-12 gap-4">
            {/* Search */}
            <div className="sm:col-span-6">
              <Input
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
              />
            </div>

            {/* Filter */}
            <div className="sm:col-span-3">
              <div className="relative">
                <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 appearance-none border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Properties</option>
                  <option value="available">Available Only</option>
                  <option value="unavailable">Unavailable Only</option>
                </select>
              </div>
            </div>

            {/* Sort */}
            <div className="sm:col-span-3">
              <div className="relative">
                <ArrowsUpDownIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split('-');
                    setSortBy(newSortBy);
                    setSortOrder(newSortOrder as 'asc' | 'desc');
                  }}
                  className="w-full pl-10 pr-3 py-2.5 appearance-none border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="created_at-desc">Newest First</option>
                  <option value="created_at-asc">Oldest First</option>
                  <option value="rent_amount-asc">Price: Low to High</option>
                  <option value="rent_amount-desc">Price: High to Low</option>
                  <option value="title-asc">Name: A to Z</option>
                  <option value="title-desc">Name: Z to A</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Mobile Filter Menu (Expandable) */}
          <AnimatePresence>
            {isFilterMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden sm:hidden"
              >
                <div className="pt-3 space-y-3 border-t mt-3 border-neutral-200 dark:border-neutral-700">
                  {/* Filter and Sort for Mobile */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Filter</label>
                    <div className="relative">
                      <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 appearance-none border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="all">All Properties</option>
                        <option value="available">Available Only</option>
                        <option value="unavailable">Unavailable Only</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Sort</label>
                    <div className="relative">
                      <ArrowsUpDownIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
                      <select
                        value={`${sortBy}-${sortOrder}`}
                        onChange={(e) => {
                          const [newSortBy, newSortOrder] = e.target.value.split('-');
                          setSortBy(newSortBy);
                          setSortOrder(newSortOrder as 'asc' | 'desc');
                        }}
                        className="w-full pl-10 pr-3 py-2 appearance-none border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="created_at-desc">Newest First</option>
                        <option value="created_at-asc">Oldest First</option>
                        <option value="rent_amount-asc">Price: Low to High</option>
                        <option value="rent_amount-desc">Price: High to Low</option>
                        <option value="title-asc">Name: A to Z</option>
                        <option value="title-desc">Name: Z to A</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Showing <span className="font-medium text-neutral-900 dark:text-white">{filteredAndSortedProperties.length}</span> {filteredAndSortedProperties.length === 1 ? 'property' : 'properties'}
        </p>
        
        {(searchTerm || filterType !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setFilterType('all');
            }}
            className="text-sm"
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Properties Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredAndSortedProperties.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 px-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700"
        >
          <BuildingOfficeIcon className="mx-auto h-16 w-16 text-neutral-400" />
          <h3 className="mt-4 text-lg font-medium text-neutral-900 dark:text-white">No properties found</h3>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by adding your first property.'
            }
          </p>
          {!searchTerm && filterType === 'all' && (
            <div className="mt-6">
              <Button
                onClick={() => navigate('/landlord/properties/add')}
                leftIcon={<PlusIcon className="h-5 w-5" />}
                size="lg"
              >
                Add Your First Property
              </Button>
            </div>
          )}
        </motion.div>
      ) : (
        <ResponsiveGrid
          cols={{ xs: 1, sm: 2, md: 2, lg: 3, xl: 3, '2xl': 4 }}
          gap={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 8, '2xl': 8 }}
        >
          {filteredAndSortedProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </ResponsiveGrid>
      )}
    </motion.div>
  );
};

export default PropertyList; 