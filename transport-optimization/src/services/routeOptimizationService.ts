/**
 * Route Optimization Service for EATMS Transport Management
 * Handles route planning, vehicle allocation, and cost optimization
 */

import axios, { AxiosResponse } from 'axios';
import { 
  Route, 
  Vehicle, 
  Shipment, 
  TransportOrder,
  OptimizationRequest,
  OptimizationResult,
  RouteStop,
  FuelCost,
  TimeWindow,
  TrafficData,
  WeatherData
} from '../types/transportTypes';
import { AsyncStorage } from 'react-native';

const API_BASE_URL = process.env.API_BASE_URL || 'https://api.eatms.et';

interface RouteOptimizationParams {
  orders: TransportOrder[];
  vehicles: Vehicle[];
  constraints?: {
    maxWorkingHours?: number;
    maxDistancePerDay?: number;
    vehicleCapacity?: Record<string, number>;
    timeWindows?: Record<string, TimeWindow[]>;
    avoidTolls?: boolean;
    preferHighways?: boolean;
  };
  optimizationGoals?: {
    minimizeCost?: boolean;
    minimizeTime?: boolean;
    maximizeUtilization?: boolean;
    prioritizeEcoRoutes?: boolean;
  };
  includeRealTimeData?: boolean;
}

interface DeliverySchedule {
  orderId: string;
  vehicleId: string;
  route: Route;
  estimatedArrival: Date;
  estimatedDeparture: Date;
  duration: number;
  distance: number;
  cost: {
    fuel: number;
    tolls: number;
    driver: number;
    total: number;
  };
  stops: RouteStop[];
}

class RouteOptimizationService {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache
  private TRAFFIC_UPDATE_INTERVAL = 300000; // 5 minutes
  private WEATHER_UPDATE_INTERVAL = 1800000; // 30 minutes

  constructor() {
    this.initializeCache();
    this.startRealTimeUpdates();
  }

