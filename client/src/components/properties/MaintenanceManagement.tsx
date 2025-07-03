import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { useAuth } from '../../utils/auth-context';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';
import { Input } from '../ui/Input';
import LoadingSpinner from '../ui/LoadingSpinner';
import ResponsiveTable from '../ui/ResponsiveTable';
import ResponsiveGrid from '../ui/ResponsiveGrid';
import { 
  WrenchScrewdriverIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ArrowPathIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  UserIcon,
  CalendarIcon,
  EyeIcon,
  PencilSquareIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface MaintenanceRequest {
  id: number;
  title: string;
  description: string;
  property_id: number;
  property_name: string;
  tenant_id: number;
  tenant_name: string;
  status: string;
  priority: string;
  type: string;
  request_date: string;
  updated_at: string;
}

const MaintenanceManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // For status update modal
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);

  // For filtering
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMaintenanceRequests = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/maintenance');
        setMaintenanceRequests(response.data.data || []);
      } catch (err) {
        console.error('Failed to fetch maintenance requests:', err);
        setError('Failed to load maintenance requests. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'landlord') {
      fetchMaintenanceRequests();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Apply filters
    let filtered = maintenanceRequests;
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(request => request.status === filterStatus);
    }
    
    if (filterPriority !== 'all') {
      filtered = filtered.filter(request => request.priority === filterPriority);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(request => 
        request.title.toLowerCase().includes(term) || 
        request.property_name.toLowerCase().includes(term) ||
        request.tenant_name.toLowerCase().includes(term)
      );
    }
    
    // Sort by priority and date
    filtered = [...filtered].sort((a, b) => {
      // First by priority (high, medium, low)
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority as keyof typeof priorityOrder] - 
                           priorityOrder[b.priority as keyof typeof priorityOrder];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by date (newest first)
      return new Date(b.request_date).getTime() - new Date(a.request_date).getTime();
    });
    
    setFilteredRequests(filtered);
  }, [maintenanceRequests, filterStatus, filterPriority, searchTerm]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
            <ClockIcon className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
            <ArrowPathIcon className="w-3 h-3 mr-1" />
            In Progress
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
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
            <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
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

  const handleShowUpdateModal = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    setNewStatus(request.status);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
    setNewStatus('');
  };

  const handleUpdateStatus = async () => {
    if (!selectedRequest || !newStatus) return;
    
    setUpdateLoading(true);
    try {
      await api.put(`/api/maintenance/${selectedRequest.id}`, { status: newStatus });
      
      // Update the local state
      const updatedRequests = maintenanceRequests.map(req => 
        req.id === selectedRequest.id ? { ...req, status: newStatus } : req
      );
      
      setMaintenanceRequests(updatedRequests);
      setSuccess(`Maintenance request status updated to ${newStatus}`);
      
      // Close the modal
      handleCloseModal();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Failed to update maintenance request status:', err);
      setError('Failed to update status. Please try again.');
    } finally {
      setUpdateLoading(false);
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
          <UserIcon className="h-4 w-4 text-neutral-500 mt-0.5" />
          <span className="text-sm text-neutral-700 dark:text-neutral-300">{request.tenant_name}</span>
        </div>
        
        <div className="flex items-center justify-between text-xs text-neutral-500 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center">
            <CalendarIcon className="h-3 w-3 mr-1" />
            <span>{new Date(request.request_date).toLocaleDateString()}</span>
          </div>
          <div>{getPriorityBadge(request.priority)}</div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-neutral-50 dark:bg-neutral-800/50 p-3 border-t border-neutral-100 dark:border-neutral-700 flex space-x-2">
        <Button
          onClick={() => handleShowUpdateModal(request)}
          leftIcon={<PencilSquareIcon className="h-4 w-4" />}
          variant="outline"
          size="sm"
          className="flex-1"
        >
          Update
        </Button>
        <Button
          onClick={() => navigate(`/landlord/maintenance/${request.id}`)}
          leftIcon={<EyeIcon className="h-4 w-4" />}
          variant="default"
          size="sm"
          className="flex-1"
        >
          Details
        </Button>
      </CardFooter>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg">
        Please log in to view maintenance requests.
      </div>
    );
  }

  if (user.role !== 'landlord') {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg">
        Only landlords can access this page.
      </div>
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
          <div className="w-full">
            <h1 className="text-3xl font-bold text-white mb-2">Maintenance Requests</h1>
            <p className="text-primary-100 break-words">
              Manage and track maintenance requests for your properties
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              {success}
            </div>
            <button 
              onClick={() => setSuccess(null)}
              className="text-green-700 hover:text-green-900"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <Card className="overflow-hidden">
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Search</label>
              <Input
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
              />
            </div>
            
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Filter by Status</label>
              <div className="relative">
                <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 appearance-none border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            
            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Filter by Priority</label>
              <div className="relative">
                <ExclamationTriangleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 appearance-none border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Clear Filters Button */}
          {(filterStatus !== 'all' || filterPriority !== 'all' || searchTerm) && (
            <div className="mt-4 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterStatus('all');
                  setFilterPriority('all');
                  setSearchTerm('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Maintenance Requests Grid */}
      <div className="mb-8">
        {maintenanceRequests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 px-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700"
          >
            <WrenchScrewdriverIcon className="mx-auto h-16 w-16 text-neutral-400" />
            <h3 className="mt-4 text-lg font-medium text-neutral-900 dark:text-white">No maintenance requests</h3>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
              You don't have any maintenance requests yet.
            </p>
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
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setFilterStatus('all');
                setFilterPriority('all');
                setSearchTerm('');
              }}
            >
              Clear filters
            </Button>
          </motion.div>
        ) : (
          <ResponsiveGrid
            cols={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 4 }}
            gap={{ xs: 4, sm: 4, md: 6 }}
          >
            {filteredRequests.map((request) => (
              <MaintenanceRequestCard key={request.id} request={request} />
            ))}
          </ResponsiveGrid>
        )}
      </div>

      {/* Status Update Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)}></div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-md w-full overflow-hidden relative z-[101]"
          >
            <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Update Maintenance Request Status
              </h3>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-neutral-400 hover:text-neutral-500 focus:outline-none"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Request</p>
                <p className="font-medium text-neutral-900 dark:text-white">{selectedRequest.title}</p>
              </div>
              
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Property</p>
                  <p className="font-medium text-neutral-900 dark:text-white">{selectedRequest.property_name}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Tenant</p>
                  <p className="font-medium text-neutral-900 dark:text-white">{selectedRequest.tenant_name}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Current Status</p>
                {getStatusBadge(selectedRequest.status)}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 p-6 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-700">
              <Button
                variant="ghost"
                onClick={handleCloseModal}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleUpdateStatus}
                loading={updateLoading}
              >
                Update Status
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default MaintenanceManagement; 