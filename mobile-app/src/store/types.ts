export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  phone?: string;
  national_id?: string;
  user_type: 'farmer' | 'transporter' | 'government' | 'buyer';
  farm_location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  token: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface Crop {
  id: string;
  name: string;
  variety?: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  quality_grade: string;
  harvest_date: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  farmer_id: string;
  status: 'available' | 'pending' | 'sold' | 'in_transit' | 'delivered';
  images?: string[];
}

export interface MarketPrice {
  id: string;
  crop_name: string;
  price: number;
  unit: string;
  market: string;
  region: string;
  date: string;
  change_percentage: number;
}

export interface Shipment {
  id: string;
  crop_id: string;
  transporter_id: string;
  origin: {
    latitude: number;
    longitude: number;
    address: string;
  };
  destination: {
    latitude: number;
    longitude: number;
    address: string;
  };
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  estimated_arrival: string;
  current_location?: {
    latitude: number;
    longitude: number;
  };
  temperature: number;
  humidity: number;
  alerts: string[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  read: boolean;
  action_url?: string;
}

export interface RootState {
  auth: AuthState;
  crops: {
    crops: Crop[];
    loading: boolean;
    error: string | null;
  };
  marketPrices: {
    prices: MarketPrice[];
    loading: boolean;
    error: string | null;
  };
  shipments: {
    shipments: Shipment[];
    loading: boolean;
    error: string | null;
  };
  notifications: {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    error: string | null;
  };
}
