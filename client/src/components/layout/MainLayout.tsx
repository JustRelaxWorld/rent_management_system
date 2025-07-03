import React, { useState, useEffect, ReactNode } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../utils/auth-context';
import { 
  Bars3Icon, 
  XMarkIcon, 
  SunIcon, 
  MoonIcon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { ChevronDownIcon as ChevronDownSolid } from '@heroicons/react/20/solid';
import { ContentTransition } from './PageTransition';

interface MainLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, sidebar }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close sidebar and dropdown on route change
  useEffect(() => {
    setSidebarOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);
  
  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.profile-dropdown') && profileDropdownOpen) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownOpen]);

  const handleLogout = () => {
    logout();
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-accent-50 dark:bg-neutral-900 max-w-full overflow-x-hidden">
      {/* Sidebar */}
      <aside className="hidden md:block w-64 bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 overflow-y-auto">
        {sidebar}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden max-w-full w-full">
        {/* Header with profile dropdown */}
        <header className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-4 flex justify-between items-center">
          <div className="flex items-center">
            <button
              className="md:hidden text-neutral-600 dark:text-neutral-400 mr-4"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              {getPageTitle(location.pathname)}
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="relative w-10 h-10 p-0 flex items-center justify-center"
            >
              <div className="relative w-5 h-5">
                <SunIcon className="absolute inset-0 h-5 w-5 rotate-0 scale-100 transition-all duration-200 dark:-rotate-90 dark:scale-0" />
                <MoonIcon className="absolute inset-0 h-5 w-5 rotate-90 scale-0 transition-all duration-200 dark:rotate-0 dark:scale-100" />
              </div>
              <span className="sr-only">Toggle theme</span>
            </Button>
            
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <BellIcon className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500"></span>
            </Button>
            
            {/* User Profile Dropdown */}
            <div className="relative profile-dropdown">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center p-0"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </Button>
              
              {/* Profile Dropdown Menu */}
              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 py-1 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 z-50"
                  >
                    <div className="px-4 py-2 border-b border-neutral-200 dark:border-neutral-700">
                      <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{user?.name}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{user?.email}</p>
                    </div>
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <div className="flex items-center">
                        <UserCircleIcon className="h-4 w-4 mr-2" />
                        <span>My Profile</span>
                      </div>
                    </Link>
                    <button 
                      className="w-full text-left block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                      onClick={handleLogout}
                    >
                      <div className="flex items-center">
                        <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                        <span>Logout</span>
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>
        
        {/* Mobile Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="md:hidden fixed inset-0 bg-black/50 z-40"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                className="md:hidden fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-neutral-800 z-50 overflow-y-auto"
              >
                <div className="flex justify-between items-center p-4 border-b border-neutral-200 dark:border-neutral-700">
                  <h2 className="font-bold text-xl text-primary-600">RentEase</h2>
                  <button onClick={() => setSidebarOpen(false)}>
                    <XMarkIcon className="h-6 w-6 text-neutral-500" />
                  </button>
                </div>
                <div>{sidebar}</div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
        
        <ContentTransition 
          className="flex-1 p-6 overflow-x-hidden w-full" 
          type="fade" 
          duration={0.3}
        >
          {children}
        </ContentTransition>

        {/* Footer */}
        <motion.footer 
          className="p-4 text-center text-sm text-neutral-500 border-t border-neutral-200 dark:border-neutral-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p>&copy; {new Date().getFullYear()} Rent Management System</p>
        </motion.footer>
      </main>
    </div>
  );
};

// Helper function to get page title based on route
function getPageTitle(pathname: string): string {
  const pathTitles: Record<string, string> = {
    '/': 'Home',
    '/login': 'Login',
    '/register': 'Register',
    '/forgot-password': 'Forgot Password',
    '/landlord/dashboard': 'Landlord Dashboard',
    '/tenant-dashboard': 'Tenant Dashboard',
    '/admin': 'Admin Dashboard',
    '/landlord/properties': 'My Properties',
    '/landlord/properties/add': 'Add Property',
    '/tenant/properties': 'Available Properties',
    '/landlord/applications': 'Applications',
    '/tenant/applications': 'My Applications',
    '/landlord/maintenance': 'Maintenance',
    '/tenant/maintenance': 'Maintenance Requests',
    '/tenant/maintenance/new': 'New Maintenance Request',
    '/tenant/payments': 'Payments',
    '/profile': 'My Profile',
    '/profile/edit': 'Edit Profile',
  };

  // Check for edit routes
  if (pathname.includes('/edit') && pathname.includes('/properties/')) {
    return 'Edit Property';
  }

  // Check for dynamic routes
  if (pathname.includes('/properties/') && pathname.includes('/apply')) {
    return 'Apply for Property';
  }
  
  if (pathname.includes('/properties/') && !pathname.includes('/edit')) {
    return 'Property Details';
  }

  return pathTitles[pathname] || 'Page';
}

export default MainLayout; 