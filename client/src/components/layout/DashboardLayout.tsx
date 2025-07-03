import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ModernSidebar from './ModernSidebar';
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../utils/auth-context';
import { Button } from '../ui/Button';
import CommandPalette from '../ui/CommandPalette';
import Header from './Header';
import AuthLoader from '../ui/AuthLoader';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Debug flag - turn to false in production
const DEBUG = true;

// Debug logger function
const logDebug = (message: string, data?: any) => {
  if (DEBUG) {
    const timestamp = new Date().toISOString().substring(11, 23); // HH:MM:SS.sss
    if (data) {
      console.log(`[Dashboard Debug ${timestamp}] ${message}`, data);
    } else {
      console.log(`[Dashboard Debug ${timestamp}] ${message}`);
    }
  }
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [processingToken, setProcessingToken] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, handleAuthCallback, setToken } = useAuth();
  
  // Close sidebar on route change on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Handle keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  // Process token if present in URL
  useEffect(() => {
    const processTokenFromUrl = async () => {
      const queryParams = new URLSearchParams(location.search);
      const token = queryParams.get('token');
      
      if (token) {
        logDebug('Token detected in URL, processing...', { pathName: location.pathname });
        setProcessingToken(true);
        
        try {
          // Store the token first
          localStorage.setItem('token', token);
          setToken(token);
          
          // Process authentication
          const userData = await handleAuthCallback(token);
          
          if (userData) {
            logDebug('Successfully processed token from URL', { role: userData.role });
            
            // Remove token from URL by replacing current entry with clean URL
            const cleanUrl = location.pathname; // Just keep the path without query params
            navigate(cleanUrl, { replace: true });
          } else {
            logDebug('Failed to process token from URL');
          }
        } catch (error) {
          logDebug('Error processing token from URL', error);
        } finally {
          setProcessingToken(false);
        }
      }
    };
    
    processTokenFromUrl();
  }, [location.search, handleAuthCallback, navigate, location.pathname, setToken]);
  
  // Show loading state while processing token
  if (processingToken) {
    return <AuthLoader message="Authenticating your session..." />;
  }
  
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-200">
      {/* Command Palette */}
      <CommandPalette 
        isOpen={commandPaletteOpen} 
        onClose={() => setCommandPaletteOpen(false)} 
      />
      
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-72 lg:flex-col">
        <ModernSidebar />
      </div>
      
      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 lg:hidden"
          >
            <div className="flex h-16 items-center justify-between px-6 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">
                  RentEase
                </h1>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
              >
                <XMarkIcon className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ModernSidebar />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top navigation */}
        <header className="sticky top-0 z-30 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 shadow-sm">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Left side */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Bars3Icon className="h-6 w-6" />
              </Button>
              <div className="ml-4 lg:ml-0">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {getPageTitle(location.pathname)}
                </h2>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Search button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCommandPaletteOpen(true)}
                className="relative w-10 h-10 p-0 flex items-center justify-center"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
              
              {/* User profile header */}
              <Header />
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

// Helper function to get page title from pathname
function getPageTitle(pathname: string): string {
  const path = pathname.split('/').filter(Boolean);
  
  if (path.length === 0) return 'Dashboard';
  
  // Handle special cases
  if (pathname.includes('dashboard')) return 'Dashboard';
  if (pathname.includes('profile')) return 'Profile';
  if (pathname.includes('properties')) {
    if (pathname.includes('add')) return 'Add Property';
    if (pathname.includes('edit')) return 'Edit Property';
    return 'Properties';
  }
  if (pathname.includes('applications')) return 'Applications';
  if (pathname.includes('maintenance')) return 'Maintenance';
  if (pathname.includes('payments')) return 'Payments';
  
  // Default: capitalize first segment
  return path[0].charAt(0).toUpperCase() + path[0].slice(1);
}

export default DashboardLayout; 