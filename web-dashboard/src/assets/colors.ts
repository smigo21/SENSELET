export const COLORS = {
  farmer: '#22c55e', // Green
  trader: '#3b82f6', // Blue
  transporter: '#f97316', // Orange
  government: '#dc2626', // Red
  admin: '#6b7280', // Gray
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#1f2937',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
};

export const ROLE_COLORS = {
  farmer: COLORS.farmer,
  trader: COLORS.trader,
  transporter: COLORS.transporter,
  government: COLORS.government,
  admin: COLORS.admin,
};

export const STATUS_COLORS = {
  active: COLORS.success,
  inactive: COLORS.textSecondary,
  pending: COLORS.warning,
  suspended: COLORS.error,
};
