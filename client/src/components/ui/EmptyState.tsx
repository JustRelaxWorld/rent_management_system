import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  actionLabel?: string;
  actionHref?: string;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'compact';
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  actionHref,
  onClick,
  className = '',
  variant = 'default'
}) => {
  const containerClasses = variant === 'compact' 
    ? 'p-6'
    : 'py-12 px-6 sm:px-12';

  const content = (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col items-center justify-center text-center rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 ${containerClasses} ${className}`}
    >
      <div className="rounded-full bg-neutral-100 dark:bg-neutral-700 p-4 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md mb-6">
        {description}
      </p>
      
      {actionLabel && actionHref && (
        <Link to={actionHref}>
          <Button variant="default" size={variant === 'compact' ? 'sm' : 'md'}>
            {actionLabel}
          </Button>
        </Link>
      )}
      
      {actionLabel && onClick && (
        <Button 
          variant="default" 
          size={variant === 'compact' ? 'sm' : 'md'}
          onClick={onClick}
        >
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );

  return content;
};

export default EmptyState; 