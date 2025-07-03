import React from 'react';
import { motion } from 'framer-motion';

interface AuthLoaderProps {
  message?: string;
}

const AuthLoader: React.FC<AuthLoaderProps> = ({ message = 'Authenticating...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-accent-50 dark:bg-neutral-900 flex-col">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full"
        />
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        >
          <div className="text-lg font-bold text-primary-600 dark:text-primary-400">R</div>
        </motion.div>
      </div>
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="mt-4 text-text-700 dark:text-white font-medium"
      >
        {message}
      </motion.p>
    </div>
  );
};

export default AuthLoader; 