import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/auth-context';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  MoonIcon,
  SunIcon,
  Cog6ToothIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(3); // Mock notification count
  
  const handleLogout = () => {
    logout();
    navigate('/login');
    setProfileDropdownOpen(false);
  };

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

  // If not authenticated, don't render anything
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex items-center space-x-4">
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
      
      {/* Theme Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className="w-10 h-10 p-0 flex items-center justify-center"
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? (
          <SunIcon className="h-5 w-5" />
        ) : (
          <MoonIcon className="h-5 w-5" />
        )}
      </Button>
      
      {/* User menu */}
      <div className="relative profile-dropdown">
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center p-0"
          onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
        >
          {user?.avatar ? (
            <img
              src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000/${user.avatar}`}
              alt="Profile"
              className="h-8 w-8 rounded-full object-cover"
              onError={(e) => {
                // If image fails to load, show fallback avatar with initials
                e.currentTarget.style.display = 'none';
                const fallbackEl = e.currentTarget.parentNode?.querySelector('.avatar-fallback');
                if (fallbackEl) {
                  fallbackEl.classList.remove('hidden');
                }
              }}
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
              <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          )}
          
          {/* Fallback avatar (hidden by default) */}
          <div className="avatar-fallback hidden h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
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
                  to={user?.role === 'tenant' ? '/tenant/profile/edit' : '/profile'}
                  className="flex items-center px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <UserCircleIcon className="h-4 w-4 mr-3" />
                  <span>My Profile</span>
                </Link>
                
                <Link 
                  to="/settings"
                  className="flex items-center px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <Cog6ToothIcon className="h-4 w-4 mr-3" />
                  <span>Settings</span>
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
                
                <div className="border-t border-neutral-200 dark:border-neutral-700 my-1"></div>
                
                <button 
                  className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                  onClick={handleLogout}
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                  <span>Sign out</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Header; 