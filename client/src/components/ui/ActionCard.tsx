import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  href?: string;
  onClick?: () => void;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'emerald' | 'violet';
  className?: string;
}

const ActionCard: React.FC<ActionCardProps> = ({
  icon,
  title,
  description,
  href,
  onClick,
  color = 'blue',
  className = ''
}) => {
  // Get color classes based on color prop
  const getColorClasses = (colorName: string) => {
    switch (colorName) {
      case 'blue':
        return 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700';
      case 'green':
        return 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700';
      case 'amber':
        return 'bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 border-amber-200 dark:border-amber-800 hover:border-amber-300 dark:hover:border-amber-700';
      case 'red':
        return 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700';
      case 'purple':
        return 'bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700';
      case 'emerald':
        return 'bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-700';
      case 'violet':
        return 'bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-900/30 border-violet-200 dark:border-violet-800 hover:border-violet-300 dark:hover:border-violet-700';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700';
    }
  };

  // Get icon color classes
  const getIconColorClasses = (colorName: string) => {
    switch (colorName) {
      case 'blue':
        return 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400';
      case 'green':
        return 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400';
      case 'amber':
        return 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400';
      case 'red':
        return 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400';
      case 'purple':
        return 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400';
      case 'emerald':
        return 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400';
      case 'violet':
        return 'bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400';
      default:
        return 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400';
    }
  };

  const content = (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      whileTap={{ y: 0, transition: { duration: 0.2 } }}
      className={`flex flex-col items-center rounded-xl border p-5 transition-all duration-200 ${getColorClasses(color)} ${className}`}
    >
      <div className={`rounded-full p-3 mb-3 ${getIconColorClasses(color)}`}>
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white text-center">
        {title}
      </h3>
      {description && (
        <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400 text-center">
          {description}
        </p>
      )}
    </motion.div>
  );

  if (href) {
    return (
      <Link to={href} className="block">
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className="w-full text-left">
        {content}
      </button>
    );
  }

  return content;
};

export default ActionCard; 