import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  IdentificationIcon,
  PencilSquareIcon,
  SunIcon,
  MoonIcon,
  CameraIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../utils/auth-context';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import AvatarUpload from '../ui/AvatarUpload';

const Profile: React.FC = () => {
  const { user, uploadAvatar, updateThemePreference } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAvatarChange = async (file: File | null) => {
    if (!file) return;
    
    try {
      setIsUploading(true);
      setUploadError(null);
      
      await uploadAvatar(file);
    } catch (error: any) {
      setUploadError(error.response?.data?.message || 'Failed to upload avatar');
      console.error('Avatar upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleThemeToggle = async () => {
    if (!user) return;
    
    try {
      const newTheme = user.theme_preference === 'light' ? 'dark' : 'light';
      await updateThemePreference(newTheme);
    } catch (error) {
      console.error('Theme toggle error:', error);
    }
  };

  const getAvatarUrl = () => {
    if (!user?.avatar) return null;
    
    if (user.avatar.startsWith('http')) {
      return user.avatar;
    }
    
    return `http://localhost:5000/${user.avatar}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-neutral-900 dark:to-neutral-800 py-8 px-4"
    >
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 flex flex-col items-center text-center">
          {/* Theme Toggle Button */}
          <div className="absolute top-4 right-4">
            <button
              onClick={handleThemeToggle}
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              aria-label={`Switch to ${user?.theme_preference === 'light' ? 'dark' : 'light'} mode`}
            >
              {user?.theme_preference === 'dark' ? (
                <SunIcon className="w-5 h-5 text-amber-500" />
              ) : (
                <MoonIcon className="w-5 h-5 text-neutral-500" />
              )}
            </button>
          </div>

          {/* Avatar with Upload */}
          <div className="relative mb-6">
            <div className="w-32 h-32">
              <AvatarUpload
                initialImage={getAvatarUrl()}
                onChange={handleAvatarChange}
                allowCamera={true}
                className="w-32 h-32"
              />
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            {uploadError && (
              <p className="text-red-500 text-xs mt-1">{uploadError}</p>
            )}
          </div>

          {/* Name */}
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">{user?.name || 'Your Name'}</h1>

          {/* Role */}
          <div className="mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300 text-sm font-medium">
              <IdentificationIcon className="w-4 h-4" />
              {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Role'}
            </span>
          </div>

          {/* Info List */}
          <div className="w-full max-w-xs mx-auto mb-6 space-y-4">
            <div className="flex items-center gap-3">
              <EnvelopeIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <span className="text-neutral-700 dark:text-neutral-300 text-base">{user?.email || 'your@email.com'}</span>
            </div>
            <div className="flex items-center gap-3">
              <PhoneIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <span className="text-neutral-700 dark:text-neutral-300 text-base">{user?.phone || 'Not provided'}</span>
            </div>
          </div>

          {/* Edit Button */}
          <Button
            variant="default"
            leftIcon={<PencilSquareIcon className="w-5 h-5" />}
            onClick={() => navigate('/edit-profile')}
            className="mt-2"
          >
            Edit Profile
          </Button>
        </Card>
      </div>
    </motion.div>
  );
};

export default Profile; 