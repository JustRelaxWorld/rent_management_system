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

interface SearchResult {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  category: string;
}

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchDialog: React.FC<SearchDialogProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Mock search results - in a real app, this would come from an API
  const mockResults: SearchResult[] = [
    {
      id: '1',
      title: 'Property #1234',
      description: '3 bedroom apartment in Westlands',
      icon: BuildingOfficeIcon,
      href: '/landlord/properties/1234',
      category: 'Properties'
    },
    {
      id: '2',
      title: 'Property #5678',
      description: '2 bedroom house in Karen',
      icon: BuildingOfficeIcon,
      href: '/landlord/properties/5678',
      category: 'Properties'
    },
    {
      id: '3',
      title: 'John Doe',
      description: 'Tenant since Jan 2023',
      icon: UserGroupIcon,
      href: '/landlord/tenants/101',
      category: 'Tenants'
    },
    {
      id: '4',
      title: 'Application #A123',
      description: 'From Mary Smith for Property #1234',
      icon: DocumentTextIcon,
      href: '/landlord/applications/A123',
      category: 'Applications'
    },
    {
      id: '5',
      title: 'Maintenance #M456',
      description: 'Plumbing issue at Property #5678',
      icon: WrenchIcon,
      href: '/landlord/maintenance/M456',
      category: 'Maintenance'
    }
  ];

  // Filter results based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const filtered = mockResults.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setResults(filtered);
    setSelectedIndex(0);
  }, [searchQuery]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
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

  // Handle item selection
  const handleSelect = (item: SearchResult) => {
    navigate(item.href);
    onClose();
    setSearchQuery('');
  };

  // Group results by category
  const groupedResults = results.reduce<Record<string, SearchResult[]>>((acc, item) => {
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
          
          {/* Search dialog */}
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
                placeholder="Search for properties, tenants, applications..."
                className="flex-1 bg-transparent px-4 py-4 text-base text-neutral-900 outline-none placeholder:text-neutral-500 dark:text-white dark:placeholder:text-neutral-400"
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
            <div className="max-h-80 overflow-y-auto p-2">
              {searchQuery.trim() === '' ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="rounded-full bg-neutral-100 p-3 dark:bg-neutral-700">
                    <MagnifyingGlassIcon className="h-6 w-6 text-neutral-500 dark:text-neutral-400" />
                  </div>
                  <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                    Type to start searching
                  </p>
                </div>
              ) : Object.entries(groupedResults).length > 0 ? (
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
                                {item.title}
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

export default SearchDialog; 