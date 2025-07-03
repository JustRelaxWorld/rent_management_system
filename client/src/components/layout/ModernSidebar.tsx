import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../utils/auth-context';
import { motion } from 'framer-motion';
import { 
  HomeIcon, 
  BuildingOfficeIcon, 
  UserGroupIcon, 
  DocumentTextIcon, 
  WrenchIcon, 
  CurrencyDollarIcon,
  ChartBarIcon,
  BellIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';

const ModernSidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Define navigation items based on user role
  const getLandlordNavItems = () => [
    { 
      name: 'Dashboard', 
      href: '/landlord/dashboard', 
      icon: HomeIcon,
      description: 'Overview of your properties',
      color: 'blue'
    },
    { 
      name: 'Properties', 
      href: '/landlord/properties', 
      icon: BuildingOfficeIcon,
      description: 'Manage your properties',
      color: 'green'
    },
    { 
      name: 'Applications', 
      href: '/landlord/applications', 
      icon: DocumentTextIcon,
      description: 'View rental applications',
      color: 'amber'
    },
    { 
      name: 'Maintenance', 
      href: '/landlord/maintenance', 
      icon: WrenchIcon,
      description: 'Handle maintenance requests',
      color: 'red'
    },
    { 
      name: 'Analytics', 
      href: '/landlord/analytics', 
      icon: ChartBarIcon,
      description: 'Property performance insights',
      color: 'purple'
    },
  ];
  
  const getTenantNavItems = () => [
    { 
      name: 'Dashboard', 
      href: '/tenant-dashboard', 
      icon: HomeIcon,
      description: 'Your rental overview',
      color: 'blue'
    },
    { 
      name: 'Properties', 
      href: '/tenant/properties', 
      icon: BuildingOfficeIcon,
      description: 'Browse available properties',
      color: 'green'
    },
    { 
      name: 'Applications', 
      href: '/tenant/applications', 
      icon: DocumentTextIcon,
      description: 'Your rental applications',
      color: 'amber'
    },
    { 
      name: 'Maintenance', 
      href: '/tenant/maintenance', 
      icon: WrenchIcon,
      description: 'Submit maintenance requests',
      color: 'red'
    },
    { 
      name: 'Invoices & History', 
      href: '/tenant/invoices', 
      icon: DocumentTextIcon,
      description: 'View invoices and payment history',
      color: 'purple'
    },
    { 
      name: 'Make Payment', 
      href: '/tenant/payments', 
      icon: CurrencyDollarIcon,
      description: 'Make M-Pesa payments',
      color: 'emerald'
    },
  ];
  
  const getAdminNavItems = () => [
    { 
      name: 'Dashboard', 
      href: '/admin', 
      icon: HomeIcon,
      description: 'System overview',
      color: 'blue'
    },
    { 
      name: 'Users', 
      href: '/admin/users', 
      icon: UserGroupIcon,
      description: 'Manage users',
      color: 'violet'
    },
    { 
      name: 'Properties', 
      href: '/admin/properties', 
      icon: BuildingOfficeIcon,
      description: 'All properties',
      color: 'green'
    },
    { 
      name: 'Maintenance', 
      href: '/admin/maintenance', 
      icon: WrenchIcon,
      description: 'System maintenance',
      color: 'red'
    },
    { 
      name: 'Payments', 
      href: '/admin/payments', 
      icon: CurrencyDollarIcon,
      description: 'Payment management',
      color: 'emerald'
    },
    { 
      name: 'Analytics', 
      href: '/admin/analytics', 
      icon: ChartBarIcon,
      description: 'System analytics',
      color: 'purple'
    },
  ];
  
  const getNavItems = () => {
    if (!user) {
      return getTenantNavItems(); // Fallback to tenant nav for testing
    }
    
    switch (user.role) {
      case 'landlord':
        return getLandlordNavItems();
      case 'tenant':
        return getTenantNavItems();
      case 'admin':
        return getAdminNavItems();
      default:
        return getTenantNavItems();
    }
  };
  
  const navItems = getNavItems();
  
  // Get color classes based on item color and active state
  const getColorClasses = (color: string, isActive: boolean) => {
    if (isActive) {
      switch (color) {
        case 'blue':
          return 'bg-blue-500 text-white';
        case 'green':
          return 'bg-green-500 text-white';
        case 'amber':
          return 'bg-amber-500 text-white';
        case 'red':
          return 'bg-red-500 text-white';
        case 'purple':
          return 'bg-purple-500 text-white';
        case 'emerald':
          return 'bg-emerald-500 text-white';
        case 'violet':
          return 'bg-violet-500 text-white';
        default:
          return 'bg-primary-500 text-white';
      }
    }
    
    // Inactive hover state
    switch (color) {
      case 'blue':
        return 'hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-400';
      case 'green':
        return 'hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-400';
      case 'amber':
        return 'hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-700 dark:hover:text-amber-400';
      case 'red':
        return 'hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-400';
      case 'purple':
        return 'hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-400';
      case 'emerald':
        return 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-400';
      case 'violet':
        return 'hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-700 dark:hover:text-violet-400';
      default:
        return 'hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-700 dark:hover:text-primary-400';
    }
  };

  // Get icon color classes based on item color and active state
  const getIconColorClasses = (color: string, isActive: boolean) => {
    if (isActive) {
      return 'text-white';
    }
    
    switch (color) {
      case 'blue':
        return 'text-blue-500 dark:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-300';
      case 'green':
        return 'text-green-500 dark:text-green-400 group-hover:text-green-600 dark:group-hover:text-green-300';
      case 'amber':
        return 'text-amber-500 dark:text-amber-400 group-hover:text-amber-600 dark:group-hover:text-amber-300';
      case 'red':
        return 'text-red-500 dark:text-red-400 group-hover:text-red-600 dark:group-hover:text-red-300';
      case 'purple':
        return 'text-purple-500 dark:text-purple-400 group-hover:text-purple-600 dark:group-hover:text-purple-300';
      case 'emerald':
        return 'text-emerald-500 dark:text-emerald-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-300';
      case 'violet':
        return 'text-violet-500 dark:text-violet-400 group-hover:text-violet-600 dark:group-hover:text-violet-300';
      default:
        return 'text-primary-500 dark:text-primary-400 group-hover:text-primary-600 dark:group-hover:text-primary-300';
    }
  };

  return (
    <div className="flex h-full flex-col bg-white dark:bg-neutral-800">
      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <div className="mb-6 px-3">
          <h2 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            Main Navigation
          </h2>
        </div>
        
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.href || 
                          (item.href !== '/' && location.pathname.startsWith(item.href));
          
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <NavLink
                to={item.href}
                className={({ isActive }) => 
                  `group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? getColorClasses(item.color, true) + ' shadow-md'
                      : `text-neutral-700 dark:text-neutral-300 ${getColorClasses(item.color, false)}`
                  }`
                }
              >
                <item.icon 
                  className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                    isActive
                      ? 'text-white'
                      : getIconColorClasses(item.color, false)
                  }`} 
                />
                <div className="flex flex-col">
                  <span className="truncate">{item.name}</span>
                  {isActive && (
                    <span className="text-xs font-normal opacity-80 truncate">
                      {item.description}
                    </span>
                  )}
                </div>
              </NavLink>
            </motion.div>
          );
        })}
        
        <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
          <div className="mb-4 px-3">
            <h2 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              System
            </h2>
          </div>
          
          <NavLink
            to="/settings"
            className={({ isActive }) => 
              `group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-md'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 hover:text-neutral-900 dark:hover:text-white'
              }`
            }
          >
            <Cog6ToothIcon 
              className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                location.pathname === '/settings'
                  ? 'text-neutral-900 dark:text-white'
                  : 'text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-300'
              }`} 
            />
            <span className="truncate">Settings</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
};

export default ModernSidebar; 