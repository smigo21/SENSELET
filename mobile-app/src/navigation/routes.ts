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
  TRADER_DASHBOARD: 'TraderDashboard',
  MARKETPLACE: 'Marketplace',
  BOOK_TRANSPORT: 'BookTransport',
  CONFIRM_DELIVERY: 'ConfirmDelivery',

  // Transporter routes
  TRANSPORTER_DASHBOARD: 'TransporterDashboard',
  TRIP_LIST: 'TripList',
  QR_SCAN: 'QRScan',
  ROUTE_STATUS: 'RouteStatus',

  // Shared routes
  PROFILE: 'Profile',
  NOTIFICATIONS: 'Notifications',

  // Tab navigation routes
  HOME_TAB: 'Home',
  OFFERS_TAB: 'Offers',
  NOTIFICATIONS_TAB: 'Notifications',
  PROFILE_TAB: 'Profile',
} as const;

export type NavigationProp = {
  navigate: (route: string) => void;
};

export type RouteKeys = keyof typeof ROUTES;
export type RouteValues = typeof ROUTES[RouteKeys];
