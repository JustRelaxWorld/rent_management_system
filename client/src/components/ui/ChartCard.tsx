import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from './Card';

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  timeRanges?: string[];
  onTimeRangeChange?: (range: string) => void;
  actions?: React.ReactNode;
  className?: string;
  height?: string;
  loading?: boolean;
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  description,
  children,
  timeRanges,
  onTimeRangeChange,
  actions,
  className = '',
  height = 'h-64',
  loading = false
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRanges ? timeRanges[0] : '');

  const handleTimeRangeChange = (range: string) => {
    setSelectedTimeRange(range);
    if (onTimeRangeChange) {
      onTimeRangeChange(range);
    }
  };

  return (
    <Card className={`overflow-hidden ${className}`} hover={false}>
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-700 p-4">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {description}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {timeRanges && timeRanges.length > 0 && (
            <div className="flex rounded-lg bg-neutral-100 dark:bg-neutral-700 p-1">
              {timeRanges.map((range) => (
                <button
                  key={range}
                  className={`relative px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    selectedTimeRange === range
                      ? 'text-white'
                      : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                  onClick={() => handleTimeRangeChange(range)}
                >
                  {selectedTimeRange === range && (
                    <motion.div
                      layoutId="timeRangeIndicator"
                      className="absolute inset-0 bg-primary-500 rounded-md"
                      transition={{ type: 'spring', duration: 0.5 }}
                    />
                  )}
                  <span className="relative z-10">{range}</span>
                </button>
              ))}
            </div>
          )}
          
          {actions}
        </div>
      </div>
      
      <div className={`p-4 ${height}`}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          children
        )}
      </div>
    </Card>
  );
};

export default ChartCard; 