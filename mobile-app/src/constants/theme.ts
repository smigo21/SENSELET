export const theme = {
  colors: {
    primary: '#2c7a2b',
    primaryDark: '#1a5a1a',
    secondary: '#ff6b35',
    secondaryDark: '#e55a2b',
    background: '#f5f5f5',
    surface: '#ffffff',
    text: '#333333',
    textSecondary: '#666666',
    border: '#e0e0e0',
    error: '#d32f2f',
    success: '#28a745',
    warning: '#ffc107',
    info: '#17a2b8',
    // Role-based colors
    farmer: {
      primary: '#2c7a2b', // Green/earthy
      secondary: '#4a9b3a',
      accent: '#6fbf73',
      background: '#f1f8e9',
    },
    trader: {
      primary: '#1976d2', // Blue/marketplace
      secondary: '#42a5f5',
      accent: '#64b5f6',
      background: '#e3f2fd',
    },
    transporter: {
      primary: '#ff6b35', // Orange/alert
      secondary: '#ff8a65',
      accent: '#ffab91',
      background: '#fff3e0',
    },
  },
  spacing: {
    xs: 4,
    small: 8,
    medium: 16,
    large: 24,
    xl: 32,
    xxl: 48,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold' as const,
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold' as const,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
    },
    body: {
      fontSize: 16,
      fontWeight: 'normal' as const,
    },
    caption: {
      fontSize: 12,
      fontWeight: 'normal' as const,
    },
  },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
    round: 50,
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};
