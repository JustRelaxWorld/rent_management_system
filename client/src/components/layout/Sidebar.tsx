import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../utils/auth-context';
import { 
  HomeIcon, 
  BuildingOfficeIcon, 
  UserGroupIcon, 
  DocumentTextIcon, 
  WrenchIcon, 
  CurrencyDollarIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  // Define navigation items based on user role
  const getLandlordNavItems = () => [
    { name: 'Dashboard', href: '/landlord/dashboard', icon: HomeIcon },
    { name: 'Properties', href: '/landlord/properties', icon: BuildingOfficeIcon },
    { name: 'Applications', href: '/landlord/applications', icon: DocumentTextIcon },
    { name: 'Maintenance', href: '/landlord/maintenance', icon: WrenchIcon },
    { name: 'Profile', href: '/profile/edit', icon: UserCircleIcon },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  ];
  
  const getTenantNavItems = () => [
    { name: 'Dashboard', href: '/tenant-dashboard', icon: HomeIcon },
    { name: 'Properties', href: '/tenant/properties', icon: BuildingOfficeIcon },
    { name: 'Applications', href: '/tenant/applications', icon: DocumentTextIcon },
    { name: 'Maintenance', href: '/tenant/maintenance', icon: WrenchIcon },
    { name: 'Payments', href: '/tenant/payments', icon: CurrencyDollarIcon },
    { name: 'Profile', href: '/profile/edit', icon: UserCircleIcon },
  ];
  
  const getAdminNavItems = () => [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Users', href: '/admin/users', icon: UserGroupIcon },
    { name: 'Properties', href: '/admin/properties', icon: BuildingOfficeIcon },
    { name: 'Maintenance', href: '/admin/maintenance', icon: WrenchIcon },
    { name: 'Payments', href: '/admin/payments', icon: CurrencyDollarIcon },
    { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
  ];
  
  const getNavItems = () => {
    if (!user) return [];
    
    switch (user.role) {
      case 'landlord':
        return getLandlordNavItems();
      case 'tenant':
        return getTenantNavItems();
      case 'admin':
        return getAdminNavItems();
      default:
        return [];
    }
  };
  
  const navItems = getNavItems();
  
  const handleLogout = () => {
    logout();
  };
  
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <span className="text-xl font-semibold text-primary-600">RentEase</span>
          </div>
          <button 
            onClick={toggleSidebar}
            className="p-1 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 lg:hidden"
          >
            <span className="sr-only">Close sidebar</span>
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* User info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || 
                            (item.href !== '/' && location.pathname.startsWith(item.href));
            
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) => 
                  `flex items-center px-2 py-2 text-sm font-medium rounded-md group transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <item.icon 
                  className={`mr-3 h-5 w-5 transition-colors ${
                    isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`} 
                />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
        
        {/* Logout button */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={handleLogout}
            className="flex items-center px-2 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 w-full"
          >
            <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-red-500" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 