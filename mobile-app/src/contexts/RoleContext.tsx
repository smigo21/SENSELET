import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';

type UserRole = 'farmer' | 'trader' | 'transporter' | 'government';

interface RolePermissions {
  canCreateOffers: boolean;
  canViewMarketplace: boolean;
  canBookTransport: boolean;
  canManageTrips: boolean;
  canViewAnalytics: boolean;
  canScanQR: boolean;
}

const rolePermissions: Record<UserRole, RolePermissions> = {
  farmer: {
    canCreateOffers: true,
    canViewMarketplace: true,
    canBookTransport: true,
    canManageTrips: false,
    canViewAnalytics: false,
    canScanQR: false,
  },
  trader: {
    canCreateOffers: false,
    canViewMarketplace: true,
    canBookTransport: true,
    canManageTrips: false,
    canViewAnalytics: true,
    canScanQR: false,
  },
  transporter: {
    canCreateOffers: false,
    canViewMarketplace: false,
    canBookTransport: false,
    canManageTrips: true,
    canViewAnalytics: false,
    canScanQR: true,
  },
  government: {
    canCreateOffers: false,
    canViewMarketplace: false,
    canBookTransport: false,
    canManageTrips: false,
    canViewAnalytics: true,
    canScanQR: true,
  },
};

interface RoleContextType {
  userRole: UserRole | null;
  permissions: RolePermissions;
  hasPermission: (permission: keyof RolePermissions) => boolean;
  getRoleDisplayName: () => string;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

interface RoleProviderProps {
  children: ReactNode;
}

export const RoleProvider: React.FC<RoleProviderProps> = ({ children }) => {
  const { state } = useAuth();
  const userRole = state.user?.user_type as UserRole || null;
  const permissions = userRole ? rolePermissions[userRole] : {
    canCreateOffers: false,
    canViewMarketplace: false,
    canBookTransport: false,
    canManageTrips: false,
    canViewAnalytics: false,
    canScanQR: false,
  };

  const hasPermission = (permission: keyof RolePermissions): boolean => {
    return permissions[permission];
  };

  const getRoleDisplayName = (): string => {
    if (!userRole) return 'Guest';

    const displayNames: Record<UserRole, string> = {
      farmer: 'Farmer',
      trader: 'Trader',
      transporter: 'Transporter',
      government: 'Government Official',
    };

    return displayNames[userRole];
  };

  const value: RoleContextType = {
    userRole,
    permissions,
    hasPermission,
    getRoleDisplayName,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

export const useRole = (): RoleContextType => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
