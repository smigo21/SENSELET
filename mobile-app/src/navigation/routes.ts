export const ROUTES = {
  // Auth routes
  LOGIN: 'Login',
  REGISTER: 'Register',
  OTP: 'OTP',

  // Farmer routes
  FARMER_DASHBOARD: 'FarmerDashboard',
  CREATE_OFFER: 'CreateOffer',
  PRICE_VIEW: 'PriceView',

  // Trader routes
  MARKETPLACE: 'Marketplace',
  BOOK_TRANSPORT: 'BookTransport',
  CONFIRM_DELIVERY: 'ConfirmDelivery',

  // Transporter routes
  TRIP_LIST: 'TripList',
  QR_SCAN: 'QRScan',
  ROUTE_STATUS: 'RouteStatus',

  // Shared routes
  PROFILE: 'Profile',
  NOTIFICATIONS: 'Notifications',
} as const;

export type NavigationProp = {
  navigate: (route: string) => void;
};

export type RouteKeys = keyof typeof ROUTES;
export type RouteValues = typeof ROUTES[RouteKeys];
