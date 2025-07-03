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
  ChevronDownIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import MobileNav from '../ui/MobileNav';
import CommandPalette from '../ui/CommandPalette';

interface ModernLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

const ModernLayout: React.FC<ModernLayoutProps> = ({ children, sidebar }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(3); // Mock notification count
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

  const handleLogout = () => {
    logout();
  };

  if (!mounted) {
    return null;
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
        <header className="sticky top-0 z-30 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 shadow-sm">
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
              {/* Search button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCommandPaletteOpen(true)}
                className="relative w-10 h-10 p-0 flex items-center justify-center"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
                <span className="sr-only">Search</span>
                <div className="hidden sm:flex absolute top-full right-0 mt-1 text-xs text-neutral-500 dark:text-neutral-400 items-center">
                  <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-700 font-mono">⌘</kbd>
                  <kbd className="ml-1 px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-700 font-mono">K</kbd>
                </div>
              </Button>

              {/* Notifications */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="relative w-10 h-10 p-0 flex items-center justify-center"
                >
                  <BellIcon className="h-5 w-5" />
                  {notificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-xs text-white font-medium">
                      {notificationsCount}
                    </span>
                  )}
                </Button>
              </div>

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
                      className="absolute right-0 mt-2 w-56 py-1 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 z-50"
                    >
                      <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
                        <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{user?.name}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{user?.email}</p>
                        <p className="text-xs mt-1 font-medium text-primary-600 dark:text-primary-400 capitalize">{user?.role}</p>
                      </div>
                      
                      <div className="py-1">
                        <Link 
                          to="/profile" 
                          className="flex items-center px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <UserCircleIcon className="h-4 w-4 mr-3" />
                          <span>My Profile</span>
                        </Link>
                        
                        <button 
                          className="w-full text-left flex items-center px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200"
                          onClick={toggleTheme}
                        >
                          {theme === 'dark' ? (
                            <>
                              <SunIcon className="h-4 w-4 mr-3" />
                              <span>Light Mode</span>
                            </>
                          ) : (
                            <>
                              <MoonIcon className="h-4 w-4 mr-3" />
                              <span>Dark Mode</span>
                            </>
                          )}
                        </button>
                        
                        <Link 
                          to="/settings" 
                          className="flex items-center px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <Cog6ToothIcon className="h-4 w-4 mr-3" />
                          <span>Settings</span>
                        </Link>
                      </div>
                      
                      <div className="py-1 border-t border-neutral-200 dark:border-neutral-700">
                        <button 
                          className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                          onClick={handleLogout}
                        >
                          <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 pb-16 lg:pb-0">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
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