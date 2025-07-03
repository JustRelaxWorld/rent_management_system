import React from 'react';
import { motion } from 'framer-motion';

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    xs?: number; // 1-12
    sm?: number; // 1-12
    md?: number; // 1-12
    lg?: number; // 1-12
    xl?: number; // 1-12
    '2xl'?: number; // 1-12
  };
  gap?: {
    xs?: number; // 1-12
    sm?: number; // 1-12
    md?: number; // 1-12
    lg?: number; // 1-12
    xl?: number; // 1-12
    '2xl'?: number; // 1-12
  };
  staggerDelay?: number;
  containerDelay?: number;
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className = '',
  cols = { xs: 1, sm: 2, md: 3, lg: 4, xl: 5, '2xl': 6 },
  gap = { xs: 4, sm: 4, md: 6, lg: 6, xl: 8, '2xl': 8 },
  staggerDelay = 0.1,
  containerDelay = 0
}) => {
  // Generate responsive grid classes
  const getGridCols = () => {
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    return breakpoints.map(bp => {
      const colCount = cols[bp as keyof typeof cols];
      if (!colCount) return '';
      
      const gridCols = {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
        5: 'grid-cols-5',
        6: 'grid-cols-6',
        7: 'grid-cols-7',
        8: 'grid-cols-8',
        9: 'grid-cols-9',
        10: 'grid-cols-10',
        11: 'grid-cols-11',
        12: 'grid-cols-12',
      }[colCount] || 'grid-cols-1';

      if (bp === 'xs') return gridCols;
      return `${bp}:${gridCols}`;
    }).join(' ');
  };

  const getGridGap = () => {
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    return breakpoints.map(bp => {
      const gapSize = gap[bp as keyof typeof gap];
      if (!gapSize) return '';
      
      const gapClass = {
        1: 'gap-1',
        2: 'gap-2',
        3: 'gap-3',
        4: 'gap-4',
        5: 'gap-5',
        6: 'gap-6',
        7: 'gap-7',
        8: 'gap-8',
        9: 'gap-9',
        10: 'gap-10',
        11: 'gap-11',
        12: 'gap-12',
      }[gapSize] || 'gap-4';

      if (bp === 'xs') return gapClass;
      return `${bp}:${gapClass}`;
    }).join(' ');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: containerDelay,
        staggerChildren: staggerDelay,
      },
    },
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: 'easeOut' as const
      }
    },
  };

  return (
    <motion.div
      className={`grid ${getGridCols()} ${getGridGap()} ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          whileHover={{ 
            y: -2,
            transition: { duration: 0.2 }
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ResponsiveGrid; 