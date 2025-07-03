import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  DocumentTextIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { useAuth } from '../../utils/auth-context';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useQuery } from '@tanstack/react-query';

const TenantInvoicesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all');
  
  // Fetch invoices using React Query
  const {
    data: invoicesData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const response = await api.get('/api/invoices');
      return response.data.data || [];
    }
  });
  
  // Filter invoices based on selected filter
  const filteredInvoices = React.useMemo(() => {
    if (!invoicesData) return [];
    
    switch (filter) {
      case 'pending':
        return invoicesData.filter((invoice: any) => invoice.status === 'pending');
      case 'paid':
        return invoicesData.filter((invoice: any) => invoice.status === 'paid');
      default:
        return invoicesData;
    }
  }, [invoicesData, filter]);

  // Format date to readable string
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Navigate to payment page with invoice data
  const handleMakePayment = (invoice: any) => {
    // Navigate to payments page with invoice data
    navigate('/tenant/payments', { 
      state: { 
        invoiceId: invoice.id,
        amount: invoice.amount,
        description: invoice.description || `Invoice #${invoice.id}`
      } 
    });
  };
  
  // Get appropriate status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Paid
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
            <ClockIcon className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <ExclamationCircleIcon className="w-3 h-3 mr-1" />
            Overdue
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
            {status}
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
        <div className="flex p-4">
          <div className="flex-shrink-0">
            <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700 dark:text-red-300">
              There was an error loading your invoices. Please try again later.
            </p>
            <Button 
              onClick={() => refetch()} 
              variant="outline" 
              size="sm"
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices & Payment History</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View and manage your invoices and payment history.
          </p>
        </div>
        
        <div className="flex items-center space-x-2 bg-white dark:bg-neutral-800 rounded-lg p-1 shadow-sm">
          <Button
            onClick={() => setFilter('all')}
            variant={filter === 'all' ? "default" : "ghost"}
            size="sm"
          >
            All
          </Button>
          <Button
            onClick={() => setFilter('pending')}
            variant={filter === 'pending' ? "default" : "ghost"}
            size="sm"
          >
            Pending
          </Button>
          <Button
            onClick={() => setFilter('paid')}
            variant={filter === 'paid' ? "default" : "ghost"}
            size="sm"
          >
            Paid
          </Button>
        </div>
      </div>
      
      {filteredInvoices.length === 0 ? (
        <Card className="p-6 text-center">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No invoices found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {filter === 'all' 
              ? "You don't have any invoices yet." 
              : filter === 'pending'
                ? "You don't have any pending invoices."
                : "You don't have any paid invoices."}
          </p>
        </Card>
      ) : (
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow overflow-hidden">
          <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredInvoices.map((invoice: any) => (
              <motion.li
                key={invoice.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="p-4 sm:px-6"
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-md bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <DocumentTextIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Invoice #{invoice.id}
                        </p>
                        <span className="ml-2">{getStatusBadge(invoice.status)}</span>
                      </div>
                      <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <span className="truncate">
                          {invoice.description || `For ${invoice.property_name || 'Property'}`}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 ml-auto">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Ksh {parseFloat(invoice.amount).toFixed(2)}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Due: {formatDate(invoice.due_date)}
                      </p>
                    </div>
                    
                    {invoice.status === 'pending' && (
                      <Button 
                        onClick={() => handleMakePayment(invoice)} 
                        variant="default" 
                        size="sm"
                        className="flex items-center"
                      >
                        <CreditCardIcon className="mr-1.5 h-4 w-4" />
                        Pay Now
                      </Button>
                    )}
                    
                    {invoice.status === 'paid' && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Paid on {formatDate(invoice.payment_date)}
                      </div>
                    )}
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TenantInvoicesPage; 