import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { useAuth } from '../../utils/auth-context';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';
import LoadingSpinner from '../ui/LoadingSpinner';
import { 
  BuildingOfficeIcon, 
  UserIcon, 
  CalendarIcon, 
  BanknotesIcon, 
  BriefcaseIcon, 
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  HomeIcon,
  MapPinIcon,
  IdentificationIcon,
  CurrencyDollarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface ApplicationData {
  id: number;
  property_id: number;
  tenant_id: number;
  landlord_id: number;
  status: string;
  move_in_date: string;
  monthly_income: number;
  employment_status: string;
  employer: string;
  additional_notes: string;
  created_at: string;
  property_title: string;
  property_address: string;
  property_city: string;
  property_rent: number;
  tenant_name: string;
  tenant_email: string;
  tenant_phone: string;
}

const StatusBadge = ({ status }: { status: string }) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-amber-100 text-amber-800 border border-amber-200">
          <ClockIcon className="w-4 h-4 mr-2" />
          Pending
        </span>
      );
    case 'approved':
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
          <CheckCircleIcon className="w-4 h-4 mr-2" />
          Approved
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
          <XCircleIcon className="w-4 h-4 mr-2" />
          Rejected
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-neutral-100 text-neutral-800 border border-neutral-200">
          {status}
        </span>
      );
  }
};

const ApplicationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [leaseStartDate, setLeaseStartDate] = useState('');
  const [leaseEndDate, setLeaseEndDate] = useState('');

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      try {
        const response = await api.get(`/api/applications/${id}`);
        setApplication(response.data.data);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching application details:', err);
        setError('Failed to load application details. Please try again later.');
        setLoading(false);
      }
    };

    fetchApplicationDetails();
  }, [id]);

  const handleOpenModal = (type: 'approve' | 'reject') => {
    setActionType(type);
    setShowModal(true);
    
    // Set default lease dates for approval
    if (type === 'approve' && application) {
      const moveInDate = new Date(application.move_in_date);
      setLeaseStartDate(application.move_in_date);
      
      // Set default lease end date to 12 months after move-in
      const endDate = new Date(moveInDate);
      endDate.setFullYear(endDate.getFullYear() + 1);
      setLeaseEndDate(endDate.toISOString().split('T')[0]);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setActionType(null);
  };

  const handleSubmitAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!application || !actionType) return;
    
    setActionLoading(true);
    
    try {
      const payload = {
        status: actionType === 'approve' ? 'approved' : 'rejected',
        leaseStartDate: actionType === 'approve' ? leaseStartDate : undefined,
        leaseEndDate: actionType === 'approve' ? leaseEndDate : undefined
      };
      
      await api.put(`/api/applications/${id}/status`, payload);
      
      // Update local state
      setApplication(prev => prev ? { ...prev, status: payload.status } : null);
      setShowModal(false);
      setActionLoading(false);
      
    } catch (err: any) {
      console.error(`Error ${actionType}ing application:`, err);
      setError(`Failed to ${actionType} application. Please try again later.`);
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 py-12">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-neutral-600 dark:text-neutral-400 animate-pulse">Loading application details...</p>
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

  if (!application) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5"
      >
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
          <p className="text-amber-700 dark:text-amber-400">Application not found</p>
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
          Back to Applications
        </Button>
      </motion.div>

      {/* Application Status Card */}
      <div className="relative bg-white dark:bg-neutral-800 rounded-2xl shadow-lg overflow-hidden mb-8">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-500 to-primary-600"></div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mr-3">
                    Application #{application.id}
                  </h1>
                  <StatusBadge status={application.status} />
                </div>
                <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                  Submitted on {new Date(application.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            
            {user?.role === 'landlord' && application.status === 'pending' && (
              <div className="flex gap-2 mt-4 md:mt-0">
                <Button 
                  variant="success" 
                  onClick={() => handleOpenModal('approve')}
                  leftIcon={<CheckCircleIcon className="h-5 w-5" />}
                >
                  Approve
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleOpenModal('reject')}
                  leftIcon={<XCircleIcon className="h-5 w-5" />}
                >
                  Reject
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid md:grid-cols-12 gap-6">
        {/* Property Information */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-7"
        >
          <Card className="h-full overflow-hidden">
            <CardHeader className="bg-primary-50 dark:bg-primary-900/10 border-b border-primary-100 dark:border-primary-800/30 p-5">
              <div className="flex items-center">
                <BuildingOfficeIcon className="h-5 w-5 text-primary-600 mr-2" />
                <h2 className="text-lg font-semibold text-primary-900 dark:text-primary-100">Property Details</h2>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-700">
                <div className="w-full md:w-24 h-24 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BuildingOfficeIcon className="h-12 w-12 text-neutral-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">{application.property_title}</h3>
                  <div className="flex items-center mt-1 text-neutral-600 dark:text-neutral-400">
                    <MapPinIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
                    <p>{application.property_address}, {application.property_city}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Monthly Rent</p>
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-5 w-5 text-primary-600 mr-1" />
                    <p className="text-lg font-semibold text-primary-600 dark:text-primary-400">Ksh {application.property_rent.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-1">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Desired Move-in Date</p>
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 text-neutral-500 mr-1.5" />
                    <p className="font-medium text-neutral-900 dark:text-white">
                      {new Date(application.move_in_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-1">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Application Status</p>
                  <StatusBadge status={application.status} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Tenant Information */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-5"
        >
          <Card className="h-full overflow-hidden">
            <CardHeader className="bg-primary-50 dark:bg-primary-900/10 border-b border-primary-100 dark:border-primary-800/30 p-5">
              <div className="flex items-center">
                <UserIcon className="h-5 w-5 text-primary-600 mr-2" />
                <h2 className="text-lg font-semibold text-primary-900 dark:text-primary-100">Tenant Information</h2>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-6">
              <div className="flex items-center gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-700">
                <div className="h-14 w-14 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
                  <UserIcon className="h-7 w-7 text-neutral-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{application.tenant_name}</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">{application.tenant_email}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {application.tenant_phone && (
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">Phone Number</p>
                      <p className="font-medium text-neutral-900 dark:text-white">{application.tenant_phone}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mr-3">
                    <CalendarIcon className="h-4 w-4 text-neutral-600" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Application Date</p>
                    <p className="font-medium text-neutral-900 dark:text-white">
                      {new Date(application.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mr-3">
                    <IdentificationIcon className="h-4 w-4 text-neutral-600" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Tenant ID</p>
                    <p className="font-medium text-neutral-900 dark:text-white">#{application.tenant_id}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Financial Information */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="overflow-hidden">
          <CardHeader className="bg-primary-50 dark:bg-primary-900/10 border-b border-primary-100 dark:border-primary-800/30 p-5">
            <div className="flex items-center">
              <BanknotesIcon className="h-5 w-5 text-primary-600 mr-2" />
              <h2 className="text-lg font-semibold text-primary-900 dark:text-primary-100">Financial & Employment Information</h2>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                  <div className="flex items-center mb-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full mr-3">
                      <BanknotesIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">Monthly Income</p>
                      <p className="text-lg font-semibold text-neutral-900 dark:text-white">Ksh {application.monthly_income.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">Income to Rent Ratio</p>
                    <div className="flex items-center">
                      <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2.5 mr-2">
                        <div 
                          className={`h-2.5 rounded-full ${
                            application.monthly_income / application.property_rent >= 3 
                              ? 'bg-green-500' 
                              : application.monthly_income / application.property_rent >= 2
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(100, (application.monthly_income / application.property_rent) * 33)}%` }}
                        ></div>
                      </div>
                      <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                        {(application.monthly_income / application.property_rent).toFixed(1)}x
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      {application.monthly_income / application.property_rent >= 3 
                        ? 'Excellent ratio (3x or higher is ideal)'
                        : application.monthly_income / application.property_rent >= 2
                          ? 'Good ratio (2x-3x is acceptable)'
                          : 'Low ratio (below 2x may be risky)'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                  <div className="flex items-center mb-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mr-3">
                      <BriefcaseIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">Employment Status</p>
                      <p className="font-medium text-neutral-900 dark:text-white">{application.employment_status}</p>
                    </div>
                  </div>
                  
                  {application.employer && (
                    <div className="flex items-center">
                      <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-full mr-3">
                        <BuildingOfficeIcon className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                      </div>
                      <div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Employer</p>
                        <p className="font-medium text-neutral-900 dark:text-white">{application.employer}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Additional Notes */}
      {application.additional_notes && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="bg-primary-50 dark:bg-primary-900/10 border-b border-primary-100 dark:border-primary-800/30 p-5">
              <div className="flex items-center">
                <DocumentTextIcon className="h-5 w-5 text-primary-600 mr-2" />
                <h2 className="text-lg font-semibold text-primary-900 dark:text-primary-100">Additional Notes</h2>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-line">{application.additional_notes}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
      
      {/* Action Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[1000] overflow-y-auto">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-md w-full overflow-hidden relative z-[1001]"
            >
              <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {actionType === 'approve' ? 'Approve Application' : 'Reject Application'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmitAction} className="p-6">
                {actionType === 'approve' ? (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="lease-start" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Lease Start Date
                      </label>
                      <input
                        type="date"
                        id="lease-start"
                        value={leaseStartDate}
                        onChange={(e) => setLeaseStartDate(e.target.value)}
                        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="lease-end" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Lease End Date
                      </label>
                      <input
                        type="date"
                        id="lease-end"
                        value={leaseEndDate}
                        onChange={(e) => setLeaseEndDate(e.target.value)}
                        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      This will approve the application and notify the tenant.
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                      Are you sure you want to reject this application? This action cannot be undone.
                    </p>
                  </div>
                )}
                
                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    variant="ghost"
                    onClick={handleCloseModal}
                    size="md"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant={actionType === 'approve' ? 'success' : 'destructive'}
                    size="md"
                    loading={actionLoading}
                  >
                    {actionType === 'approve' ? 'Approve' : 'Reject'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ApplicationDetails; 