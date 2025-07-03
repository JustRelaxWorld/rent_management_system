import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowDownTrayIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../utils/auth-context';
import api from '../../utils/api';
import { Card } from '../ui/Card';
import LoadingSpinner from '../ui/LoadingSpinner';
import EnhancedMpesaPaymentForm from './EnhancedMpesaPaymentForm';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
// Add type augmentation for jsPDF with autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: any;
  }
}

interface Invoice {
  id: number;
  property_id: number;
  tenant_id: number;
  amount: string;
  status: string;
  due_date: string;
  payment_date?: string;
  description: string;
  property_name?: string;
  property_reference?: string;
}

interface Payment {
  id: number;
  invoice_id: number;
  tenant_id: number;
  amount: string;
  payment_method: string;
  transaction_id: string;
  payment_date: string;
  status: string;
  property_name?: string;
  invoice_description?: string;
}

const TenantPaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we have invoice data passed from invoices page
  const invoiceData = location.state as { 
    invoiceId?: number; 
    amount?: string; 
    description?: string;
  } | null;
  
  const [activeTab, setActiveTab] = useState(invoiceData ? 'pay' : 'invoices');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(invoiceData?.invoiceId || null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState<any>(invoiceData ? {
    amount: invoiceData.amount,
    description: invoiceData.description
  } : null);
  
  // Fetch invoices and payments
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch invoices for the tenant
        const invoicesResponse = await api.get('/api/invoices', {
          params: { tenant_id: user?.id, status: 'pending,overdue' }
        });
        
        // Fetch payment history
        const paymentsResponse = await api.get('/api/payments');
        
        setInvoices(invoicesResponse.data.data || []);
        setPayments(paymentsResponse.data.data || []);
        
        setError(null);
      } catch (err: any) {
        console.error('Error fetching payment data:', err);
        setError(err.response?.data?.message || 'Failed to load payment information');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user?.id]);
  
  // Handle invoice selection for payment
  const handleSelectInvoice = (invoiceId: number) => {
    setSelectedInvoiceId(invoiceId);
    setActiveTab('pay');
  };
  
  // Handle payment completion
  const handlePaymentComplete = (details: any) => {
    setPaymentSuccess(true);
    setPaymentInProgress(false);
    setTransactionDetails(details);
    
    // Refresh invoices and payments after successful payment
    setTimeout(() => {
      const fetchUpdatedData = async () => {
        try {
          const invoicesResponse = await api.get('/api/invoices', {
            params: { tenant_id: user?.id, status: 'pending,overdue' }
          });
          
          const paymentsResponse = await api.get('/api/payments');
          
          setInvoices(invoicesResponse.data.data || []);
          setPayments(paymentsResponse.data.data || []);
        } catch (err) {
          console.error('Error refreshing data after payment:', err);
        }
      };
      
      fetchUpdatedData();
    }, 2000);
  };
  
  // Handle payment start
  const handlePaymentStart = () => {
    setPaymentInProgress(true);
  };
  
  // Generate PDF receipt
  const generatePDF = () => {
    if (!transactionDetails) return;
    
    const doc = new jsPDF();
    const selectedInvoice = invoices.find(inv => inv.id === selectedInvoiceId);
    
    // Add M-Pesa logo
    // Note: In a real app, you would add an actual logo image
    doc.setFontSize(24);
    doc.setTextColor(0, 153, 51); // M-Pesa green
    doc.text('M-PESA', 105, 20, { align: 'center' });
    
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text('Payment Receipt', 105, 30, { align: 'center' });
    
    // Add transaction details
    doc.setFontSize(12);
    doc.text(`Transaction ID: ${transactionDetails.transactionId || 'N/A'}`, 20, 50);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 60);
    doc.text(`Paid By: ${user?.name || 'N/A'}`, 20, 70);
    doc.text(`Phone: ${transactionDetails.phoneNumber || 'N/A'}`, 20, 80);
    
    // Add invoice details
    doc.text('Payment Details:', 20, 100);
    
    // @ts-ignore
    doc.autoTable({
      startY: 110,
      head: [['Description', 'Property', 'Amount']],
      body: [
        [
          selectedInvoice?.description || 'Rent Payment',
          selectedInvoice?.property_name || 'Property',
          `KES ${transactionDetails.amount || '0'}`
        ]
      ],
      theme: 'grid',
      headStyles: { fillColor: [0, 153, 51] } // M-Pesa green
    });
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('Thank you for your payment!', 105, doc.autoTable.previous.finalY + 20, { align: 'center' });
    
    // Save the PDF
    doc.save(`Payment_Receipt_${new Date().toISOString().split('T')[0]}.pdf`);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mpesa-light to-white dark:from-mpesa/20 dark:to-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4 text-mpesa" />
          <p className="text-mpesa dark:text-mpesa-light animate-pulse">Loading payment details...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mpesa-light to-white dark:from-mpesa/20 dark:to-neutral-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <div className="p-6 sm:p-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-mpesa-redLight dark:bg-mpesa-red/20 flex items-center justify-center mb-6">
              <ExclamationTriangleIcon className="w-8 h-8 text-mpesa-red dark:text-mpesa-red" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">Error Loading Payment</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">{error}</p>
            <button
              onClick={() => navigate('/tenant/dashboard')}
              className="w-full sm:w-auto px-6 py-2 bg-mpesa hover:bg-mpesa-dark text-white rounded-lg transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </Card>
      </div>
    );
  }
  
  const selectedInvoice = invoices.find(inv => inv.id === selectedInvoiceId);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-mpesa-light to-white dark:from-mpesa/20 dark:to-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-mpesa dark:text-mpesa-light">Payments</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Manage your rent payments and view payment history
          </p>
        </div>
        
        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-neutral-200 dark:border-neutral-700">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('invoices')}
                className={`py-4 px-6 font-medium text-sm border-b-2 ${
                  activeTab === 'invoices'
                    ? 'border-mpesa text-mpesa dark:text-mpesa-light'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
                }`}
              >
                Pending Invoices
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 px-6 font-medium text-sm border-b-2 ${
                  activeTab === 'history'
                    ? 'border-mpesa text-mpesa dark:text-mpesa-light'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
                }`}
              >
                Payment History
              </button>
              {selectedInvoiceId && (
                <button
                  onClick={() => setActiveTab('pay')}
                  className={`py-4 px-6 font-medium text-sm border-b-2 ${
                    activeTab === 'pay'
                      ? 'border-mpesa text-mpesa dark:text-mpesa-light'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
                  }`}
                >
                  Pay Now
                </button>
              )}
            </nav>
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="mt-6">
          {/* Pending Invoices Tab */}
          {activeTab === 'invoices' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">Pending Invoices</h2>
              
              {invoices.length === 0 ? (
                <Card className="p-6 text-center">
                  <p className="text-neutral-600 dark:text-neutral-400">No pending invoices found.</p>
                </Card>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                    <thead className="bg-neutral-50 dark:bg-neutral-800">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          Property
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          Description
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          Due Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                      {invoices.map((invoice) => (
                        <tr key={invoice.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                            {invoice.property_name || 'Property'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                            {invoice.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                            KES {parseFloat(invoice.amount).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                            {new Date(invoice.due_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              invoice.status === 'overdue'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
                            }`}>
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <button
                              onClick={() => handleSelectInvoice(invoice.id)}
                              className="text-mpesa hover:text-mpesa-dark dark:text-mpesa-light dark:hover:text-mpesa-light/80 font-medium"
                            >
                              Pay Now
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}
          
          {/* Payment History Tab */}
          {activeTab === 'history' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">Payment History</h2>
              
              {payments.length === 0 ? (
                <Card className="p-6 text-center">
                  <p className="text-neutral-600 dark:text-neutral-400">No payment history found.</p>
                </Card>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                    <thead className="bg-neutral-50 dark:bg-neutral-800">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          Property
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          Description
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          Method
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          Receipt
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                      {payments.map((payment) => (
                        <tr key={payment.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                            {new Date(payment.payment_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                            {payment.property_name || 'Property'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                            {payment.invoice_description || 'Rent Payment'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                            KES {parseFloat(payment.amount).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                            {payment.payment_method}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              payment.status === 'completed'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : payment.status === 'pending'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            {payment.status === 'completed' && (
                              <button
                                onClick={() => {
                                  setSelectedInvoiceId(payment.invoice_id);
                                  setTransactionDetails({
                                    transactionId: payment.transaction_id,
                                    amount: payment.amount,
                                    phoneNumber: user?.phone || 'N/A'
                                  });
                                  generatePDF();
                                }}
                                className="text-mpesa hover:text-mpesa-dark dark:text-mpesa-light dark:hover:text-mpesa-light/80 font-medium flex items-center justify-end"
                              >
                                <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                                Receipt
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}
          
          {/* Pay Now Tab */}
          {activeTab === 'pay' && selectedInvoice && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {paymentSuccess ? (
                <Card className="overflow-hidden">
                  <div className="p-6 sm:p-8">
                    <div className="text-center">
                      <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-6">
                        <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                      </div>
                      <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-2">Payment Successful!</h2>
                      <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                        Your payment of KES {parseFloat(selectedInvoice.amount).toLocaleString()} has been processed successfully.
                      </p>
                      
                      <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg mb-6">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="text-left">
                            <p className="text-neutral-500 dark:text-neutral-400">Transaction ID</p>
                            <p className="font-medium text-neutral-900 dark:text-white">
                              {transactionDetails?.transactionId || 'N/A'}
                            </p>
                          </div>
                          <div className="text-left">
                            <p className="text-neutral-500 dark:text-neutral-400">Date</p>
                            <p className="font-medium text-neutral-900 dark:text-white">
                              {new Date().toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-left">
                            <p className="text-neutral-500 dark:text-neutral-400">Property</p>
                            <p className="font-medium text-neutral-900 dark:text-white">
                              {selectedInvoice.property_name || 'Property'}
                            </p>
                          </div>
                          <div className="text-left">
                            <p className="text-neutral-500 dark:text-neutral-400">Amount</p>
                            <p className="font-medium text-neutral-900 dark:text-white">
                              KES {parseFloat(selectedInvoice.amount).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                          onClick={() => navigate('/tenant/dashboard')}
                          className="px-6 py-2 bg-mpesa hover:bg-mpesa-dark text-white rounded-lg transition-colors"
                        >
                          Return to Dashboard
                        </button>
                        
                        <button
                          onClick={generatePDF}
                          className="px-6 py-2 border border-mpesa text-mpesa hover:bg-mpesa-light rounded-lg transition-colors flex items-center justify-center"
                        >
                          <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                          Download Receipt
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                      Pay Invoice
                    </h2>
                    
                    <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg mb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">Property</p>
                          <p className="font-medium text-neutral-900 dark:text-white">
                            {selectedInvoice.property_name || 'Property'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">Description</p>
                          <p className="font-medium text-neutral-900 dark:text-white">
                            {selectedInvoice.description}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">Amount</p>
                          <p className="font-medium text-neutral-900 dark:text-white">
                            KES {parseFloat(selectedInvoice.amount).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">Due Date</p>
                          <p className="font-medium text-neutral-900 dark:text-white">
                            {new Date(selectedInvoice.due_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {paymentInProgress ? (
                      <div className="py-12 flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mpesa mb-4"></div>
                        <p className="text-neutral-600 dark:text-neutral-400">Processing payment...</p>
                      </div>
                    ) : (
                      <EnhancedMpesaPaymentForm 
                        invoiceId={selectedInvoice.id} 
                        amount={selectedInvoice.amount} 
                        propertyReference={selectedInvoice.property_reference || ''}
                        onPaymentComplete={handlePaymentComplete}
                        onPaymentStart={handlePaymentStart}
                      />
                    )}
                  </div>
                </Card>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantPaymentsPage; 