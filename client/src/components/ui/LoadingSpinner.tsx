import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white';
  fullScreen?: boolean;
  message?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  fullScreen = false,
  message,
  className = ''
}) => {
  // Define size classes
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4'
  };
  
  // Define color classes
  const colorClasses = {
    primary: 'border-primary-500 border-t-transparent',
    secondary: 'border-neutral-500 border-t-transparent',
    white: 'border-white border-t-transparent'
  };
  
  const spinner = (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={`rounded-full ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
    />
  );
  
  // Full screen spinner with overlay
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center">
          {spinner}
          {message && (
            <p className="mt-4 text-neutral-700 dark:text-neutral-300 text-center">
              {message}
            </p>
          )}
        </div>
      </div>
    );
  }
  
  // Regular spinner
  return (
    <div className="flex flex-col items-center">
      {spinner}
      {message && (
        <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300 text-center">
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner; 