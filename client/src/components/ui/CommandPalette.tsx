import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  XMarkIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  WrenchIcon,
  HomeIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../utils/auth-context';

interface CommandItem {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  href: string;
  keywords: string[];
  category: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<CommandItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Command items based on user role
  const getLandlordCommands = (): CommandItem[] => [
    {
      id: 'dashboard',
      name: 'Dashboard',
      description: 'Go to your landlord dashboard',
      icon: HomeIcon,
      href: '/landlord/dashboard',
      keywords: ['home', 'main', 'overview'],
      category: 'Pages'
    },
    {
      id: 'properties',
      name: 'Properties',
      description: 'Manage your rental properties',
      icon: BuildingOfficeIcon,
      href: '/landlord/properties',
      keywords: ['houses', 'apartments', 'units', 'real estate'],
      category: 'Pages'
    },
    {
      id: 'add-property',
      name: 'Add Property',
      description: 'List a new rental property',
      icon: BuildingOfficeIcon,
      href: '/landlord/properties/add',
      keywords: ['new', 'create', 'add', 'listing'],
      category: 'Actions'
    },
    {
      id: 'applications',
      name: 'Applications',
      description: 'View and manage tenant applications',
      icon: DocumentTextIcon,
      href: '/landlord/applications',
      keywords: ['tenants', 'requests', 'forms'],
      category: 'Pages'
    },
    {
      id: 'maintenance',
      name: 'Maintenance Requests',
      description: 'View maintenance requests from tenants',
      icon: WrenchIcon,
      href: '/landlord/maintenance',
      keywords: ['repairs', 'issues', 'fix', 'service'],
      category: 'Pages'
    },
    {
      id: 'profile',
      name: 'My Profile',
      description: 'View and edit your profile',
      icon: UserGroupIcon,
      href: '/profile',
      keywords: ['account', 'settings', 'personal'],
      category: 'Account'
    }
  ];

  const getTenantCommands = (): CommandItem[] => [
    {
      id: 'dashboard',
      name: 'Dashboard',
      description: 'Go to your tenant dashboard',
      icon: HomeIcon,
      href: '/tenant-dashboard',
      keywords: ['home', 'main', 'overview'],
      category: 'Pages'
    },
    {
      id: 'properties',
      name: 'Browse Properties',
      description: 'Find available rental properties',
      icon: BuildingOfficeIcon,
      href: '/tenant/properties',
      keywords: ['houses', 'apartments', 'units', 'rent', 'search'],
      category: 'Pages'
    },
    {
      id: 'applications',
      name: 'My Applications',
      description: 'View your rental applications',
      icon: DocumentTextIcon,
      href: '/tenant/applications',
      keywords: ['requests', 'forms', 'status'],
      category: 'Pages'
    },
    {
      id: 'maintenance',
      name: 'Maintenance Requests',
      description: 'Submit and track maintenance requests',
      icon: WrenchIcon,
      href: '/tenant/maintenance',
      keywords: ['repairs', 'issues', 'fix', 'service'],
      category: 'Pages'
    },
    {
      id: 'payments',
      name: 'Payments',
      description: 'Make and track rent payments',
      icon: CurrencyDollarIcon,
      href: '/tenant/payments',
      keywords: ['rent', 'invoices', 'bills', 'money'],
      category: 'Pages'
    },
    {
      id: 'profile',
      name: 'My Profile',
      description: 'View and edit your profile',
      icon: UserGroupIcon,
      href: '/profile',
      keywords: ['account', 'settings', 'personal'],
      category: 'Account'
    }
  ];

  const getAdminCommands = (): CommandItem[] => [
    {
      id: 'dashboard',
      name: 'Admin Dashboard',
      description: 'Go to admin dashboard',
      icon: HomeIcon,
      href: '/admin',
      keywords: ['home', 'main', 'overview'],
      category: 'Pages'
    },
    {
      id: 'users',
      name: 'Manage Users',
      description: 'View and manage system users',
      icon: UserGroupIcon,
      href: '/admin/users',
      keywords: ['accounts', 'tenants', 'landlords'],
      category: 'Pages'
    },
    {
      id: 'properties',
      name: 'All Properties',
      description: 'Manage all properties in the system',
      icon: BuildingOfficeIcon,
      href: '/admin/properties',
      keywords: ['houses', 'apartments', 'units', 'real estate'],
      category: 'Pages'
    },
    {
      id: 'profile',
      name: 'My Profile',
      description: 'View and edit your profile',
      icon: UserGroupIcon,
      href: '/profile',
      keywords: ['account', 'settings', 'personal'],
      category: 'Account'
    }
  ];

