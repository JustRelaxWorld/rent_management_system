import React from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success' | 'warning' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
      default: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500 shadow-soft hover:shadow-medium',
      secondary: 'bg-accent-100 text-text-950 hover:bg-accent-200 focus:ring-primary-500 border border-accent-200',
      outline: 'border-2 border-primary-500 bg-white text-primary-500 hover:bg-primary-50 focus:ring-primary-500',
      ghost: 'text-text-700 hover:bg-accent-100 focus:ring-primary-500',
      destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-soft',
      success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-soft',
      warning: 'bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500 shadow-soft',
      white: 'bg-white text-primary-700 hover:bg-primary-50 focus:ring-primary-500 shadow-soft hover:shadow-medium',
    };
    
    const sizeClasses = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
      xl: 'h-14 px-8 text-lg',
    };

    const buttonContent = (
      <>
        {loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mr-2"
          >
            <LoadingSpinner size="sm" />
          </motion.div>
        )}
        {!loading && leftIcon && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mr-2"
          >
            {leftIcon}
          </motion.span>
        )}
        <motion.span
          initial={{ opacity: loading ? 0 : 1 }}
          animate={{ opacity: 1 }}
          transition={{ delay: loading ? 0.1 : 0 }}
        >
          {children}
        </motion.span>
        {!loading && rightIcon && (
          <motion.span
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="ml-2"
          >
            {rightIcon}
          </motion.span>
        )}
      </>
    );

    return (
      <motion.div
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        transition={{ duration: 0.1 }}
      >
        <button
          className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
          ref={ref}
          disabled={disabled || loading}
          {...props}
        >
          {buttonContent}
        </button>
      </motion.div>
    );
  }
);

Button.displayName = 'Button';

export { Button }; 