  /**
   * Initialize cache from AsyncStorage
   */
  private async initializeCache(): Promise<void> {
    try {
      const cachedData = await AsyncStorage.getItem('routeOptimizationCache');
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        this.cache = new Map(Object.entries(parsedData));
      }
    } catch (error) {
      console.error('Error initializing route optimization cache:', error);
    }
  }

  /**
   * Save cache to AsyncStorage
   */
  private async saveCache(): Promise<void> {
    try {
      const cacheObject = Object.fromEntries(this.cache);
      await AsyncStorage.setItem('routeOptimizationCache', JSON.stringify(cacheObject));
    } catch (error) {
      console.error('Error saving route optimization cache:', error);
    }
  }

  /**
   * Generate cache key for optimization requests
   */
  private generateCacheKey(params: RouteOptimizationParams): string {
    const key = JSON.stringify({
      ordersCount: params.orders.length,
      vehiclesCount: params.vehicles.length,
      constraints: params.constraints,
      goals: params.optimizationGoals,
    });
    return `route_opt_${btoa(key).replace(/[^a-zA-Z0-9]/g, '')}`;
  }

  /**
   * Optimize routes for multiple orders
   */
  async optimizeRoutes(params: RouteOptimizationParams): Promise<OptimizationResult> {
    const cacheKey = this.generateCacheKey(params);

    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (this.isCacheValid(cached.timestamp)) {
        console.log('Returning cached optimization result');
        return cached.data;
      }
    }

    try {
      // Validate input
      this.validateOptimizationInput(params);

      // Get real-time data if requested
      let trafficData: TrafficData[] = [];
      let weatherData: WeatherData[] = [];

      if (params.includeRealTimeData) {
        trafficData = await this.getCurrentTrafficData();
        weatherData = await this.getCurrentWeatherData();
      }

      // Prepare optimization request
      const optimizationRequest: OptimizationRequest = {
        orders: params.orders,
        vehicles: params.vehicles,
        constraints: params.constraints || {},
        optimizationGoals: params.optimizationGoals || {},
        trafficData,
        weatherData,
      };

      // Call optimization algorithm
      const result = await this.performRouteOptimization(optimizationRequest);

      // Cache the result
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
        ttl: this.CACHE_TTL,
      });

      await this.saveCache();
      return result;
    } catch (error) {
      console.error('Error optimizing routes:', error);
      throw new Error('Failed to optimize routes');
    }
  }

  /**
   * Validate optimization input
   */
  private validateOptimizationInput(params: RouteOptimizationParams): void {
    if (!params.orders || params.orders.length === 0) {
      throw new Error('At least one transport order is required');
    }

    if (!params.vehicles || params.vehicles.length === 0) {
      throw new Error('At least one vehicle is required');
    }

    // Validate orders
    for (const order of params.orders) {
      if (!order.pickupLocation || !order.deliveryLocation) {
        throw new Error('Order must have pickup and delivery locations');
      }

      if (!order.weight || order.weight <= 0) {
        throw new Error('Order weight must be greater than 0');
      }

      if (order.requiredBy && new Date(order.requiredBy) < new Date()) {
        throw new Error('Order required time cannot be in the past');
      }
    }

    // Validate vehicles
    for (const vehicle of params.vehicles) {
      if (!vehicle.location || !vehicle.capacity || vehicle.capacity <= 0) {
        throw new Error('Vehicle must have valid location and capacity');
      }
    }
  }

  /**
   * Perform route optimization using algorithm
   */
  private async performRouteOptimization(request: OptimizationRequest): Promise<OptimizationResult> {
    // This is a simplified version of the optimization algorithm
    // In a production system, this would use more sophisticated algorithms like:
    // - Clarke-Wright savings algorithm
    // - Genetic algorithm
    // - Ant colony optimization
    // - Commercial solvers like Gurobi or CPLEX

    const { orders, vehicles, constraints, optimizationGoals } = request;

    // Simple implementation: assign orders to nearest available vehicle
    const schedules: DeliverySchedule[] = [];
    const unassignedOrders: TransportOrder[] = [...orders];

    // Sort vehicles by availability
    const sortedVehicles = [...vehicles].sort((a, b) => 
      new Date(a.availableFrom).getTime() - new Date(b.availableFrom).getTime()
    );

    // For each vehicle, find best route
    for (const vehicle of sortedVehicles) {
      if (unassignedOrders.length === 0) break;

      const vehicleOrders = this.findBestOrdersForVehicle(
        vehicle, 
        unassignedOrders, 
        constraints,
        request.trafficData,
        request.weatherData
      );

      if (vehicleOrders.length > 0) {
        const route = this.calculateRoute(
          vehicle,
          vehicleOrders,
          request.trafficData,
          request.weatherData,
          optimizationGoals
        );

        const schedule: DeliverySchedule = {
          orderId: vehicleOrders[0].id, // Simplified - in reality would handle multiple orders
          vehicleId: vehicle.id,
          route,
          estimatedArrival: this.calculateArrivalTime(route),
          estimatedDeparture: this.calculateDepartureTime(vehicle, route),
          duration: this.calculateDuration(route),
          distance: this.calculateDistance(route),
          cost: this.calculateCost(route, vehicle),
          stops: this.generateRouteStops(vehicle, vehicleOrders, route),
        };

        schedules.push(schedule);

        // Remove assigned orders
        unassignedOrders.splice(0, vehicleOrders.length);
      }
    }

    return {
      schedules,
      unassignedOrders,
      totalCost: schedules.reduce((sum, s) => sum + s.cost.total, 0),
      totalDistance: schedules.reduce((sum, s) => sum + s.distance, 0),
      totalDuration: schedules.reduce((sum, s) => sum + s.duration, 0),
      vehicleUtilization: this.calculateUtilization(schedules, vehicles),
      optimizationScore: this.calculateOptimizationScore(schedules, optimizationGoals),
    };
  }

  /**
   * Find best orders for a vehicle
   */
  private findBestOrdersForVehicle(
    vehicle: Vehicle,
    orders: TransportOrder[],
    constraints: any,
    trafficData: TrafficData[],
    weatherData: WeatherData[]
  ): TransportOrder[] {
    // Simplified: find orders that fit in vehicle capacity and are closest to vehicle
    const vehicleCapacity = constraints.vehicleCapacity?.[vehicle.id] || vehicle.capacity;
    
    const suitableOrders = orders.filter(order => 
      order.weight <= vehicleCapacity &&
      this.isWithinTimeWindow(order, vehicle, constraints.timeWindows)
    );

    // Sort by distance to vehicle
    suitableOrders.sort((a, b) => {
      const distA = this.calculateDistance(vehicle.location, a.pickupLocation);
      const distB = this.calculateDistance(vehicle.location, b.pickupLocation);
      return distA - distB;
    });

    return suitableOrders.slice(0, Math.min(3, suitableOrders.length)); // Limit to 3 orders per vehicle
  }

  /**
   * Calculate optimal route
   */
  private calculateRoute(
    vehicle: Vehicle,
    orders: TransportOrder[],
    trafficData: TrafficData[],
    weatherData: WeatherData[],
    optimizationGoals: any
  ): Route {
    // Simplified: create a route through pickup and delivery points
    const waypoints = [
      vehicle.location,
      ...orders.map(order => order.pickupLocation),
      ...orders.map(order => order.deliveryLocation),
    ];

    // Add traffic and weather considerations
    const adjustedWaypoints = this.adjustForTrafficAndWeather(
      waypoints, 
      trafficData, 
      weatherData
    );

    return {
      id: `route_${vehicle.id}_${Date.now()}`,
      vehicleId: vehicle.id,
      waypoints: adjustedWaypoints,
      distance: this.calculateTotalDistance(adjustedWaypoints),
      duration: this.calculateTotalDuration(adjustedWaypoints),
      trafficDelay: this.calculateTrafficDelay(adjustedWaypoints, trafficData),
      weatherImpact: this.calculateWeatherImpact(adjustedWaypoints, weatherData),
      cost: this.estimateRouteCost(adjustedWaypoints, vehicle),
    };
  }

  /**
   * Calculate distance between two points
   */
  private calculateDistance(pointA: any, pointB: any): number {
    // Simplified distance calculation using Haversine formula
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(pointB.latitude - pointA.latitude);
    const dLon = this.toRadians(pointB.longitude - pointA.longitude);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(pointA.latitude)) * Math.cos(this.toRadians(pointB.latitude)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Calculate route cost
   */
  private calculateCost(route: Route, vehicle: Vehicle): { fuel: number; tolls: number; driver: number; total: number } {
    const fuelCost = this.calculateFuelCost(route, vehicle);
    const tollCost = this.calculateTollCost(route);
    const driverCost = this.calculateDriverCost(route.duration, vehicle);

    return {
      fuel: fuelCost,
      tolls: tollCost,
      driver: driverCost,
      total: fuelCost + tollCost + driverCost,
    };
  }

  /**
   * Calculate fuel cost
   */
  private calculateFuelCost(route: Route, vehicle: Vehicle): number {
    const fuelConsumption = vehicle.fuelConsumption || 0.15; // L/km
    const fuelPrice = 35; // ETB per liter (simplified)
    return route.distance * fuelConsumption * fuelPrice;
  }

  /**
   * Calculate toll cost
   */
  private calculateTollCost(route: Route): number {
    // Simplified: estimate tolls based on distance
    return route.distance * 2; // ETB 2 per km
  }

  /**
   * Calculate driver cost
   */
  private calculateDriverCost(duration: number, vehicle: Vehicle): number {
    const hourlyRate = vehicle.driverHourlyRate || 100; // ETB per hour
    return (duration / 60) * hourlyRate; // Convert minutes to hours
  }

  /**
   * Get current traffic data
   */
  private async getCurrentTrafficData(): Promise<TrafficData[]> {
    try {
      const response: AxiosResponse<TrafficData[]> = await axios.get(
        `${API_BASE_URL}/api/transport/traffic/current/`,
        {
          headers: {
            'Authorization': `Token ${await this.getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching traffic data:', error);
      return [];
    }
  }

  /**
   * Get current weather data
   */
  private async getCurrentWeatherData(): Promise<WeatherData[]> {
    try {
      const response: AxiosResponse<WeatherData[]> = await axios.get(
        `${API_BASE_URL}/api/weather/current/`,
        {
          headers: {
            'Authorization': `Token ${await this.getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return [];
    }
  }

  /**
   * Start real-time updates for traffic and weather
   */
  private startRealTimeUpdates(): void {
    // Update traffic data
    setInterval(async () => {
      try {
        await this.getCurrentTrafficData();
      } catch (error) {
        console.error('Error updating traffic data:', error);
      }
    }, this.TRAFFIC_UPDATE_INTERVAL);

    // Update weather data
    setInterval(async () => {
      try {
        await this.getCurrentWeatherData();
      } catch (error) {
        console.error('Error updating weather data:', error);
      }
    }, this.WEATHER_UPDATE_INTERVAL);
  }

  /**
   * Calculate vehicle utilization
   */
  private calculateUtilization(schedules: DeliverySchedule[], vehicles: Vehicle[]): Record<string, number> {
    const utilization: Record<string, number> = {};

    for (const vehicle of vehicles) {
      const vehicleSchedules = schedules.filter(s => s.vehicleId === vehicle.id);
      const totalCapacity = vehicle.capacity * vehicleSchedules.length;
      const usedCapacity = vehicleSchedules.reduce((sum, s) => sum + s.route.distance, 0);
      
      utilization[vehicle.id] = totalCapacity > 0 ? (usedCapacity / totalCapacity) * 100 : 0;
    }

    return utilization;
  }

  /**
   * Calculate optimization score
   */
  private calculateOptimizationScore(schedules: DeliverySchedule[], goals: any): number {
    let score = 0;
    const factors = [];

    if (goals.minimizeCost) {
      const avgCost = schedules.reduce((sum, s) => sum + s.cost.total, 0) / schedules.length;
      factors.push(Math.max(0, 100 - avgCost / 10)); // Lower cost = higher score
    }

    if (goals.minimizeTime) {
      const avgTime = schedules.reduce((sum, s) => sum + s.duration, 0) / schedules.length;
      factors.push(Math.max(0, 100 - avgTime / 60)); // Lower time = higher score
    }

    if (goals.maximizeUtilization) {
      const utilization = Object.values(this.calculateUtilization(schedules, [])).reduce((sum, u) => sum + u, 0) / schedules.length;
      factors.push(Math.min(100, utilization)); // Higher utilization = higher score
    }

    // Calculate weighted average
    if (factors.length > 0) {
      score = factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
    }

    return Math.round(score);
  }

  /**
   * Helper methods (simplified implementations)
   */
  private isWithinTimeWindow(order: TransportOrder, vehicle: Vehicle, timeWindows?: any): boolean {
    // Simplified check
    return true;
  }

  private adjustForTrafficAndWeather(waypoints: any[], trafficData: TrafficData[], weatherData: WeatherData[]): any[] {
    // Simplified: return original waypoints
    return waypoints;
  }

  private calculateTotalDistance(waypoints: any[]): number {
    let totalDistance = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      totalDistance += this.calculateDistance(waypoints[i], waypoints[i + 1]);
    }
    return totalDistance;
  }

  private calculateTotalDuration(waypoints: any[]): number {
    // Simplified: estimate based on distance and average speed
    const totalDistance = this.calculateTotalDistance(waypoints);
    return (totalDistance / 60) * 60; // 60 km/h average speed
  }

  private calculateTrafficDelay(waypoints: any[], trafficData: TrafficData[]): number {
    // Simplified: 5 minutes delay per 100 km
    const distance = this.calculateTotalDistance(waypoints);
    return Math.floor(distance / 100) * 5;
  }

  private calculateWeatherImpact(waypoints: any[], weatherData: WeatherData[]): number {
    // Simplified: 10% speed reduction in bad weather
    return 0.1; // 10% impact
  }

  private estimateRouteCost(waypoints: any[], vehicle: Vehicle): number {
    const distance = this.calculateTotalDistance(waypoints);
    return distance * 5; // ETB 5 per km (simplified)
  }

  private calculateArrivalTime(route: Route): Date {
    const now = new Date();
    return new Date(now.getTime() + route.duration * 60000);
  }

  private calculateDepartureTime(vehicle: Vehicle, route: Route): Date {
    const availableFrom = new Date(vehicle.availableFrom);
    return new Date(Math.max(availableFrom.getTime(), Date.now()));
  }

  private calculateDuration(route: Route): number {
    return route.duration;
  }

  private calculateDistance(route: Route): number {
    return route.distance;
  }

  private generateRouteStops(vehicle: Vehicle, orders: TransportOrder[], route: Route): RouteStop[] {
    const stops: RouteStop[] = [];
    
    // Add vehicle start location
    stops.push({
      id: `start_${vehicle.id}`,
      type: 'start',
      location: vehicle.location,
      address: vehicle.depot || 'Vehicle Depot',
      scheduledTime: this.calculateDepartureTime(vehicle, route),
      estimatedTime: this.calculateDepartureTime(vehicle, route),
    });

    // Add pickup stops
    orders.forEach((order, index) => {
      stops.push({
        id: `pickup_${order.id}`,
        type: 'pickup',
        location: order.pickupLocation,
        address: order.pickupAddress || 'Pickup Location',
        orderId: order.id,
        scheduledTime: new Date(this.calculateDepartureTime(vehicle, route).getTime() + (index * 30 * 60000)),
        estimatedTime: new Date(this.calculateDepartureTime(vehicle, route).getTime() + (index * 30 * 60000)),
      });
    });

    // Add delivery stops
    orders.forEach((order, index) => {
      stops.push({
        id: `delivery_${order.id}`,
        type: 'delivery',
        location: order.deliveryLocation,
        address: order.deliveryAddress || 'Delivery Location',
        orderId: order.id,
        scheduledTime: new Date(this.calculateDepartureTime(vehicle, route).getTime() + ((orders.length + index) * 30 * 60000)),
        estimatedTime: new Date(this.calculateDepartureTime(vehicle, route).getTime() + ((orders.length + index) * 30 * 60000)),
      });
    });

    return stops;
  }

  /**
   * Check if cache is valid
   */
  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_TTL;
  }

  /**
   * Get authentication token
   */
  private async getAuthToken(): Promise<string> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return token || '';
    } catch (error) {
      console.error('Error getting auth token:', error);
      return '';
    }
  }

  /**
   * Clear optimization cache
   */
  async clearCache(): Promise<void> {
    this.cache.clear();
    await AsyncStorage.removeItem('routeOptimizationCache');
  }
}

// Export singleton instance
export const routeOptimizationService = new RouteOptimizationService();
export default RouteOptimizationService;
