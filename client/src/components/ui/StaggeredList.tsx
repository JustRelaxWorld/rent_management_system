import React from 'react';
import { motion } from 'framer-motion';

interface StaggeredListProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  containerDelay?: number;
}

const StaggeredList: React.FC<StaggeredListProps> = ({ 
  children, 
  className = '',
  staggerDelay = 0.1,
  containerDelay = 0
}) => {
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
      className={className}
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

export default StaggeredList; 