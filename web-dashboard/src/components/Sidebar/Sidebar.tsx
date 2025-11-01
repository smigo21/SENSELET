import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaUsers, FaShoppingCart, FaChartLine, FaCog } from 'react-icons/fa';
import { COLORS } from '../../assets/colors';
import { hasPermission } from '../../utils/roles';

interface SidebarProps {
  userRole: string;
}

const Sidebar: React.FC<SidebarProps> = ({ userRole }) => {
  const location = useLocation();

  const menuItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: FaHome,
      permission: 'read',
    },
    {
      path: '/users',
      label: 'User Management',
      icon: FaUsers,
      permission: 'manage_users',
    },
    {
      path: '/orders',
      label: 'Orders & Logistics',
      icon: FaShoppingCart,
      permission: 'read',
    },
    {
      path: '/analytics',
      label: 'Analytics',
      icon: FaChartLine,
      permission: 'view_analytics',
    },
    {
      path: '/settings',
      label: 'Settings',
      icon: FaCog,
      permission: 'read',
    },
  ];

  const filteredMenuItems = menuItems.filter(item =>
    hasPermission(userRole as any, item.permission)
  );

  return (
    <div className="w-64 bg-gray-800 text-white h-screen p-4 fixed left-0 top-0">
      <div className="text-2xl font-bold mb-10 text-center">
        EATMS Admin
      </div>
      <nav>
        <ul className="space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-700 text-gray-300'
                  }`}
                >
                  <Icon className="mr-3" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
