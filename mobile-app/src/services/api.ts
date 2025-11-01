import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for adding auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for handling errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          this.handleUnauthorized();
        }
        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    // Get token from storage (AsyncStorage in React Native)
    // This is a placeholder - implement based on your auth storage
    return null;
  }

  private handleUnauthorized(): void {
    // Handle logout or token refresh
    console.log('Unauthorized access - redirecting to login');
  }

  // Generic API methods
  async get<T>(url: string, params?: any): Promise<AxiosResponse<T>> {
    return this.api.get(url, { params });
  }

  async post<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.api.post(url, data);
  }

  async put<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.api.put(url, data);
  }

  async delete<T>(url: string): Promise<AxiosResponse<T>> {
    return this.api.delete(url);
  }

  // Specific API endpoints
  async login(credentials: { username: string; password: string }) {
    return this.post('/auth/login/', credentials);
  }

  async register(userData: any) {
    return this.post('/auth/register/', userData);
  }

  async getCrops() {
    return this.get('/crops/');
  }

  async createOffer(offerData: any) {
    return this.post('/offers/', offerData);
  }

  async getMarketPrices() {
    return this.get('/market-prices/');
  }

  async bookTransport(transportData: any) {
    return this.post('/transport/', transportData);
  }

  async getTrips() {
    return this.get('/trips/');
  }

  async updateTripStatus(tripId: string, status: string) {
    return this.put(`/trips/${tripId}/`, { status });
  }
}

export const apiService = new ApiService();
export default apiService;
