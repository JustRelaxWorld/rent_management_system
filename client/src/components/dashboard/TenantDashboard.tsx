import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../utils/auth-context';
import { 
  BuildingOfficeIcon, 
  WrenchIcon, 
  CurrencyDollarIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';

const TenantDashboard: React.FC = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get properties rented by tenant
        try {
          const propertiesResponse = await api.get('/api/properties/tenant');
          setProperties(propertiesResponse.data.data || []);
        } catch (err) {
          console.error('Failed to load properties:', err);
        }

        // Get invoices
        try {
          const invoicesResponse = await api.get('/api/invoices');
          setInvoices(invoicesResponse.data.data || []);
        } catch (err) {
          console.error('Failed to load invoices:', err);
        }

        // Get maintenance requests
        try {
          const maintenanceResponse = await api.get('/api/maintenance');
          setMaintenanceRequests(maintenanceResponse.data.data || []);
        } catch (err) {
          console.error('Failed to load maintenance requests:', err);
        }

        setLoading(false);
      } catch (err: any) {
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        <p className="ml-3 text-lg text-neutral-600 dark:text-neutral-400">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationCircleIcon className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">Please log in to view your dashboard.</p>
          </div>
        </div>
      </Card>
    );
  }
  
  // Calculate statistics
  const pendingInvoices = invoices.filter(invoice => invoice.status === 'pending');
  const totalDue = pendingInvoices.reduce((sum, invoice) => sum + parseFloat(invoice.amount), 0);
  const pendingMaintenanceCount = maintenanceRequests.filter(req => req.status !== 'completed').length;
  const completedMaintenanceCount = maintenanceRequests.filter(req => req.status === 'completed').length;

  // Prepare chart data
  const paymentStatusData = [
    { name: 'Paid', value: invoices.filter(invoice => invoice.status === 'paid').length, color: '#10b981' },
    { name: 'Pending', value: invoices.filter(invoice => invoice.status === 'pending').length, color: '#f59e0b' },
    { name: 'Overdue', value: invoices.filter(invoice => invoice.status === 'overdue').length, color: '#ef4444' }
  ];

  const maintenanceData = [
    { name: 'Pending', value: maintenanceRequests.filter(req => req.status === 'pending').length, color: '#f59e0b' },
    { name: 'In Progress', value: maintenanceRequests.filter(req => req.status === 'in_progress').length, color: '#3b82f6' },
    { name: 'Completed', value: maintenanceRequests.filter(req => req.status === 'completed').length, color: '#10b981' }
  ];

  // Process payment history data from invoices
  const getPaymentHistoryData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    // Initialize data with all months
    const monthlyData = months.map(month => ({
      month,
      amount: 0
    }));
    
    // Calculate paid amounts from invoices
    invoices.forEach(invoice => {
      if (invoice.status === 'paid') {
        const invoiceDate = new Date(invoice.payment_date || invoice.due_date);
        if (invoiceDate.getFullYear() === currentYear) {
          const monthIndex = invoiceDate.getMonth();
          monthlyData[monthIndex].amount += parseFloat(invoice.amount || 0);
        }
      }
    });
    
    // Return only the last 6 months for better visualization
    return monthlyData.slice(-6);
  };

  const paymentHistoryData = getPaymentHistoryData();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Tenant Dashboard</h1>
        <p className="mt-2 text-lg text-neutral-600 dark:text-neutral-400">Welcome back, {user?.name}!</p>
      </div>

      {/* Stats Overview */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {/* User Profile */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary-100 dark:bg-primary-900 rounded-md p-3">
                  <BuildingOfficeIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400 truncate">My Profile</dt>
                    <dd>
                      <div className="text-lg font-semibold text-neutral-900 dark:text-white">{user?.name}</div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">{user?.email}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-700 px-5 py-3">
              <div className="text-sm">
                <Link to="/profile/edit" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 flex items-center justify-between">
                  Edit Profile
                  <ChevronRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Payment Status */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-100 dark:bg-red-900 rounded-md p-3">
                  <CurrencyDollarIcon className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400 truncate">Total Due</dt>
                    <dd>
                      <div className="text-lg font-semibold text-neutral-900 dark:text-white">Ksh {totalDue.toFixed(2)}</div>
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-amber-600 dark:text-amber-400 font-medium">{pendingInvoices.length}</span>
                    <span className="text-neutral-500 dark:text-neutral-400 ml-1">Pending</span>
                  </div>
                  <div>
                    <span className="text-red-600 dark:text-red-400 font-medium">{invoices.filter(invoice => invoice.status === 'overdue').length}</span>
                    <span className="text-neutral-500 dark:text-neutral-400 ml-1">Overdue</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-700 px-5 py-3">
              <div className="text-sm">
                <Link to="/tenant/payments" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 flex items-center justify-between">
                  Make a payment
                  <ChevronRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Maintenance Requests */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-amber-100 dark:bg-amber-900 rounded-md p-3">
                  <WrenchIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400 truncate">Maintenance</dt>
                    <dd>
                      <div className="text-lg font-semibold text-neutral-900 dark:text-white">{maintenanceRequests.length}</div>
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-amber-600 dark:text-amber-400 font-medium">{pendingMaintenanceCount}</span>
                    <span className="text-neutral-500 dark:text-neutral-400 ml-1">Pending</span>
                  </div>
                  <div>
                    <span className="text-green-600 dark:text-green-400 font-medium">{completedMaintenanceCount}</span>
                    <span className="text-neutral-500 dark:text-neutral-400 ml-1">Completed</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-700 px-5 py-3">
              <div className="text-sm">
                <Link to="/tenant/maintenance" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 flex items-center justify-between">
                  View requests
                  <ChevronRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Leased Properties */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 rounded-md p-3">
                  <BuildingOfficeIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400 truncate">Properties</dt>
                    <dd>
                      <div className="text-lg font-semibold text-neutral-900 dark:text-white">{properties.length}</div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">Currently leased</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-700 px-5 py-3">
              <div className="text-sm">
                <Link to="/tenant/properties" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 flex items-center justify-between">
                  View properties
                  <ChevronRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Status Chart */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Payment Status</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Payment History Chart */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Payment History</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={paymentHistoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Quick Actions</h2>
          </div>
          <div className="p-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            <Link 
              to="/tenant/payments" 
              className="flex flex-col items-center p-4 border border-neutral-200 dark:border-neutral-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-200 dark:hover:border-primary-700 transition-colors"
            >
              <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full">
                <CurrencyDollarIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <span className="mt-2 text-sm font-medium text-neutral-900 dark:text-white">Make Payment</span>
            </Link>
            
            <Link 
              to="/tenant/maintenance/new" 
              className="flex flex-col items-center p-4 border border-neutral-200 dark:border-neutral-600 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-200 dark:hover:border-amber-700 transition-colors"
            >
              <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-full">
                <WrenchIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="mt-2 text-sm font-medium text-neutral-900 dark:text-white">Request Maintenance</span>
            </Link>
            
            <Link 
              to="/tenant/properties" 
              className="flex flex-col items-center p-4 border border-neutral-200 dark:border-neutral-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-700 transition-colors"
            >
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <BuildingOfficeIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="mt-2 text-sm font-medium text-neutral-900 dark:text-white">View Properties</span>
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default TenantDashboard; 