import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../utils/auth-context';
import { 
  UserIcon, 
  BuildingOfficeIcon, 
  WrenchIcon, 
  CurrencyDollarIcon,
  DocumentTextIcon,
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
  Line,
  Legend
} from 'recharts';
import { motion } from 'framer-motion';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get users
        try {
          const usersResponse = await api.get('/api/users');
          setUsers(usersResponse.data.data || []);
        } catch (err) {
          console.error('Failed to load users:', err);
        }

        // Get properties
        try {
          const propertiesResponse = await api.get('/api/properties');
          setProperties(propertiesResponse.data.data || []);
        } catch (err) {
          console.error('Failed to load properties:', err);
        }

        // Get maintenance requests
        try {
          const maintenanceResponse = await api.get('/api/maintenance');
          setMaintenanceRequests(maintenanceResponse.data.data || []);
        } catch (err) {
          console.error('Failed to load maintenance requests:', err);
        }

        // Get payments
        try {
          const paymentsResponse = await api.get('/api/payments');
          setPayments(paymentsResponse.data.data || []);
        } catch (err) {
          console.error('Failed to load payments:', err);
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        <p className="ml-3 text-lg text-neutral-600">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationCircleIcon className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">Please log in to view your dashboard.</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Calculate statistics
  const landlordCount = users.filter(user => user.role === 'landlord').length;
  const tenantCount = users.filter(user => user.role === 'tenant').length;
  const adminCount = users.filter(user => user.role === 'admin').length;
  
  const pendingMaintenanceCount = maintenanceRequests.filter(req => req.status === 'pending').length;
  const inProgressMaintenanceCount = maintenanceRequests.filter(req => req.status === 'in_progress').length;
  const completedMaintenanceCount = maintenanceRequests.filter(req => req.status === 'completed').length;
  
  const occupiedProperties = properties.filter(property => property.status === 'occupied').length;
  const vacantProperties = properties.filter(property => property.status === 'vacant').length;
  
  // Calculate total revenue
  const totalRevenue = payments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
  
  // Prepare chart data
  const userRoleData = [
    { name: 'Landlords', value: landlordCount, color: '#3b82f6' },
    { name: 'Tenants', value: tenantCount, color: '#10b981' },
    { name: 'Admins', value: adminCount, color: '#8b5cf6' }
  ];

  const propertyStatusData = [
    { name: 'Occupied', value: occupiedProperties, color: '#10b981' },
    { name: 'Vacant', value: vacantProperties, color: '#f59e0b' }
  ];

  const maintenanceStatusData = [
    { name: 'Pending', value: pendingMaintenanceCount, color: '#f59e0b' },
    { name: 'In Progress', value: inProgressMaintenanceCount, color: '#3b82f6' },
    { name: 'Completed', value: completedMaintenanceCount, color: '#10b981' }
  ];

  // Process payment data by month
  const getMonthlyRevenueData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    // Initialize data with all months
    const monthlyData = months.map(month => ({
      month,
      revenue: 0
    }));
    
    // Calculate revenue from payments
    payments.forEach(payment => {
      const paymentDate = new Date(payment.payment_date);
      if (paymentDate.getFullYear() === currentYear) {
        const monthIndex = paymentDate.getMonth();
        monthlyData[monthIndex].revenue += parseFloat(payment.amount || 0);
      }
    });
    
    // Return only the last 6 months for better visualization
    return monthlyData.slice(-6);
  };

  const monthlyRevenueData = getMonthlyRevenueData();

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
    <div className="mb-8">
      <h1 className="text-3xl font-display font-bold text-neutral-900">Admin Dashboard</h1>
      <p className="mt-2 text-lg text-neutral-600">Welcome back, {user?.name}!</p>
    </div>
  );
};

export default AdminDashboard; 