import React from 'react';
import { FaUsers, FaShoppingCart, FaTruck, FaCheckCircle } from 'react-icons/fa';
import { COLORS } from '../../assets/colors';

interface OverviewCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<any>;
  color: string;
  change?: string;
}

const OverviewCard: React.FC<OverviewCardProps> = ({ title, value, icon: Icon, color, change }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className="text-sm text-gray-500 mt-1">{change}</p>
          )}
        </div>
        <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
          <Icon className="text-2xl" style={{ color }} />
        </div>
      </div>
    </div>
  );
};

export default OverviewCard;