  // Get commands based on user role
  const getCommands = (): CommandItem[] => {
    if (!user) return [];
    
    switch (user.role) {
      case 'landlord':
        return getLandlordCommands();
      case 'tenant':
        return getTenantCommands();
      case 'admin':
        return getAdminCommands();
      default:
        return [];
    }
  };

  // Filter commands based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults(getCommands());
      return;
    }

    const filtered = getCommands().filter(item => {
      const searchLower = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.keywords.some(keyword => keyword.toLowerCase().includes(searchLower))
      );
    });

    setResults(filtered);
    setSelectedIndex(0);
  }, [searchQuery, user]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prevIndex => 
          prevIndex < results.length - 1 ? prevIndex + 1 : prevIndex
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prevIndex => (prevIndex > 0 ? prevIndex - 1 : 0));
        break;
      case 'Enter':
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        onClose();
        break;
      default:
        break;
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    const selectedElement = document.getElementById(`result-${selectedIndex}`);
    if (selectedElement && resultContainerRef.current) {
      selectedElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [selectedIndex]);

  // Handle item selection
  const handleSelect = (item: CommandItem) => {
    navigate(item.href);
    onClose();
    setSearchQuery('');
  };

  // Group results by category
  const groupedResults = results.reduce<Record<string, CommandItem[]>>((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Command palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed left-1/2 top-1/4 z-50 w-full max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-800"
            onKeyDown={handleKeyDown}
          >
            {/* Search input */}
            <div className="flex items-center border-b border-neutral-200 px-4 dark:border-neutral-700">
              <MagnifyingGlassIcon className="h-5 w-5 text-neutral-500" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for pages, features, or actions..."
                className="flex-1 bg-transparent px-4 py-4 text-base text-neutral-900 outline-none placeholder:text-neutral-500 dark:text-white"
                autoComplete="off"
              />
              <button
                onClick={onClose}
                className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            {/* Results */}
            <div 
              ref={resultContainerRef}
              className="max-h-80 overflow-y-auto p-2"
            >
              {Object.entries(groupedResults).length > 0 ? (
                Object.entries(groupedResults).map(([category, items]) => (
                  <div key={category} className="mb-4">
                    <h3 className="mb-2 px-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                      {category}
                    </h3>
                    <div className="space-y-1">
                      {items.map((item, index) => {
                        const isSelected = results.indexOf(item) === selectedIndex;
                        return (
                          <div
                            id={`result-${results.indexOf(item)}`}
                            key={item.id}
                            className={`flex cursor-pointer items-center rounded-lg px-3 py-2 ${
                              isSelected
                                ? 'bg-primary-100 dark:bg-primary-900/30'
                                : 'hover:bg-neutral-100 dark:hover:bg-neutral-700/50'
                            }`}
                            onClick={() => handleSelect(item)}
                          >
                            <div className={`mr-3 rounded-md p-2 ${
                              isSelected 
                                ? 'bg-primary-500 text-white' 
                                : 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300'
                            }`}>
                              <item.icon className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-medium text-neutral-900 dark:text-white">
                                {item.name}
                              </div>
                              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                {item.description}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="rounded-full bg-neutral-100 p-3 dark:bg-neutral-700">
                    <MagnifyingGlassIcon className="h-6 w-6 text-neutral-500 dark:text-neutral-400" />
                  </div>
                  <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                    No results found
                  </p>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="border-t border-neutral-200 px-4 py-2 text-xs text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
              <div className="flex items-center justify-between">
                <div className="flex space-x-4">
                  <div className="flex items-center">
                    <kbd className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300">
                      ↑
                    </kbd>
                    <kbd className="ml-1 rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300">
                      ↓
                    </kbd>
                    <span className="ml-2">to navigate</span>
                  </div>
                  <div className="flex items-center">
                    <kbd className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300">
                      Enter
                    </kbd>
                    <span className="ml-2">to select</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <kbd className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300">
                    Esc
                  </kbd>
                  <span className="ml-2">to close</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette; 