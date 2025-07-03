import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  type?: 'fade' | 'slide' | 'slideUp' | 'slideDown' | 'scale' | 'none' | 'fadeIn';
  duration?: number;
  delay?: number;
}

// Define different transition variants
const transitionVariants = {
  fade: {
    initial: { opacity: 0 },
    in: { opacity: 1 },
    out: { opacity: 0 },
  },
  fadeIn: {
    initial: { opacity: 0 },
    in: { opacity: 1 },
    out: { opacity: 0, transition: { duration: 0.1 } },
  },
  slide: {
    initial: { opacity: 0, x: -20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: 20 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: 20 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.96 },
    in: { opacity: 1, scale: 1 },
    out: { opacity: 0, scale: 1.04 },
  },
  none: {
    initial: {},
    in: {},
    out: {},
  }
};

const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  className = '',
  type = 'fade',
  duration = 0.3,
  delay = 0
}) => {
  const location = useLocation();
  const variants = transitionVariants[type];

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={variants}
        transition={{
          type: 'tween',
          ease: 'easeInOut',
          duration: duration,
          delay: delay,
        }}
        className={`${className} w-full`}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Component that applies only to its direct children (for content transitions)
export const ContentTransition: React.FC<PageTransitionProps> = ({
  children,
  className = '',
  type = 'fade',
  duration = 0.2,
  delay = 0
}) => {
  const variants = transitionVariants[type];
  
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={variants}
      transition={{
        type: 'tween',
        ease: 'easeInOut',
        duration: duration,
        delay: delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Component for staggered item animations in lists
export const StaggerItem: React.FC<{ 
  children: React.ReactNode;
  index: number;
  className?: string;
  baseDelay?: number;
}> = ({ children, index, className = '', baseDelay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: baseDelay + (index * 0.05), // Staggered delay based on item index
        duration: 0.2,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Component for fading in elements when they come into view
export const FadeInView: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
  amount?: number; // How much of the element needs to be visible (0-1)
}> = ({ children, className = '', delay = 0, amount = 0.1 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: amount }}
      transition={{
        duration: 0.4,
        delay: delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition; 