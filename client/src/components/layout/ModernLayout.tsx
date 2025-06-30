import React, { useState, useEffect } from 'react';
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
import { Card } from '../ui/Card';
import MobileNav from '../ui/MobileNav';

interface ModernLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

const ModernLayout: React.FC<ModernLayoutProps> = ({ children, sidebar }) => {
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

  // Close sidebar on route change
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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-200">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebar && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: sidebarOpen ? 0 : -300 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 lg:translate-x-0 lg:static lg:inset-0"
          >
            <div className="flex h-full flex-col">
              {/* Sidebar header */}
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
                  className="lg:hidden"
                >
                  <XMarkIcon className="h-5 w-5" />
                </Button>
              </div>

              {/* Sidebar content */}
              <div className="flex-1 overflow-y-auto">
                {sidebar}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className={`${sidebar ? 'lg:pl-80' : ''} flex flex-col min-h-screen`}>
        {/* Top navigation */}
        <header className="sticky top-0 z-30 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Left side */}
            <div className="flex items-center">
              {sidebar && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden"
                >
                  <Bars3Icon className="h-6 w-6" />
                </Button>
              )}
              <div className="ml-4 lg:ml-0">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {getPageTitle(location.pathname)}
                </h2>
              </div>
            </div>

            {/* Right side */}
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

              {/* User menu */}
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
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 pb-16 lg:pb-0">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
};

// Helper function to get page title based on route
function getPageTitle(pathname: string): string {
  const pathMap: Record<string, string> = {
    '/': 'Home',
    '/login': 'Login',
    '/register': 'Register',
    '/landlord-dashboard': 'Landlord Dashboard',
    '/tenant-dashboard': 'Tenant Dashboard',
    '/admin': 'Admin Dashboard',
    '/landlord/properties': 'My Properties',
    '/landlord/properties/add': 'Add Property',
    '/tenant/properties': 'Available Properties',
    '/landlord/applications': 'Applications',
    '/tenant/applications': 'My Applications',
    '/landlord/maintenance': 'Maintenance',
    '/tenant/maintenance': 'Maintenance Requests',
    '/tenant/payments': 'Payments',
    '/profile/edit': 'Edit Profile',
  };

  // Check for edit routes
  if (pathname.includes('/edit')) {
    return 'Edit Property';
  }

  // Check for dynamic routes
  if (pathname.includes('/properties/') && pathname.includes('/apply')) {
    return 'Apply for Property';
  }

  return pathMap[pathname] || 'Page';
}

export default ModernLayout; 