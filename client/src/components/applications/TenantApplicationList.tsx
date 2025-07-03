import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { useAuth } from '../../utils/auth-context';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import LoadingSpinner from '../ui/LoadingSpinner';
import ResponsiveGrid from '../ui/ResponsiveGrid';
import { 
  BuildingOfficeIcon, 
  DocumentTextIcon, 
  CalendarIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  HomeIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

interface Application {
  id: number;
  property_id: number;
  status: string;
  move_in_date: string;
  created_at: string;
  property: {
    title: string;
    address: string;
    city: string;
    rent_amount: number;
    images?: string[];
  };
}

const StatusBadge = ({ status }: { status: string }) => {
  const config = {
    pending: {
      className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30',
      icon: <ClockIcon className="h-4 w-4 mr-1.5" />
    },
    approved: {
      className: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30',
      icon: <CheckCircleIcon className="h-4 w-4 mr-1.5" />
    },
    rejected: {
      className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30',
      icon: <XCircleIcon className="h-4 w-4 mr-1.5" />
    }
  }[status] || {
    className: 'bg-neutral-50 text-neutral-700 border-neutral-200 dark:bg-neutral-900/20 dark:text-neutral-400 dark:border-neutral-800/30',
    icon: <QuestionMarkCircleIcon className="h-4 w-4 mr-1.5" />
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium border shadow-sm ${config.className}`}>
      {config.icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const ApplicationCard = ({ application }: { application: Application }) => {
  const navigate = useNavigate();
  const formattedMoveIn = new Date(application.move_in_date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
  
  const formattedCreatedAt = new Date(application.created_at).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <Card className="h-full relative overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Property Image */}
      <div className="h-40 bg-neutral-200 dark:bg-neutral-700 relative">
        {application.property.images && application.property.images.length > 0 ? (
          <img 
            src={application.property.images[0]} 
            alt={application.property.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400">
            <BuildingOfficeIcon className="h-12 w-12" />
          </div>
        )}
        
        {/* Status Badge - Positioned in the card */}
        <div className="absolute top-2 right-2">
          <StatusBadge status={application.status} />
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1 truncate">
          {application.property.title || "Property"}
        </h3>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm truncate mb-3">
          {application.property.address}, {application.property.city}
        </p>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-neutral-600 dark:text-neutral-300">
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            Application #{application.id}
          </div>
          <div className="flex items-center text-neutral-600 dark:text-neutral-300">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Applied on: {formattedCreatedAt}
          </div>
          <div className="flex items-center text-neutral-600 dark:text-neutral-300">
            <HomeIcon className="h-4 w-4 mr-2" />
            Desired Move-in: {formattedMoveIn}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-end">
        <Button 
          variant="outline" 
          size="sm"
          className="w-full sm:w-auto"
          onClick={() => navigate(`/tenant/applications/${application.id}`)}
          leftIcon={<EyeIcon className="h-4 w-4" />}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

const TenantApplicationList: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await api.get('/api/applications/tenant');
        
        if (response.data.data) {
          setApplications(response.data.data);
          setFilteredApplications(response.data.data);
        } else {
          setApplications([]);
          setFilteredApplications([]);
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching applications:', err);
        setError(`Failed to load your applications: ${err.response?.data?.message || err.message}`);
        setLoading(false);
      }
    };

    if (user && user.role === 'tenant') {
      fetchApplications();
    } else {
      setLoading(false);
      setError('You must be logged in as a tenant to view applications');
    }
  }, [user]);

  // Filter applications based on search term and status filter
  useEffect(() => {
    let filtered = [...applications];
    
    // Apply status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(app => app.status.toLowerCase() === activeFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(app => 
        app.property.title.toLowerCase().includes(term) || 
        app.property.address.toLowerCase().includes(term) || 
        app.property.city.toLowerCase().includes(term)
      );
    }
    
    setFilteredApplications(filtered);
  }, [applications, activeFilter, searchTerm]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 py-12">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-neutral-600 dark:text-neutral-400 animate-pulse">Loading applications...</p>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header with Glass Effect */}
      <div className="relative bg-gradient-to-r from-primary-600/90 to-primary-800/90 rounded-2xl shadow-lg overflow-hidden mb-8 w-full">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
        <div className="relative p-6 sm:p-8 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
            <div className="w-full sm:w-auto">
              <h1 className="text-3xl font-bold text-white mb-2">My Applications</h1>
              <p className="text-primary-100 break-words">
                Track the status of your rental applications
              </p>
            </div>
            <div className="w-full sm:w-auto flex justify-end">
              <Button
                onClick={() => navigate('/tenant/properties')}
                leftIcon={<PlusIcon className="h-5 w-5" />}
                variant="white"
                size="lg"
                className="whitespace-nowrap min-w-[160px]"
              >
                Browse Properties
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <Card className="shadow-sm mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-grow">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-500 whitespace-nowrap hidden md:inline">
                <FunnelIcon className="inline-block h-4 w-4 mr-1" />
                Filter:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-1.5 text-sm rounded-md ${
                    activeFilter === 'all' 
                      ? 'bg-primary-100 text-primary-800 font-medium'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveFilter('pending')}
                  className={`px-3 py-1.5 text-sm rounded-md flex items-center ${
                    activeFilter === 'pending' 
                      ? 'bg-amber-100 text-amber-800 font-medium'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <ClockIcon className="h-3.5 w-3.5 mr-1" />
                  Pending
                </button>
                <button
                  onClick={() => setActiveFilter('approved')}
                  className={`px-3 py-1.5 text-sm rounded-md flex items-center ${
                    activeFilter === 'approved' 
                      ? 'bg-green-100 text-green-800 font-medium'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <CheckCircleIcon className="h-3.5 w-3.5 mr-1" />
                  Approved
                </button>
                <button
                  onClick={() => setActiveFilter('rejected')}
                  className={`px-3 py-1.5 text-sm rounded-md flex items-center ${
                    activeFilter === 'rejected' 
                      ? 'bg-red-100 text-red-800 font-medium'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <XCircleIcon className="h-3.5 w-3.5 mr-1" />
                  Rejected
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Summary */}
      {applications.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center mr-4">
                  <DocumentTextIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Total Applications</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">{applications.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 flex items-center justify-center mr-4">
                  <ClockIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Pending</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {applications.filter(app => app.status.toLowerCase() === 'pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 flex items-center justify-center mr-4">
                  <CheckCircleIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Approved</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {applications.filter(app => app.status.toLowerCase() === 'approved').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Applications Grid/Empty State */}
      {applications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 px-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700"
        >
          <DocumentTextIcon className="mx-auto h-16 w-16 text-neutral-400" />
          <h3 className="mt-4 text-lg font-medium text-neutral-900 dark:text-white">No applications found</h3>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
          You haven't submitted any rental applications yet. 
          </p>
          <div className="mt-6">
            <Button
              onClick={() => navigate('/tenant/properties')}
              leftIcon={<BuildingOfficeIcon className="h-5 w-5" />}
              size="lg"
            >
              Browse Available Properties
            </Button>
          </div>
        </motion.div>
      ) : filteredApplications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 px-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700"
        >
          <FunnelIcon className="mx-auto h-16 w-16 text-neutral-400" />
          <h3 className="mt-4 text-lg font-medium text-neutral-900 dark:text-white">No matching applications</h3>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
            No applications match your search criteria. Try adjusting your filters.
          </p>
          <div className="mt-6">
            <Button
              onClick={() => {
                setSearchTerm('');
                setActiveFilter('all');
              }}
              leftIcon={<ArrowPathIcon className="h-5 w-5" />}
              variant="outline"
            >
              Reset Filters
            </Button>
          </div>
        </motion.div>
      ) : (
        <ResponsiveGrid
          cols={{ xs: 1, sm: 2, md: 2, lg: 3, xl: 3 }}
          gap={{ xs: 6, sm: 6, md: 6 }}
        >
          {filteredApplications.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </ResponsiveGrid>
      )}
    </motion.div>
  );
};

export default TenantApplicationList; 