// Application constants

export const APP_CONFIG = {
  NAME: 'EATMS Mobile',
  VERSION: '1.0.0',
  DESCRIPTION: 'Ethiopian Agri-Chain Transparency and Monitoring System Mobile Application',
};

export const API_ENDPOINTS = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  WS_URL: process.env.REACT_APP_WS_URL || 'ws://localhost:8000',

  AUTH: {
    LOGIN: '/auth/login/',
    REGISTER: '/auth/register/',
    LOGOUT: '/auth/logout/',
    REFRESH: '/auth/refresh/',
  },

  CROPS: {
    LIST: '/crops/',
    CREATE: '/crops/',
    DETAIL: '/crops/{id}/',
    UPDATE: '/crops/{id}/',
    DELETE: '/crops/{id}/',
  },

  OFFERS: {
    LIST: '/offers/',
    CREATE: '/offers/',
    DETAIL: '/offers/{id}/',
    UPDATE: '/offers/{id}/',
    ACCEPT: '/offers/{id}/accept/',
  },

  MARKET_PRICES: {
    LIST: '/market-prices/',
    LATEST: '/market-prices/latest/',
  },

  TRANSPORT: {
    BOOK: '/transport/book/',
    TRIPS: '/transport/trips/',
    TRIP_DETAIL: '/transport/trips/{id}/',
    UPDATE_STATUS: '/transport/trips/{id}/status/',
  },

  NOTIFICATIONS: {
    LIST: '/notifications/',
    MARK_READ: '/notifications/{id}/read/',
    MARK_ALL_READ: '/notifications/read-all/',
  },

  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard/',
    REPORTS: '/analytics/reports/',
  },
};

export const CROP_TYPES = [
  'Teff',
  'Wheat',
  'Barley',
  'Maize',
  'Sorghum',
  'Coffee',
  'Sesame',
  'Lentils',
  'Chickpeas',
  'Beans',
  'Rice',
  'Potatoes',
  'Onions',
  'Tomatoes',
  'Peppers',
] as const;

export const QUALITY_GRADES = ['A', 'B', 'C'] as const;

export const UNITS = ['kg', 'tons', 'quintal', 'sacks'] as const;

export const USER_TYPES = {
  FARMER: 'farmer',
  TRADER: 'trader',
  TRANSPORTER: 'transporter',
  GOVERNMENT: 'government',
} as const;

export const TRIP_STATUSES = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

export const ETHIOPIAN_REGIONS = [
  'Addis Ababa',
  'Afar',
  'Amhara',
  'Benishangul-Gumuz',
  'Dire Dawa',
  'Gambela',
  'Harari',
  'Oromia',
  'Sidama',
  'Somali',
  'South West Ethiopia Peoples\' Region',
  'Southern Nations, Nationalities, and Peoples\' Region',
  'Tigray',
] as const;

export const PAYMENT_METHODS = [
  'Cash',
  'Bank Transfer',
  'Mobile Money',
  'Check',
] as const;

export const STORAGE_KEYS = {
  USER: 'user',
  TOKEN: 'token',
  SETTINGS: 'settings',
  CACHE: 'cache',
} as const;

export const TIMEOUTS = {
  API_REQUEST: 30000, // 30 seconds
  WS_RECONNECT: 5000, // 5 seconds
  CACHE_EXPIRY: 3600000, // 1 hour
} as const;

export const LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGES_PER_OFFER: 5,
  MAX_OFFERS_PER_DAY: 10,
  MAX_SEARCH_RESULTS: 50,
} as const;

export const MESSAGES = {
  SUCCESS: {
    OFFER_CREATED: 'Offer created successfully!',
    BOOKING_CONFIRMED: 'Transport booking confirmed!',
    PAYMENT_RECEIVED: 'Payment received successfully!',
    PROFILE_UPDATED: 'Profile updated successfully!',
  },
  ERROR: {
    NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    SERVER_ERROR: 'Server error. Please try again later.',
    FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  },
  WARNING: {
    SESSION_EXPIRED: 'Your session has expired. Please log in again.',
    UNSAVED_CHANGES: 'You have unsaved changes. Are you sure you want to leave?',
  },
} as const;
