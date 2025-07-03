import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpIcon, ArrowDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Card } from './Card';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconColor?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'emerald' | 'violet';
  description?: string;
  trend?: number;
  trendLabel?: string;
  linkHref?: string;
  linkLabel?: string;
  className?: string;
  onClick?: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  iconColor = 'blue',
  description,
  trend,
  trendLabel,
  linkHref,
  linkLabel,
  className = '',
  onClick
}) => {
  // Get color classes based on icon color
  const getIconColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'green':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      case 'amber':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400';
      case 'red':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
      case 'purple':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
      case 'emerald':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400';
      case 'violet':
        return 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400';
      default:
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
    }
  };

  // Get trend color classes
  const getTrendColorClasses = (trendValue: number) => {
    if (trendValue > 0) {
      return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
    } else if (trendValue < 0) {
      return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
    }
    return 'text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900/20';
  };

  return (
    <Card 
      className={`h-full transition-all duration-300 ${className}`}
      onClick={onClick}
      hover={!!onClick}
    >
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-lg p-3 ${getIconColorClasses(iconColor)}`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400 truncate">{title}</dt>
              <dd>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-xl font-semibold text-neutral-900 dark:text-white"
                >
                  {value}
                </motion.div>
                {description && (
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">
                    {description}
                  </div>
                )}
                {trend !== undefined && (
                  <div className="mt-1 flex items-center">
                    <span 
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTrendColorClasses(trend)}`}
                    >
                      {trend > 0 ? (
                        <ArrowUpIcon className="mr-1 h-3 w-3" />
                      ) : trend < 0 ? (
                        <ArrowDownIcon className="mr-1 h-3 w-3" />
                      ) : null}
                      {Math.abs(trend)}%
                    </span>
                    {trendLabel && (
                      <span className="ml-2 text-xs text-neutral-500 dark:text-neutral-400">
                        {trendLabel}
                      </span>
                    )}
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
      
      {linkHref && linkLabel && (
        <div className="bg-neutral-50 dark:bg-neutral-700/50 px-5 py-3 border-t border-neutral-200 dark:border-neutral-700">
          <div className="text-sm">
            <Link 
              to={linkHref} 
              className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 flex items-center justify-between"
            >
              {linkLabel}
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </Card>
  );
};

export default StatsCard; 