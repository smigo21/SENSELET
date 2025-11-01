// Theme constants for consistent styling across the web-dashboard
export const COLORS = {
  // Severity colors
  CRITICAL: '#D32F2F', // Red
  HIGH: '#F57C00', // Orange
  MEDIUM: '#FBC02D', // Yellow
  LOW: '#388E3C', // Green

  // Status colors
  SAFE: '#4CAF50', // Green
  WARNING: '#FF9800', // Orange
  DANGER: '#F44336', // Red

  // UI colors
  PRIMARY: '#1976D2',
  SECONDARY: '#DC004E',
  BACKGROUND: '#f5f5f5',
  CARD_BACKGROUND: '#ffffff',
  BORDER: '#cccccc',
  TEXT: '#333333',
  TEXT_LIGHT: '#666666',
};

export const FONT_SIZES = {
  SMALL: '0.8em',
  MEDIUM: '1em',
  LARGE: '1.2em',
  XLARGE: '1.5em',
};

export const SPACING = {
  SMALL: '8px',
  MEDIUM: '15px',
  LARGE: '20px',
};

export const BORDER_RADIUS = '8px';

export const BOX_SHADOW = '0 2px 4px rgba(0,0,0,0.1)';

// Utility functions
export const getSeverityColor = (severity: string) => {
  switch (severity.toLowerCase()) {
    case 'critical':
      return COLORS.CRITICAL;
    case 'high':
      return COLORS.HIGH;
    case 'medium':
      return COLORS.MEDIUM;
    case 'low':
      return COLORS.LOW;
    default:
      return COLORS.TEXT_LIGHT;
  }
};

export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'on-time':
    case 'safe':
      return COLORS.SAFE;
    case 'delayed':
    case 'warning':
      return COLORS.WARNING;
    case 'critical':
    case 'danger':
      return COLORS.DANGER;
    default:
      return COLORS.TEXT_LIGHT;
  }
};
