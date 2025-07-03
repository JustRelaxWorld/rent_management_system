import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../utils/auth-context';
import { 
  BuildingOfficeIcon, 
  UserGroupIcon, 
  DocumentTextIcon, 
  WrenchIcon, 
  CurrencyDollarIcon,
  PlusIcon,
  ChevronRightIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  BellIcon,
  ClipboardDocumentCheckIcon,
  ChartBarIcon
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
  Line,
  Legend
} from 'recharts';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import StatsCard from '../ui/StatsCard';
import ChartCard from '../ui/ChartCard';
import ActionCard from '../ui/ActionCard';
import EmptyState from '../ui/EmptyState';

const LandlordDashboard: React.FC = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rentTimeRange, setRentTimeRange] = useState('6M');
  const [occupancyTimeRange, setOccupancyTimeRange] = useState('Current');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!user) return;

        // Get properties owned by landlord - using try/catch for each API call
        try {
          const propertiesResponse = await api.get(`/api/properties/landlord/${user.id}`);
          setProperties(propertiesResponse.data.data || []);
        } catch (err) {
          console.error('Failed to load properties:', err);
          // Continue with other requests even if this one fails
        }

        // Get all invoices for properties
        try {
          const invoicesResponse = await api.get('/api/invoices');
          setInvoices(invoicesResponse.data.data || []);
        } catch (err) {
          console.error('Failed to load invoices:', err);
          // Continue with other requests even if this one fails
        }

        // Get maintenance requests
        try {
          const maintenanceResponse = await api.get('/api/maintenance');
          setMaintenanceRequests(maintenanceResponse.data.data || []);
        } catch (err) {
          console.error('Failed to load maintenance requests:', err);
          // Continue with other requests even if this one fails
        }

        // Get tenants
        try {
          const tenantsResponse = await api.get('/api/users?role=tenant');
          setTenants(tenantsResponse.data.data || []);
        } catch (err) {
          console.error('Failed to load tenants:', err);
          // Continue with other requests even if this one fails
        }

        // Get applications
        try {
          const applicationsResponse = await api.get('/api/applications/landlord');
          setApplications(applicationsResponse.data.data || []);
        } catch (err) {
          console.error('Failed to load applications:', err);
          // Continue with other requests even if this one fails
        }

        setLoading(false);
      } catch (err: any) {
        setError('Failed to load dashboard data');
        setLoading(false);
        console.error('Dashboard error:', err);
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
  const totalProperties = properties.length;
  const occupiedProperties = properties.filter(property => !property.is_available).length;
  const vacantProperties = totalProperties - occupiedProperties;
  const totalRent = properties.reduce((sum, property) => sum + parseFloat(property.rent_amount || 0), 0);
  const pendingPayments = invoices.filter(invoice => invoice.status === 'pending').length;
  const pendingMaintenanceRequests = maintenanceRequests.filter(req => req.status !== 'completed').length;
  const pendingApplications = applications.filter(app => app.status === 'pending').length;

  // Calculate occupancy rate
  const occupancyRate = totalProperties > 0 
    ? Math.round((occupiedProperties / totalProperties) * 100) 
    : 0;

  // Calculate rent collection rate
  const totalExpectedRent = totalRent;
  const totalCollectedRent = invoices
    .filter(invoice => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + parseFloat(invoice.amount || 0), 0);
  const rentCollectionRate = totalExpectedRent > 0 
    ? Math.round((totalCollectedRent / totalExpectedRent) * 100) 
    : 0;

  // Prepare chart data
  const occupancyData = [
    { name: 'Occupied', value: occupiedProperties, color: '#0ea5e9' },
    { name: 'Vacant', value: vacantProperties, color: '#f59e0b' }
  ];

  const maintenanceData = [
    { name: 'Pending', value: maintenanceRequests.filter(req => req.status === 'pending').length, color: '#f59e0b' },
    { name: 'In Progress', value: maintenanceRequests.filter(req => req.status === 'in_progress').length, color: '#3b82f6' },
    { name: 'Completed', value: maintenanceRequests.filter(req => req.status === 'completed').length, color: '#10b981' }
  ];

  // Get monthly data from invoices
  const getMonthlyRentData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    // Initialize data with all months
    const monthlyData = months.map(month => ({
      name: month,
      expected: 0,
      collected: 0
    }));
    
    // Calculate expected rent (total rent for all properties)
    properties.forEach(property => {
      const rentAmount = parseFloat(property.rent_amount || 0);
      monthlyData.forEach(data => {
        data.expected += rentAmount;
      });
    });
    
    // Calculate collected rent from invoices
    invoices.forEach(invoice => {
      if (invoice.status === 'paid') {
        const invoiceDate = new Date(invoice.payment_date || invoice.due_date);
        if (invoiceDate.getFullYear() === currentYear) {
          const monthIndex = invoiceDate.getMonth();
          monthlyData[monthIndex].collected += parseFloat(invoice.amount || 0);
        }
      }
    });
    
    // Return based on selected time range
    switch (rentTimeRange) {
      case '3M':
        return monthlyData.slice(-3);
      case '6M':
        return monthlyData.slice(-6);
      case 'YTD':
        return monthlyData.slice(0, new Date().getMonth() + 1);
      case '1Y':
      default:
        return monthlyData;
    }
  };

  const monthlyRentData = getMonthlyRentData();

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-neutral-800 p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-neutral-900 dark:text-white">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString('en-US', { style: 'currency', currency: 'KES' })}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieChartTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-neutral-800 p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg">
          <p className="text-sm font-medium" style={{ color: payload[0].payload.color }}>
            {payload[0].name}: {payload[0].value}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {Math.round((payload[0].value / (occupiedProperties + vacantProperties)) * 100)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Landlord Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Welcome back, {user?.name}! Here's what's happening with your properties today.
          </p>
        </div>
        <div>
          <Link to="/landlord/properties/add">
            <Button 
              variant="default" 
              size="sm" 
              leftIcon={<PlusIcon className="h-4 w-4" />}
            >
              Add Property
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {/* Total Properties */}
        <motion.div variants={itemVariants}>
          <StatsCard
            title="Properties"
            value={totalProperties}
            description={`${occupiedProperties} occupied, ${vacantProperties} vacant`}
            icon={<BuildingOfficeIcon className="h-6 w-6" />}
            iconColor="blue"
            trend={5}
            trendLabel="vs last month"
            linkHref="/landlord/properties"
            linkLabel="Manage properties"
          />
        </motion.div>

        {/* Monthly Rent */}
        <motion.div variants={itemVariants}>
          <StatsCard
            title="Monthly Rent"
            value={`Ksh ${totalRent.toLocaleString()}`}
            description="Expected monthly"
            icon={<CurrencyDollarIcon className="h-6 w-6" />}
            iconColor="green"
            trend={rentCollectionRate - 100}
            trendLabel="collection rate"
            linkHref="/landlord/payments"
            linkLabel="View payments"
          />
        </motion.div>

        {/* Applications */}
        <motion.div variants={itemVariants}>
          <StatsCard
            title="Applications"
            value={pendingApplications}
            description="Pending review"
            icon={<DocumentTextIcon className="h-6 w-6" />}
            iconColor="amber"
            linkHref="/landlord/applications"
            linkLabel="View applications"
          />
        </motion.div>

        {/* Maintenance Requests */}
        <motion.div variants={itemVariants}>
          <StatsCard
            title="Maintenance"
            value={pendingMaintenanceRequests}
            description="Pending requests"
            icon={<WrenchIcon className="h-6 w-6" />}
            iconColor="red"
            linkHref="/landlord/maintenance"
            linkLabel="Manage requests"
          />
        </motion.div>
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Property Occupancy Chart */}
        <ChartCard
          title="Property Occupancy"
          description={`${occupancyRate}% of your properties are currently occupied`}
          timeRanges={['Current', 'Historical']}
          onTimeRangeChange={setOccupancyTimeRange}
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={occupancyData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {occupancyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<PieChartTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Monthly Rent Collection Chart */}
        <ChartCard
          title="Monthly Rent Collection"
          description="Expected vs. collected rent amounts"
          timeRanges={['3M', '6M', 'YTD', '1Y']}
          onTimeRangeChange={setRentTimeRange}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyRentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="expected" fill="#f59e0b" name="Expected" />
              <Bar dataKey="collected" fill="#10b981" name="Collected" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Quick Actions */}
      <div>
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ActionCard
                icon={<PlusIcon className="h-6 w-6" />}
                title="Add Property"
                description="List a new rental property"
                href="/landlord/properties/add"
                color="blue"
              />
              
              <ActionCard
                icon={<DocumentTextIcon className="h-6 w-6" />}
                title="Review Applications"
                description={`${pendingApplications} pending applications`}
                href="/landlord/applications"
                color="amber"
              />
              
              <ActionCard
                icon={<WrenchIcon className="h-6 w-6" />}
                title="Maintenance Requests"
                description={`${pendingMaintenanceRequests} pending requests`}
                href="/landlord/maintenance"
                color="red"
              />
              
              <ActionCard
                icon={<ChartBarIcon className="h-6 w-6" />}
                title="View Analytics"
                description="Property performance insights"
                href="/landlord/analytics"
                color="purple"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Recent Activity</h2>
          </div>
          <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
            <div className="px-6 py-4 flex items-start">
              <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/30 rounded-full p-2">
                <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-900 dark:text-white">Rent payment received</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">John Doe paid Ksh 25,000 for Property #1234</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">2 hours ago</p>
              </div>
            </div>
            
            <div className="px-6 py-4 flex items-start">
              <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 rounded-full p-2">
                <DocumentTextIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-900 dark:text-white">New application received</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Mary Smith applied for Property #5678</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">1 day ago</p>
              </div>
            </div>
            
            <div className="px-6 py-4 flex items-start">
              <div className="flex-shrink-0 bg-red-100 dark:bg-red-900/30 rounded-full p-2">
                <WrenchIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-900 dark:text-white">Maintenance request updated</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Plumbing issue at Property #1234 marked as in-progress</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">2 days ago</p>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-700">
            <Link 
              to="/landlord/activity"
              className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 flex items-center"
            >
              View all activity
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </Card>

        {/* Upcoming Events */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Upcoming Events</h2>
          </div>
          
          {/* If there are no events, show empty state */}
          {true ? (
            <div className="p-6">
              <EmptyState
                title="No upcoming events"
                description="You don't have any scheduled events. Add a reminder or schedule an inspection."
                icon={<CalendarIcon className="h-8 w-8 text-neutral-500 dark:text-neutral-400" />}
                actionLabel="Add Event"
                actionHref="/landlord/calendar/add"
                variant="compact"
              />
            </div>
          ) : (
            <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {/* Event items would go here */}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

// Button component
const Button: React.FC<{
  variant?: 'default' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({
  variant = 'default',
  size = 'md',
  leftIcon,
  rightIcon,
  children,
  className = '',
  onClick
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200';
  
  const variantClasses = {
    default: 'bg-primary-600 hover:bg-primary-700 text-white',
    secondary: 'bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-900 dark:text-white',
    outline: 'border border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20'
  };
  
  const sizeClasses = {
    sm: 'text-xs px-3 py-2',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-5 py-2.5'
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
    >
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

export default LandlordDashboard; 