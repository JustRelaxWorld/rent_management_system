import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/auth-context';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  MoonIcon,
  SunIcon,
  Cog6ToothIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [activitiesCount, setActivitiesCount] = useState(0);
  const [avatarKey, setAvatarKey] = useState(Date.now());
  
  useEffect(() => {
    setAvatarKey(Date.now());
  }, [user?.avatar]);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
    setProfileDropdownOpen(false);
  };

  useEffect(() => {
    // Fetch activity counts if user is logged in
    if (user) {
      const fetchCounts = async () => {
        try {
          // Fetch activity count
          const activityResponse = await api.get(`/api/users/${user.id}/activity/unread-count`);
          if (activityResponse.data && activityResponse.data.data) {
            setActivitiesCount(activityResponse.data.data.count || 0);
          }
        } catch (error) {
          console.error('Failed to fetch activity count:', error);
        }
      };

      fetchCounts();
      
      // Set up polling every 2 minutes
      const intervalId = setInterval(fetchCounts, 2 * 60 * 1000);
      
      return () => clearInterval(intervalId);
    }
  }, [user]);

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

  // Function to get avatar URL with cache busting
  const getAvatarUrl = () => {
    if (!user?.avatar) return ''; // Return empty string instead of null
    
    let avatarUrl = user.avatar;
    
    // If avatar path is relative, convert to absolute URL
    if (avatarUrl && !avatarUrl.startsWith('http') && !avatarUrl.startsWith('data:')) {
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      avatarUrl = `${baseUrl}/${avatarUrl.replace(/^\//, '')}`;
    }
    
    // Add cache busting parameter
    return `${avatarUrl}${avatarUrl.includes('?') ? '&' : '?'}t=${avatarKey}`;
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Activity Link */}
      <Link
        to="/my-activity"
        className="flex items-center justify-center h-10 w-10 rounded-full text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-white focus:outline-none transition duration-150 ease-in-out relative"
      >
        <ClockIcon className="h-6 w-6" />
        {activitiesCount > 0 && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-neutral-900" />
        )}
      </Link>
      
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
            <>
              {/* Check if it's an AVIF format and use fallback immediately if it is */}
              {user.avatar.toLowerCase().includes('.avif') ? (
                <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              ) : (
                <img
                  src={getAvatarUrl()}
                  alt="Profile"
                  className="h-8 w-8 rounded-full object-cover"
                  key={`avatar-${avatarKey}`}
                  onError={(e) => {
                    // If image fails to load, generate a canvas-based avatar
                    try {
                      const target = e.currentTarget;
                      target.onerror = null; // Prevent infinite error loop
                      
                      // Create a simple fallback avatar with the user's initial
                      const canvas = document.createElement('canvas');
                      canvas.width = 100;
                      canvas.height = 100;
                      const ctx = canvas.getContext('2d');
                      
                      if (ctx) {
                        // Fill background
                        ctx.fillStyle = '#4f46e5'; // Primary color
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        
                        // Add initial
                        ctx.font = 'bold 50px Arial';
                        ctx.fillStyle = '#ffffff';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(
                          user?.name?.charAt(0).toUpperCase() || 'U',
                          canvas.width / 2,
                          canvas.height / 2
                        );
                        
                        // Set the data URL as the source
                        target.src = canvas.toDataURL('image/png');
                      }
                    } catch (error) {
                      console.error("Error generating fallback avatar:", error);
                      // Hide the image if canvas fails
                      e.currentTarget.style.display = 'none';
                    }
                  }}
                />
              )}
            </>
          ) : (
            <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
              <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          )}
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
                
                <Link 
                  to="/my-activity"
                  className="flex items-center px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <ClockIcon className="h-4 w-4 mr-3" />
                  <span>My Activity</span>
                  {activitiesCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                      {activitiesCount}
                    </span>
                  )}
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
                
                <hr className="my-1 border-neutral-200 dark:border-neutral-700" />
                
                <button 
                  className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
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
  );
};

export default Header; 