import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { useAuth } from '../../utils/auth-context';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';
import LoadingSpinner from '../ui/LoadingSpinner';
import ResponsiveGrid from '../ui/ResponsiveGrid';
import { Input } from '../ui/Input';
import { 
  DocumentTextIcon, 
  CalendarIcon, 
  UserIcon, 
  BuildingOfficeIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface Application {
  id: number;
  property_id: number;
  tenant_id: number;
  status: string;
  move_in_date: string;
  created_at: string;
  property_title: string;
  property_address: string;
  property_city: string;
  property_rent: number;
  tenant_name: string;
  tenant_email: string;
  tenant_phone: string;
}

const LandlordApplicationList: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/applications/landlord');
        
        if (response.data.data) {
          setApplications(response.data.data);
          setFilteredApplications(response.data.data);
        } else {
          setApplications([]);
          setFilteredApplications([]);
        }
      } catch (err: any) {
        setError(`Failed to load applications: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'landlord') {
      fetchApplications();
    } else {
      setLoading(false);
      setError('You must be logged in as a landlord to view applications');
    }
  }, [user]);

  useEffect(() => {
    // Filter applications based on status and search term
    let filtered = applications;
    
    if (filter !== 'all') {
      filtered = filtered.filter(app => app.status === filter);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(app => 
        app.tenant_name.toLowerCase().includes(term) || 
        app.property_title.toLowerCase().includes(term)
      );
    }
    
    setFilteredApplications(filtered);
  }, [filter, searchTerm, applications]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
            <ClockIcon className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
            <XCircleIcon className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
            Unknown
          </span>
        );
    }
  };

  const ApplicationCard = ({ application }: { application: Application }) => (
    <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300">
      <CardHeader className="flex justify-between items-center p-4 bg-white border-b border-neutral-100 dark:border-neutral-700">
        <div className="flex items-center">
          <DocumentTextIcon className="h-5 w-5 text-primary-500 mr-2" />
          <span className="font-medium">Application #{application.id}</span>
        </div>
        <div className="z-[1] relative">
          {getStatusBadge(application.status)}
        </div>
      </CardHeader>
      
      <CardContent className="p-5">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
            {application.property_title}
          </h3>
          <div className="flex items-center text-sm text-neutral-500">
            <BuildingOfficeIcon className="h-4 w-4 mr-1" />
            <span>{application.property_address}, {application.property_city}</span>
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center">
            <UserIcon className="h-4 w-4 text-neutral-500 mr-2" />
            <span className="text-neutral-700 dark:text-neutral-300">{application.tenant_name}</span>
          </div>
          <div className="flex items-center">
            <EnvelopeIcon className="h-4 w-4 text-neutral-500 mr-2" />
            <span className="text-neutral-700 dark:text-neutral-300">{application.tenant_email}</span>
          </div>
          <div className="flex items-center">
            <PhoneIcon className="h-4 w-4 text-neutral-500 mr-2" />
            <span className="text-neutral-700 dark:text-neutral-300">{application.tenant_phone || 'Not provided'}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center text-sm text-neutral-500 border-t border-neutral-100 dark:border-neutral-800 pt-3">
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-1" />
            <span>Move-in: {new Date(application.move_in_date).toLocaleDateString()}</span>
          </div>
          <div>Applied: {new Date(application.created_at).toLocaleDateString()}</div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-neutral-50 dark:bg-neutral-800/50 p-4 border-t border-neutral-100 dark:border-neutral-700">
        <Button
          onClick={() => navigate(`/landlord/applications/${application.id}`)}
          leftIcon={<EyeIcon className="h-4 w-4" />}
          variant="default"
          size="sm"
          className="w-full"
        >
          View Details
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
          <div className="max-w-full overflow-hidden">
            <h1 className="text-3xl font-bold text-white mb-2">Rental Applications</h1>
            <p className="text-primary-100 break-words">
              Manage and review tenant applications for your properties
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs and Search */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            {/* Search */}
            <div className="w-full sm:max-w-xs">
              <Input
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
              />
            </div>
            
            {/* Filter Tabs */}
            <div className="flex space-x-2">
              <Button
                variant={filter === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'pending' ? 'warning' : 'ghost'}
                size="sm"
                onClick={() => setFilter('pending')}
                leftIcon={<ClockIcon className="h-4 w-4" />}
              >
                Pending
              </Button>
              <Button
                variant={filter === 'approved' ? 'success' : 'ghost'}
                size="sm"
                onClick={() => setFilter('approved')}
                leftIcon={<CheckCircleIcon className="h-4 w-4" />}
              >
                Approved
              </Button>
              <Button
                variant={filter === 'rejected' ? 'destructive' : 'ghost'}
                size="sm"
                onClick={() => setFilter('rejected')}
                leftIcon={<XCircleIcon className="h-4 w-4" />}
              >
                Rejected
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="mb-8">
        {applications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 px-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700"
          >
            <DocumentTextIcon className="mx-auto h-16 w-16 text-neutral-400" />
            <h3 className="mt-4 text-lg font-medium text-neutral-900 dark:text-white">No applications found</h3>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
              You don't have any rental applications yet.
            </p>
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
              No applications match your current filters. Try adjusting your search criteria.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setFilter('all');
                setSearchTerm('');
              }}
            >
              Clear filters
            </Button>
          </motion.div>
        ) : (
          <ResponsiveGrid
            cols={{ xs: 1, sm: 2, md: 2, lg: 3, xl: 3 }}
            gap={{ xs: 4, sm: 4, md: 6 }}
          >
            {filteredApplications.map((application) => (
              <ApplicationCard key={application.id} application={application} />
            ))}
          </ResponsiveGrid>
        )}
      </div>
    </motion.div>
  );
};

export default LandlordApplicationList; 