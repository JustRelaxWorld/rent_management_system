import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

const TestWorkOS: React.FC = () => {
  const redirectToWorkOS = (provider: string) => {
    window.location.href = `http://localhost:5000/auth/login?provider=${provider}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-accent-50 dark:bg-neutral-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-text-950 dark:text-white mb-2">
            WorkOS Authentication Test
          </h1>
          <p className="text-text-600 dark:text-neutral-400">
            Test the WorkOS authentication integration
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-soft border border-accent-200 dark:border-neutral-700 p-6">
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => redirectToWorkOS('google')}
              className="w-full flex items-center justify-center px-4 py-3 border border-accent-300 dark:border-neutral-600 rounded-xl text-sm font-medium text-text-700 dark:text-white bg-white dark:bg-neutral-800 hover:bg-accent-50 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-neutral-800 transition-colors"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
            
            <button
              type="button"
              onClick={() => redirectToWorkOS('apple')}
              className="w-full flex items-center justify-center px-4 py-3 border border-accent-300 dark:border-neutral-600 rounded-xl text-sm font-medium text-text-700 dark:text-white bg-white dark:bg-neutral-800 hover:bg-accent-50 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-neutral-800 transition-colors"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.78 1.18-.19 2.33-.92 3.57-.78 1.5.17 2.63.91 3.23 2.18-3.14 1.84-2.29 6.42.82 7.7-.67 1.43-1.36 2.86-2.7 3.09z" fill="currentColor"/>
                <path d="M12.03 7.25c-.15-2.23 1.66-4.31 3.74-4.5.27 2.57-2.01 4.62-3.74 4.5z" fill="currentColor"/>
              </svg>
              Sign in with Apple
            </button>
            
            <button
              type="button"
              onClick={() => redirectToWorkOS('email')}
              className="w-full flex items-center justify-center px-4 py-3 border border-accent-300 dark:border-neutral-600 rounded-xl text-sm font-medium text-text-700 dark:text-white bg-white dark:bg-neutral-800 hover:bg-accent-50 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-neutral-800 transition-colors"
            >
              <EnvelopeIcon className="h-5 w-5 mr-2" />
              Sign in with Email
            </button>
          </div>
          
          <div className="mt-6 pt-6 border-t border-accent-200 dark:border-neutral-700">
            <div className="flex justify-between">
              <Link 
                to="/login" 
                className="text-sm font-medium text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Back to Login
              </Link>
              <Link 
                to="/register" 
                className="text-sm font-medium text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <h2 className="text-lg font-semibold text-text-950 dark:text-white mb-2">
            Callback URLs
          </h2>
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 text-left text-sm">
            <p className="font-semibold mb-1">Development:</p>
            <code className="block bg-accent-100 dark:bg-neutral-700 p-2 rounded mb-3">
              http://localhost:5000/auth/callback
            </code>
            
            <p className="font-semibold mb-1">Production:</p>
            <code className="block bg-accent-100 dark:bg-neutral-700 p-2 rounded">
              https://api.myapp.com/auth/callback
            </code>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TestWorkOS; 