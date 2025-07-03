import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MoonIcon, 
  SunIcon, 
  ComputerDesktopIcon,
  BellIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  UserCircleIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../utils/auth-context';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Load user settings
  useEffect(() => {
    const fetchUserSettings = async () => {
      if (!user) return;
      
      try {
        const response = await api.get(`/api/users/${user.id}/settings`);
        if (response.data.success) {
          const settings = response.data.data;
          setEmailNotifications(settings.email_notifications || true);
          setPushNotifications(settings.push_notifications || true);
        }
      } catch (err) {
        console.error('Failed to load user settings:', err);
        // Default to enabled if settings can't be loaded
      }
    };
    
    fetchUserSettings();
  }, [user]);
  
  const saveSettings = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await api.put(`/api/users/${user.id}/settings`, {
        theme_preference: theme,
        email_notifications: emailNotifications,
        push_notifications: pushNotifications
      });
      
      if (response.data.success) {
        setSuccess('Settings saved successfully');
      }
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6">Settings</h1>
      
      {success && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400"
        >
          {success}
        </motion.div>
      )}
      
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400"
        >
          {error}
        </motion.div>
      )}
      
      <div className="space-y-6">
        {/* Appearance */}
        <Card>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <ComputerDesktopIcon className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3" />
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Appearance</h2>
            </div>
            
            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-neutral-900 dark:text-white">Theme</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Choose how RentEase looks to you
                  </p>
                </div>
                
                <div className="mt-4 sm:mt-0 flex space-x-2">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleTheme()}
                    className="flex items-center"
                  >
                    <SunIcon className="h-4 w-4 mr-2" />
                    Light
                  </Button>
                  
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleTheme()}
                    className="flex items-center"
                  >
                    <MoonIcon className="h-4 w-4 mr-2" />
                    Dark
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Notifications */}
        <Card>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <BellIcon className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3" />
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Notifications</h2>
            </div>
            
            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 dark:text-white">Email Notifications</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Receive notifications via email
                    </p>
                  </div>
                  
                  <div className="relative inline-block w-12 align-middle select-none">
                    <input
                      type="checkbox"
                      id="email-notifications"
                      checked={emailNotifications}
                      onChange={() => setEmailNotifications(!emailNotifications)}
                      className="sr-only"
                    />
                    <label
                      htmlFor="email-notifications"
                      className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                        emailNotifications ? 'bg-primary-600' : 'bg-neutral-300 dark:bg-neutral-700'
                      }`}
                    >
                      <span
                        className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform ${
                          emailNotifications ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 dark:text-white">Push Notifications</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Receive notifications in the app
                    </p>
                  </div>
                  
                  <div className="relative inline-block w-12 align-middle select-none">
                    <input
                      type="checkbox"
                      id="push-notifications"
                      checked={pushNotifications}
                      onChange={() => setPushNotifications(!pushNotifications)}
                      className="sr-only"
                    />
                    <label
                      htmlFor="push-notifications"
                      className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                        pushNotifications ? 'bg-primary-600' : 'bg-neutral-300 dark:bg-neutral-700'
                      }`}
                    >
                      <span
                        className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform ${
                          pushNotifications ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Security */}
        <Card>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <ShieldCheckIcon className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3" />
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Security</h2>
            </div>
            
            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 dark:text-white">Password</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Update your password
                    </p>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 sm:mt-0 flex items-center"
                    onClick={() => navigate('/change-password')}
                  >
                    <LockClosedIcon className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Account */}
        <Card>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <UserCircleIcon className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3" />
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Account</h2>
            </div>
            
            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 dark:text-white">Profile Information</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Update your profile details
                    </p>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 sm:mt-0 flex items-center"
                    onClick={() => navigate(user?.role === 'tenant' ? '/tenant/profile/edit' : '/profile')}
                  >
                    <UserIcon className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="mt-6 flex justify-end">
        <Button
          variant="default"
          onClick={saveSettings}
          disabled={loading}
          className="flex items-center"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};

export default Settings; 