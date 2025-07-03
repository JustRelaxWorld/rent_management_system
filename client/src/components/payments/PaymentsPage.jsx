import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCardIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  ClockIcon,
  XCircleIcon,
  DocumentTextIcon,
  CalendarIcon,
  ReceiptPercentIcon,
  ArrowDownTrayIcon,
  ShieldCheckIcon,
  BuildingLibraryIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import EnhancedMpesaPaymentForm from './EnhancedMpesaPaymentForm';
import api from '../../utils/api';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import LoadingSpinner from '../ui/LoadingSpinner';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useAuth } from '../../utils/auth-context';

const PaymentStatusBadge = ({ status }) => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'paid':
    case 'success':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-mpesa-light text-mpesa border border-mpesa">
          <CheckCircleIcon className="w-3 h-3 mr-1" />
          Completed
        </span>
      );
    case 'pending':
    case 'processing':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
          <ClockIcon className="w-3 h-3 mr-1" />
          Pending
        </span>
      );
    case 'failed':
    case 'rejected':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-mpesa-redLight text-mpesa-red border border-mpesa-red">
          <XCircleIcon className="w-3 h-3 mr-1" />
          Failed
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
          <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
          {status || 'Unknown'}
        </span>
      );
  }
};

const PaymentsPage = () => {
  const { invoiceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [tabKey, setTabKey] = useState('mpesa');
  const [invoiceDetails, setInvoiceDetails] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const { user } = useAuth();

  // Extract query parameters
  const queryParams = new URLSearchParams(location.search);
  const amount = queryParams.get('amount') ? parseFloat(queryParams.get('amount')) : undefined;
  const propertyRef = queryParams.get('propertyRef') || undefined;
  const returnUrl = queryParams.get('returnUrl') || undefined;

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      if (!invoiceId) return;
      
      try {
        setLoading(true);
        const response = await api.get(`/api/invoices/${invoiceId}`);
        setInvoiceDetails(response.data.data);
      } catch (err) {
        console.error('Error fetching invoice details:', err);
        setError('Failed to load invoice details');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceDetails();
  }, [invoiceId]);

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      if (!invoiceId) return;
      
      try {
        const response = await api.get(`/api/payments/invoice/${invoiceId}`);
        if (response.data.success) {
          setPaymentHistory(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching payment history:', err);
      }
    };

    fetchPaymentHistory();
  }, [invoiceId, refreshTrigger]);

  const handlePaymentComplete = (success) => {
    setRefreshTrigger(prev => prev + 1);
    setPaymentSuccess(success);
    setPaymentProcessing(false);
    
    // Auto-hide success message after 5 seconds
    if (success) {
      setTimeout(() => {
        setPaymentSuccess(false);
      }, 5000);
    }
  };
  
  const handlePaymentStart = () => {
    setPaymentProcessing(true);
    setPaymentSuccess(false);
  };

  const isPaid = invoiceDetails?.status === 'paid' || 
                paymentHistory.some(payment => payment.status === 'completed');
  
  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add logo or header
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text('Payment Receipt', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('Rent Management System', 105, 30, { align: 'center' });
    
    // Add receipt details
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    const completedPayment = paymentHistory.find(payment => payment.status === 'completed') || paymentHistory[0] || {};
    const receiptData = [
      ['Receipt Number:', `#${completedPayment.id || 'N/A'}`],
      ['Date:', new Date(completedPayment.created_at || new Date()).toLocaleDateString()],
      ['Payment Method:', completedPayment.payment_method || 'M-Pesa'],
      ['Amount:', `Ksh ${(completedPayment.amount || amount || 0).toLocaleString()}`],
      ['Status:', completedPayment.status || 'N/A'],
      ['Property Reference:', propertyRef || invoiceDetails?.property_reference || 'N/A'],
      ['Tenant:', user?.name || 'N/A'],
    ];
    
    doc.autoTable({
      startY: 40,
      head: [['Detail', 'Value']],
      body: receiptData,
      theme: 'grid',
      headStyles: { fillColor: [46, 134, 222], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      margin: { top: 40 }
    });
    
    doc.setFontSize(10);
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
            <Button
              variant="default"
              onClick={() => navigate(returnUrl || '/tenant/dashboard')}
              className="w-full sm:w-auto bg-mpesa hover:bg-mpesa-dark text-white"
            >
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mpesa-light/30 to-white dark:from-mpesa/10 dark:to-neutral-900 py-6 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-4"
        >
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(returnUrl || -1)}
            leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
          >
            Back
          </Button>
        </motion.div>
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-r from-mpesa to-mpesa-dark rounded-2xl shadow-lg overflow-hidden mb-8"
        >
          <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
          <div className="relative p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <img 
                src="/images/MpesaLogo.png"
                alt="M-Pesa Logo" 
                className="h-12 w-auto object-contain"
              />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  {isPaid ? 'Payment Complete' : 'Lipa na M-Pesa'}
                </h1>
                <p className="text-base text-white/80">
                  {isPaid 
                    ? 'Your payment has been processed successfully'
                    : 'Complete your payment securely'
                  }
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Payment Status Notifications */}
        <AnimatePresence>
          {paymentSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-mpesa-light border border-mpesa rounded-xl p-4 flex items-center"
            >
              <CheckCircleIcon className="h-5 w-5 text-mpesa mr-3" />
              <div className="flex-1">
                <p className="font-medium text-mpesa">Payment Successful!</p>
                <p className="text-sm text-mpesa-dark">Your payment has been processed successfully.</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setPaymentSuccess(false)}
                className="text-mpesa hover:text-mpesa-dark"
              >
                Dismiss
              </Button>
            </motion.div>
          )}
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-mpesa-redLight border border-mpesa-red rounded-xl p-4 flex items-center"
            >
              <XCircleIcon className="h-5 w-5 text-mpesa-red mr-3" />
              <div className="flex-1">
                <p className="font-medium text-mpesa-redDark">Payment Error</p>
                <p className="text-sm text-mpesa-red">{error}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setError(null)}
                className="text-mpesa-red hover:text-mpesa-redDark"
              >
                Dismiss
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Payment Summary and History */}
          <div className="lg:col-span-1 space-y-6">
            {/* Payment Summary Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="overflow-hidden shadow-md">
                <div className="bg-mpesa-light dark:bg-mpesa/20 border-b border-mpesa/20 dark:border-mpesa/20 p-4">
                  <div className="flex items-center">
                    <DocumentTextIcon className="w-5 h-5 text-mpesa mr-2" />
                    <h3 className="text-base font-semibold text-mpesa dark:text-mpesa">Payment Summary</h3>
                  </div>
                </div>
                
                <CardContent className="p-5">
                  {invoiceDetails ? (
                    <div className="space-y-4">
                      {/* Amount in focus */}
                      <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700 text-center mb-4">
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Amount Due</p>
                        <div className="text-3xl font-bold text-mpesa dark:text-mpesa">
                          Ksh {invoiceDetails.amount?.toLocaleString()}
                        </div>
                        {invoiceDetails.status && (
                          <div className="mt-2 flex justify-center">
                            <PaymentStatusBadge status={invoiceDetails.status} />
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        {invoiceDetails.invoice_number && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-neutral-600 dark:text-neutral-400">Invoice #</span>
                            <span className="font-medium text-neutral-900 dark:text-white">{invoiceDetails.invoice_number}</span>
                          </div>
                        )}
                        
                        {invoiceDetails.due_date && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-neutral-600 dark:text-neutral-400">Due Date</span>
                            <span className="font-medium text-neutral-900 dark:text-white">
                              {new Date(invoiceDetails.due_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        
                        {invoiceDetails.property_reference && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-neutral-600 dark:text-neutral-400">Property</span>
                            <span className="font-medium text-neutral-900 dark:text-white">{invoiceDetails.property_reference}</span>
                          </div>
                        )}
                        
                        {invoiceDetails.period && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-neutral-600 dark:text-neutral-400">Period</span>
                            <span className="font-medium text-neutral-900 dark:text-white">{invoiceDetails.period}</span>
                          </div>
                        )}
                        
                        {invoiceDetails.description && (
                          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800">
                            <span className="text-neutral-600 dark:text-neutral-400 block mb-1">Description</span>
                            <p className="text-neutral-900 dark:text-neutral-300">{invoiceDetails.description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Simple amount display when no invoice */}
                      <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700 text-center">
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Amount Due</p>
                        <div className="text-3xl font-bold text-mpesa dark:text-mpesa">
                          Ksh {amount?.toLocaleString() || '0'}
                        </div>
                      </div>
                      
                      {propertyRef && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-neutral-600 dark:text-neutral-400">Property</span>
                          <span className="font-medium text-neutral-900 dark:text-white">{propertyRef}</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Secure Payment Notice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="overflow-hidden shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start">
                    <div className="bg-mpesa-light rounded-full p-2 mr-3">
                      <ShieldCheckIcon className="h-5 w-5 text-mpesa" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-neutral-900 dark:text-white">Secure Payment</h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                        All payment information is encrypted and securely processed by Safaricom M-Pesa.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Payment History */}
            {paymentHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="overflow-hidden shadow-md">
                  <div className="bg-mpesa-light dark:bg-mpesa/20 border-b border-mpesa/20 dark:border-mpesa/20 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CreditCardIcon className="w-5 h-5 text-mpesa mr-2" />
                        <h3 className="text-base font-semibold text-mpesa dark:text-mpesa">Payment History</h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<ArrowPathIcon className="h-4 w-4" />}
                        onClick={() => setRefreshTrigger(prev => prev + 1)}
                        className="text-mpesa hover:text-mpesa-dark"
                      >
                        Refresh
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="space-y-3">
                      {paymentHistory.map((payment, index) => (
                        <div 
                          key={payment.id || index} 
                          className="flex justify-between items-center p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-100 dark:border-neutral-800/50"
                        >
                          <div>
                            <div className="flex items-center mb-1">
                              <CalendarIcon className="h-3 w-3 text-neutral-500 mr-1.5" />
                              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                {new Date(payment.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                            <p className="font-medium text-neutral-900 dark:text-white">
                              Ksh {payment.amount?.toLocaleString()}
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            <PaymentStatusBadge status={payment.status} />
                            {payment.status === 'completed' && (
                              <button 
                                className="mt-2 text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center"
                                onClick={generatePDF}
                              >
                                <ArrowDownTrayIcon className="h-3 w-3 mr-1" />
                                Receipt
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right Column - Payment Methods */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            {isPaid ? (
              <Card className="shadow-md">
                <div className="p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-mpesa-light rounded-full flex items-center justify-center mb-4">
                    <CheckCircleIcon className="h-8 w-8 text-mpesa" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                    Payment Complete
                  </h2>
                  
                  <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-md">
                    Your payment has been processed successfully. A receipt has been generated for your records.
                  </p>
                  
                  <motion.div 
                    className="flex flex-col sm:flex-row gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Button
                      variant="default"
                      onClick={() => navigate(returnUrl || '/tenant/dashboard')}
                      className="bg-mpesa hover:bg-mpesa-dark text-white"
                    >
                      Return to Dashboard
                    </Button>
                    
                    {invoiceId && (
                      <Button
                        variant="outline"
                        leftIcon={<ArrowDownTrayIcon className="w-4 h-4" />}
                        onClick={generatePDF}
                        className="border-mpesa text-mpesa hover:bg-mpesa-light"
                      >
                        Download Receipt
                      </Button>
                    )}
                  </motion.div>
                </div>
              </Card>
            ) : (
              <Card className="shadow-md">
                <div className="p-6">
                  {loading ? (
                    <div className="py-12 flex flex-col items-center">
                      <LoadingSpinner size="lg" className="mb-4" />
                      <p className="text-neutral-600 dark:text-neutral-400">Loading payment details...</p>
                    </div>
                  ) : (
                    <>
                      {tabKey === 'mpesa' && (
                        <EnhancedMpesaPaymentForm 
                          invoiceId={invoiceId} 
                          amount={invoiceDetails?.amount || amount} 
                          propertyReference={invoiceDetails?.property_reference || propertyRef}
                          onPaymentComplete={handlePaymentComplete}
                          onPaymentStart={handlePaymentStart}
                        />
                      )}
                    </>
                  )}
                </div>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage; 