import { User, UserRole } from './roles';

export interface Order {
  id: string;
  farmerId: string;
  traderId: string;
  transporterId?: string;
  crop: string;
  quantity: number;
  price: number;
  status: 'pending' | 'accepted' | 'in_transit' | 'delivered' | 'cancelled';
  region: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  totalFarmers: number;
  totalTraders: number;
  activeOrders: number;
  deliveriesToday: number;
}

export interface ActivityItem {
  id: string;
  type: 'order' | 'delivery' | 'payment';
  description: string;
  timestamp: Date;
  user: string;
  status: 'success' | 'warning' | 'error';
}

// Mock API functions - replace with actual API calls
export const api = {
  // Users
  getUsers: async (filters?: { role?: UserRole; status?: string; region?: string }): Promise<User[]> => {
    // Mock data
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'John Farmer',
        role: 'farmer',
        nationalId: 'ET123456789',
        status: 'active',
        region: 'Oromia',
        phone: '+251911123456',
        email: 'john@example.com',
        createdAt: new Date('2023-01-15'),
        lastLogin: new Date(),
      },
      {
        id: '2',
        name: 'Mary Trader',
        role: 'trader',
        nationalId: 'ET987654321',
        status: 'active',
        region: 'Addis Ababa',
        phone: '+251922654321',
        email: 'mary@example.com',
        createdAt: new Date('2023-02-20'),
        lastLogin: new Date(Date.now() - 86400000), // 1 day ago
      },
      {
        id: '3',
        name: 'Ahmed Transport',
        role: 'transporter',
        nationalId: 'ET456789123',
        status: 'active',
        region: 'Somali',
        phone: '+251933789456',
        email: 'ahmed@example.com',
        createdAt: new Date('2023-03-10'),
        lastLogin: new Date(Date.now() - 3600000), // 1 hour ago
      },
    ];

    // Apply filters
    let filtered = mockUsers;
    if (filters?.role) {
      filtered = filtered.filter(user => user.role === filters.role);
    }
    if (filters?.status) {
      filtered = filtered.filter(user => user.status === filters.status);
    }
    if (filters?.region) {
      filtered = filtered.filter(user => user.region === filters.region);
    }

    return filtered;
  },

  // Orders
  getOrders: async (filters?: { status?: string; region?: string }): Promise<Order[]> => {
    const mockOrders: Order[] = [
      {
        id: 'ORD001',
        farmerId: '1',
        traderId: '2',
        transporterId: '3',
        crop: 'Maize',
        quantity: 1000,
        price: 25000,
        status: 'in_transit',
        region: 'Oromia',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date(),
      },
      {
        id: 'ORD002',
        farmerId: '1',
        traderId: '2',
        crop: 'Wheat',
        quantity: 800,
        price: 30000,
        status: 'pending',
        region: 'Amhara',
        createdAt: new Date('2024-01-16'),
        updatedAt: new Date(),
      },
    ];

    let filtered = mockOrders;
    if (filters?.status) {
      filtered = filtered.filter(order => order.status === filters.status);
    }
    if (filters?.region) {
      filtered = filtered.filter(order => order.region === filters.region);
    }

    return filtered;
  },

  // Dashboard Stats
  getDashboardStats: async (): Promise<DashboardStats> => {
    return {
      totalFarmers: 1250,
      totalTraders: 340,
      activeOrders: 89,
      deliveriesToday: 23,
    };
  },

  // Recent Activity
  getRecentActivity: async (): Promise<ActivityItem[]> => {
    return [
      {
        id: '1',
        type: 'order',
        description: 'New order placed for 1000kg Maize',
        timestamp: new Date(Date.now() - 1800000), // 30 min ago
        user: 'John Farmer',
        status: 'success',
      },
      {
        id: '2',
        type: 'delivery',
        description: 'Delivery completed in Addis Ababa',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        user: 'Ahmed Transport',
        status: 'success',
      },
      {
        id: '3',
        type: 'payment',
        description: 'Payment processed for Order #ORD001',
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        user: 'Mary Trader',
        status: 'success',
      },
    ];
  },

  // Analytics Data
  getAnalyticsData: async () => {
    return {
      cropTrends: [
        { month: 'Jan', maize: 1200, wheat: 800, teff: 600 },
        { month: 'Feb', maize: 1100, wheat: 900, teff: 650 },
        { month: 'Mar', maize: 1300, wheat: 850, teff: 700 },
      ],
      priceInflation: [
        { month: 'Jan', inflation: 2.1 },
        { month: 'Feb', inflation: 2.8 },
        { month: 'Mar', inflation: 3.2 },
      ],
      transportDelays: [
        { region: 'Oromia', avgDelay: 2.5 },
        { region: 'Amhara', avgDelay: 3.1 },
        { region: 'Tigray', avgDelay: 1.8 },
        { region: 'SNNPR', avgDelay: 4.2 },
      ],
    };
  },
};
