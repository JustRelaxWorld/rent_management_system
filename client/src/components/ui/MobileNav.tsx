import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../utils/auth-context';
import { motion } from 'framer-motion';
import { 
  HomeIcon, 
  BuildingOfficeIcon, 
  DocumentTextIcon, 
  WrenchIcon, 
  CurrencyDollarIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import CommandPalette from './CommandPalette';

const MobileNav: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  
  // Skip rendering if not authenticated
  if (!user) {
    return null;
  }
  
  // Define navigation items based on user role
  const getNavItems = () => {
    if (user?.role === 'landlord') {
      return [
        { name: 'Dashboard', href: '/landlord/dashboard', icon: HomeIcon, color: 'blue' },
        { name: 'Properties', href: '/landlord/properties', icon: BuildingOfficeIcon, color: 'green' },
        { name: 'Applications', href: '/landlord/applications', icon: DocumentTextIcon, color: 'amber' },
        { name: 'Maintenance', href: '/landlord/maintenance', icon: WrenchIcon, color: 'red' },
        { name: 'Analytics', href: '/landlord/analytics', icon: ChartBarIcon, color: 'purple' },
      ];
    } else if (user?.role === 'tenant') {
      return [
        { name: 'Dashboard', href: '/tenant-dashboard', icon: HomeIcon, color: 'blue' },
        { name: 'Properties', href: '/tenant/properties', icon: BuildingOfficeIcon, color: 'green' },
        { name: 'Applications', href: '/tenant/applications', icon: DocumentTextIcon, color: 'amber' },
        { name: 'Maintenance', href: '/tenant/maintenance', icon: WrenchIcon, color: 'red' },
        { name: 'Payments', href: '/tenant/payments', icon: CurrencyDollarIcon, color: 'emerald' },
      ];
    } else {
      return [
        { name: 'Dashboard', href: '/admin', icon: HomeIcon, color: 'blue' },
        { name: 'Users', href: '/admin/users', icon: UserCircleIcon, color: 'violet' },
        { name: 'Properties', href: '/admin/properties', icon: BuildingOfficeIcon, color: 'green' },
        { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon, color: 'purple' },
      ];
    }
  };
  
  const navItems = getNavItems();
  
  // Get color classes based on item color and active state
  const getColorClasses = (color: string, isActive: boolean) => {
    if (isActive) {
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
          return 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400';
      }
    }
    
    return 'text-neutral-600 dark:text-neutral-400';
  };
  
  // Get icon color classes based on item color and active state
  const getIconColorClasses = (color: string, isActive: boolean) => {
    if (isActive) {
      switch (color) {
        case 'blue':
          return 'text-blue-600 dark:text-blue-400';
        case 'green':
          return 'text-green-600 dark:text-green-400';
        case 'amber':
          return 'text-amber-600 dark:text-amber-400';
        case 'red':
          return 'text-red-600 dark:text-red-400';
        case 'purple':
          return 'text-purple-600 dark:text-purple-400';
        case 'emerald':
          return 'text-emerald-600 dark:text-emerald-400';
        case 'violet':
          return 'text-violet-600 dark:text-violet-400';
        default:
          return 'text-primary-600 dark:text-primary-400';
      }
    }
    
    return 'text-neutral-500 dark:text-neutral-400';
  };
  
  return (
    <>
      {/* Command Palette */}
      <CommandPalette 
        isOpen={commandPaletteOpen} 
        onClose={() => setCommandPaletteOpen(false)} 
      />
      
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 shadow-lg">
        <div className="grid grid-cols-5 gap-1 p-1">
          {navItems.slice(0, 4).map((item) => {
            const isActive = location.pathname === item.href || 
                           (item.href !== '/' && location.pathname.startsWith(item.href));
                           
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors duration-200 ${
                  isActive 
                    ? getColorClasses(item.color, true)
                    : getColorClasses(item.color, false)
                }`}
              >
                <item.icon className={`h-5 w-5 ${getIconColorClasses(item.color, isActive)}`} />
                <span className="text-xs mt-1 font-medium">{item.name}</span>
              </Link>
            );
          })}
          
          {/* Search button */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex flex-col items-center justify-center p-2 rounded-lg text-neutral-600 dark:text-neutral-400"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
            <span className="text-xs mt-1 font-medium">Search</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default MobileNav; 