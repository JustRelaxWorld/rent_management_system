import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { useAuth } from '../../utils/auth-context';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';
import LoadingSpinner from '../ui/LoadingSpinner';
import ResponsiveGrid from '../ui/ResponsiveGrid';
import { 
  BuildingOfficeIcon, 
  WrenchScrewdriverIcon,
  ClockIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  CalendarIcon,
  FunnelIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

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
}

const MaintenanceRequestList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchMaintenanceRequests = async () => {
      try {
        const response = await api.get('/api/maintenance');
        setMaintenanceRequests(response.data.data || []);
        setFilteredRequests(response.data.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch maintenance requests:', err);
        setError('Failed to load maintenance requests. Please try again later.');
        setLoading(false);
      }
    };

    if (user) {
      fetchMaintenanceRequests();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Apply filters when search term or status filter changes
  useEffect(() => {
    let filtered = [...maintenanceRequests];
    
    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(request => request.status === filterStatus);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(request => 
        request.title.toLowerCase().includes(term) || 
        request.property_name.toLowerCase().includes(term) || 
        request.type.toLowerCase().includes(term)
      );
    }
    
    setFilteredRequests(filtered);
  }, [maintenanceRequests, filterStatus, searchTerm]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
            <ClockIcon className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
            <ArrowPathIcon className="h-3 w-3 mr-1" />
            In Progress
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            <CheckCircleIcon className="h-3 w-3 mr-1" />
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            Low
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
            Medium
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
            <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
            High
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
            {priority}
          </span>
        );
    }
  };

  const MaintenanceRequestCard = ({ request }: { request: MaintenanceRequest }) => (
    <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className={`h-2 w-full ${
        request.priority === 'high' ? 'bg-red-500' :
        request.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'
      }`} />
      
      <CardHeader className="flex justify-between items-center p-4 bg-white border-b border-neutral-100 dark:border-neutral-700">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-neutral-900 dark:text-white truncate">
            {request.title}
          </h3>
        </div>
        <div className="ml-2 flex-shrink-0">
          {getStatusBadge(request.status)}
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start space-x-2">
          <BuildingOfficeIcon className="h-4 w-4 text-neutral-500 mt-0.5" />
          <span className="text-sm text-neutral-700 dark:text-neutral-300">{request.property_name}</span>
        </div>
        
        <div className="flex items-start space-x-2">
          <WrenchScrewdriverIcon className="h-4 w-4 text-neutral-500 mt-0.5" />
          <span className="text-sm text-neutral-700 dark:text-neutral-300 capitalize">{request.type}</span>
        </div>
        
        <div className="flex items-center justify-between text-xs text-neutral-500 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center">
            <CalendarIcon className="h-3 w-3 mr-1" />
            <span>{new Date(request.request_date).toLocaleDateString()}</span>
          </div>
          <div>{getPriorityBadge(request.priority)}</div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-neutral-50 dark:bg-neutral-800/50 p-3 border-t border-neutral-100 dark:border-neutral-700">
        <Button
          onClick={() => navigate(`/tenant/maintenance/${request.id}`)}
          leftIcon={<EyeIcon className="h-4 w-4" />}
          variant="default"
          className="w-full"
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 py-12">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-neutral-600 dark:text-neutral-400 animate-pulse">Loading maintenance requests...</p>
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

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5"
      >
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
          <p className="text-amber-700 dark:text-amber-400">Please log in to view maintenance requests.</p>
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
              <h1 className="text-3xl font-bold text-white mb-2">Maintenance Requests</h1>
              <p className="text-primary-100 break-words">
                Track and manage maintenance issues for your properties
              </p>
            </div>
            <div className="w-full sm:w-auto flex justify-end">
              <Button 
                onClick={() => navigate('/tenant/maintenance/new')}
                leftIcon={<PlusIcon className="h-5 w-5" />}
                variant="white"
                size="lg"
                className="whitespace-nowrap min-w-[140px]"
              >
                New Request
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {maintenanceRequests.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center mr-4">
                  <DocumentTextIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Total Requests</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">{maintenanceRequests.length}</p>
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
                    {maintenanceRequests.filter(req => req.status === 'pending').length}
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
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Completed</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {maintenanceRequests.filter(req => req.status === 'completed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filter Bar */}
      <Card className="shadow-sm mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-grow">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search maintenance requests..."
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
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1.5 text-sm rounded-md ${
                    filterStatus === 'all' 
                      ? 'bg-primary-100 text-primary-800 font-medium'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStatus('pending')}
                  className={`px-3 py-1.5 text-sm rounded-md flex items-center ${
                    filterStatus === 'pending' 
                      ? 'bg-amber-100 text-amber-800 font-medium'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <ClockIcon className="h-3.5 w-3.5 mr-1" />
                  Pending
                </button>
                <button
                  onClick={() => setFilterStatus('in_progress')}
                  className={`px-3 py-1.5 text-sm rounded-md flex items-center ${
                    filterStatus === 'in_progress' 
                      ? 'bg-blue-100 text-blue-800 font-medium'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <ArrowPathIcon className="h-3.5 w-3.5 mr-1" />
                  In Progress
                </button>
                <button
                  onClick={() => setFilterStatus('completed')}
                  className={`px-3 py-1.5 text-sm rounded-md flex items-center ${
                    filterStatus === 'completed' 
                      ? 'bg-green-100 text-green-800 font-medium'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <CheckCircleIcon className="h-3.5 w-3.5 mr-1" />
                  Completed
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Requests */}
      {maintenanceRequests.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 px-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700"
        >
          <WrenchScrewdriverIcon className="mx-auto h-16 w-16 text-neutral-400" />
          <h3 className="mt-4 text-lg font-medium text-neutral-900 dark:text-white">No maintenance requests</h3>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
            You haven't submitted any maintenance requests yet.
          </p>
          <div className="mt-6">
            <Button 
              onClick={() => navigate('/tenant/maintenance/new')}
              leftIcon={<PlusIcon className="h-5 w-5" />}
              size="lg"
            >
              Submit Your First Request
            </Button>
          </div>
        </motion.div>
      ) : filteredRequests.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 px-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700"
        >
          <FunnelIcon className="mx-auto h-16 w-16 text-neutral-400" />
          <h3 className="mt-4 text-lg font-medium text-neutral-900 dark:text-white">No matching requests</h3>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
            No maintenance requests match your current filters. Try adjusting your search criteria.
          </p>
          <div className="mt-6">
            <Button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
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
          cols={{ xs: 1, sm: 2, md: 3, lg: 3 }}
          gap={{ xs: 4, sm: 4, md: 6 }}
        >
          {filteredRequests.map((request) => (
            <MaintenanceRequestCard key={request.id} request={request} />
          ))}
        </ResponsiveGrid>
      )}
    </motion.div>
  );
};

export default MaintenanceRequestList; 