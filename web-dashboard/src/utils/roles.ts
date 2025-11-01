export type UserRole = 'admin' | 'government' | 'farmer' | 'trader' | 'transporter';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  nationalId: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  region: string;
  phone?: string;
  email?: string;
  createdAt: Date;
  lastLogin?: Date;
}

export const ROLE_PERMISSIONS = {
  admin: ['read', 'write', 'delete', 'manage_users', 'view_analytics', 'export_reports'],
  government: ['read', 'write', 'view_analytics', 'export_reports'],
  farmer: ['read', 'write'],
  trader: ['read', 'write'],
  transporter: ['read', 'write'],
};

export const hasPermission = (userRole: UserRole, permission: string): boolean => {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
};

export const getRoleDisplayName = (role: UserRole): string => {
  const names = {
    admin: 'Administrator',
    government: 'Government Official',
    farmer: 'Farmer',
    trader: 'Trader',
    transporter: 'Transporter',
  };
  return names[role] || role;
};

export const getStatusDisplayName = (status: string): string => {
  const names = {
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    suspended: 'Suspended',
  };
  return names[status as keyof typeof names] || status;
};
