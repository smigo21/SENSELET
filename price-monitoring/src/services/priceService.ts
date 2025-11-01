/**
 * Price Service for EATMS Real-Time Price Monitoring
 * Handles fetching, processing, and caching of market price data
 */

import axios, { AxiosResponse } from 'axios';
import { MarketPrice, PriceHistory, PriceAlert, PriceTrend } from '../types/priceTypes';
import { AsyncStorage } from 'react-native';

const API_BASE_URL = process.env.API_BASE_URL || 'https://api.eatms.et';

interface PriceSearchParams {
  cropType?: string;
  locationId?: string;
  region?: string;
  marketId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  limit?: number;
  offset?: number;
}

interface PriceAlertConfig {
  cropType: string;
  locationId: string;
  minPrice?: number;
  maxPrice?: number;
  priceChangeThreshold?: number; // Percentage
  enabled: boolean;
}

class PriceService {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache
  private ALERT_CHECK_INTERVAL = 60000; // 1 minute

  constructor() {
    this.initializeCache();
    this.startPriceAlerts();
  }

  /**
   * Initialize cache from AsyncStorage
   */
  private async initializeCache(): Promise<void> {
    try {
      const cachedData = await AsyncStorage.getItem('priceCache');
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        this.cache = new Map(Object.entries(parsedData));
      }
    } catch (error) {
      console.error('Error initializing price cache:', error);
    }
  }

  /**
   * Save cache to AsyncStorage
   */
  private async saveCache(): Promise<void> {
    try {
      const cacheObject = Object.fromEntries(this.cache);
      await AsyncStorage.setItem('priceCache', JSON.stringify(cacheObject));
    } catch (error) {
      console.error('Error saving price cache:', error);
    }
  }

  /**
   * Generate cache key for price requests
   */
  private generateCacheKey(params: PriceSearchParams): string {
    const key = JSON.stringify(params);
    return `price_${btoa(key).replace(/[^a-zA-Z0-9]/g, '')}`;
  }

  /**
   * Check if cache is valid
   */
  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_TTL;
  }

  /**
   * Get current market prices with caching
   */
  async getCurrentPrices(params: PriceSearchParams): Promise<MarketPrice[]> {
    const cacheKey = this.generateCacheKey(params);

    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (this.isCacheValid(cached.timestamp)) {
        console.log('Returning cached prices');
        return cached.data;
      }
    }

    try {
      const response: AxiosResponse<MarketPrice[]> = await axios.get(
        `${API_BASE_URL}/api/prices/current/`,
        {
          params,
          headers: {
            'Authorization': `Token ${await this.getAuthToken()}`,
          },
        }
      );

      // Cache the response
      this.cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
        ttl: this.CACHE_TTL,
      });

      await this.saveCache();
      return response.data;
    } catch (error) {
      console.error('Error fetching current prices:', error);
      throw new Error('Failed to fetch current prices');
    }
  }

  /**
   * Get price history for a specific crop
   */
  async getPriceHistory(
    cropType: string,
    locationId: string,
    dateRange?: { start: Date; end: Date }
  ): Promise<PriceHistory[]> {
    try {
      const response: AxiosResponse<PriceHistory[]> = await axios.get(
        `${API_BASE_URL}/api/prices/history/`,
        {
          params: {
            crop_type: cropType,
            location_id: locationId,
            start_date: dateRange?.start.toISOString(),
            end_date: dateRange?.end.toISOString(),
          },
          headers: {
            'Authorization': `Token ${await this.getAuthToken()}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching price history:', error);
      throw new Error('Failed to fetch price history');
    }
  }

  /**
   * Get price trends analysis
   */
  async getPriceTrends(
    cropTypes: string[],
    locationIds: string[],
    period: 'day' | 'week' | 'month' | 'year'
  ): Promise<PriceTrend[]> {
    try {
      const response: AxiosResponse<PriceTrend[]> = await axios.get(
        `${API_BASE_URL}/api/prices/trends/`,
        {
          params: {
            crop_types: cropTypes.join(','),
            location_ids: locationIds.join(','),
            period,
          },
          headers: {
            'Authorization': `Token ${await this.getAuthToken()}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching price trends:', error);
      throw new Error('Failed to fetch price trends');
    }
  }

  /**
   * Get comparative prices across different markets
   */
  async getComparativePrices(
    cropType: string,
    locationIds: string[]
  ): Promise<MarketPrice[]> {
    try {
      const response: AxiosResponse<MarketPrice[]> = await axios.get(
        `${API_BASE_URL}/api/prices/comparative/`,
        {
          params: {
            crop_type: cropType,
            location_ids: locationIds.join(','),
          },
          headers: {
            'Authorization': `Token ${await this.getAuthToken()}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching comparative prices:', error);
      throw new Error('Failed to fetch comparative prices');
    }
  }

  /**
   * Subscribe to price alerts
   */
  async subscribeToAlerts(alertConfig: PriceAlertConfig): Promise<PriceAlert> {
    try {
      const response: AxiosResponse<PriceAlert> = await axios.post(
        `${API_BASE_URL}/api/prices/alerts/`,
        alertConfig,
        {
          headers: {
            'Authorization': `Token ${await this.getAuthToken()}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error subscribing to price alerts:', error);
      throw new Error('Failed to subscribe to price alerts');
    }
  }

  /**
   * Unsubscribe from price alerts
   */
  async unsubscribeFromAlert(alertId: string): Promise<void> {
    try {
      await axios.delete(
        `${API_BASE_URL}/api/prices/alerts/${alertId}/`,
        {
          headers: {
            'Authorization': `Token ${await this.getAuthToken()}`,
          },
        }
      );
    } catch (error) {
      console.error('Error unsubscribing from price alert:', error);
      throw new Error('Failed to unsubscribe from price alert');
    }
  }

  /**
   * Get user's active price alerts
   */
  async getUserAlerts(): Promise<PriceAlert[]> {
    try {
      const response: AxiosResponse<PriceAlert[]> = await axios.get(
        `${API_BASE_URL}/api/prices/alerts/`,
        {
          headers: {
            'Authorization': `Token ${await this.getAuthToken()}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching user alerts:', error);
      throw new Error('Failed to fetch user alerts');
    }
  }

  /**
   * Calculate price prediction based on historical data
   */
  async predictPrice(
    cropType: string,
    locationId: string,
    daysAhead: number = 7
  ): Promise<{ predictedPrice: number; confidence: number; factors: string[] }> {
    try {
      // Get historical data
      const history = await this.getPriceHistory(
        cropType,
        locationId,
        {
          start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
          end: new Date(),
        }
      );

      // Simple prediction algorithm (in production, this would be more sophisticated)
      const recentPrices = history.slice(-30); // Last 30 data points
      const avgPrice = recentPrices.reduce((sum, item) => sum + item.price, 0) / recentPrices.length;

      // Calculate trend
      const trend = this.calculatePriceTrend(recentPrices);
      
      // Simple prediction with trend adjustment
      const trendFactor = 1 + (trend * daysAhead * 0.01); // 1% change per day based on trend
      const predictedPrice = avgPrice * trendFactor;

      // Calculate confidence (simplified)
      const volatility = this.calculatePriceVolatility(recentPrices);
      const confidence = Math.max(0.3, 1 - volatility);

      return {
        predictedPrice: Math.round(predictedPrice * 100) / 100,
        confidence: Math.round(confidence * 100) / 100,
        factors: this.getPriceFactors(trend, volatility, recentPrices),
      };
    } catch (error) {
      console.error('Error predicting price:', error);
      throw new Error('Failed to predict price');
    }
  }

  /**
   * Calculate price trend from historical data
   */
  private calculatePriceTrend(history: PriceHistory[]): number {
    if (history.length < 2) return 0;

    const firstHalf = history.slice(0, Math.floor(history.length / 2));
    const secondHalf = history.slice(Math.floor(history.length / 2));

    const firstAvg = firstHalf.reduce((sum, item) => sum + item.price, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, item) => sum + item.price, 0) / secondHalf.length;

    return ((secondAvg - firstAvg) / firstAvg) * 100; // Percentage change
  }

  /**
   * Calculate price volatility
   */
  private calculatePriceVolatility(history: PriceHistory[]): number {
    if (history.length < 2) return 0;

    const prices = history.map(item => item.price);
    const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - avg, 2), 0) / prices.length;
    const stdDev = Math.sqrt(variance);
    
    return stdDev / avg; // Coefficient of variation
  }

  /**
   * Get factors affecting price prediction
   */
  private getPriceFactors(trend: number, volatility: number, history: PriceHistory[]): string[] {
    const factors: string[] = [];

    if (trend > 5) factors.push('Increasing demand');
    if (trend < -5) factors.push('Decreasing demand');
    if (volatility > 0.2) factors.push('High market volatility');
    if (volatility < 0.05) factors.push('Stable market conditions');

    // Seasonal factors
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) factors.push('Post-harvest surplus');
    if (month >= 11 || month <= 1) factors.push('Pre-harvest scarcity');

    // Check for recent price spikes
    const recentPrices = history.slice(-7);
    const maxPrice = Math.max(...recentPrices.map(p => p.price));
    const minPrice = Math.min(...recentPrices.map(p => p.price));
    if ((maxPrice - minPrice) / minPrice > 0.15) {
      factors.push('Recent price volatility');
    }

    return factors;
  }

  /**
   * Start price alert monitoring
   */
  private startPriceAlerts(): void {
    setInterval(async () => {
      try {
        const alerts = await this.getUserAlerts();
        const currentPrices = await this.getCurrentPrices({
          limit: 100, // Get all recent prices for alert checking
        });

        // Check each alert
        for (const alert of alerts) {
          const matchingPrices = currentPrices.filter(
            price => price.crop_type === alert.crop_type && 
                    price.location_id === alert.location_id
          );

          if (matchingPrices.length > 0) {
            const currentPrice = matchingPrices[0].price;
            
            // Check price thresholds
            if (alert.min_price && currentPrice <= alert.min_price) {
              await this.triggerPriceAlert(alert, 'MIN_PRICE', currentPrice);
            } else if (alert.max_price && currentPrice >= alert.max_price) {
              await this.triggerPriceAlert(alert, 'MAX_PRICE', currentPrice);
            } else if (alert.price_change_threshold) {
              // Check price change threshold
              const history = await this.getPriceHistory(
                alert.crop_type,
                alert.location_id,
                {
                  start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
                  end: new Date(),
                }
              );

              if (history.length >= 2) {
                const change = ((currentPrice - history[0].price) / history[0].price) * 100;
                if (Math.abs(change) >= alert.price_change_threshold) {
                  await this.triggerPriceAlert(alert, 'PRICE_CHANGE', currentPrice, change);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error checking price alerts:', error);
      }
    }, this.ALERT_CHECK_INTERVAL);
  }

  /**
   * Trigger price alert
   */
  private async triggerPriceAlert(
    alert: PriceAlert,
    type: 'MIN_PRICE' | 'MAX_PRICE' | 'PRICE_CHANGE',
    currentPrice: number,
    priceChange?: number
  ): Promise<void> {
    try {
      // Send notification
      await axios.post(
        `${API_BASE_URL}/api/notifications/price-alert/`,
        {
          alert_id: alert.id,
          type,
          current_price: currentPrice,
          price_change: priceChange,
          message: this.generateAlertMessage(alert, type, currentPrice, priceChange),
        },
        {
          headers: {
            'Authorization': `Token ${await this.getAuthToken()}`,
          },
        }
      );

      console.log(`Price alert triggered: ${alert.id} - ${type}`);
    } catch (error) {
      console.error('Error triggering price alert:', error);
    }
  }

  /**
   * Generate alert message
   */
  private generateAlertMessage(
    alert: PriceAlert,
    type: 'MIN_PRICE' | 'MAX_PRICE' | 'PRICE_CHANGE',
    currentPrice: number,
    priceChange?: number
  ): string {
    const cropName = alert.crop_type;
    const locationName = alert.location_name || 'Market';

    switch (type) {
      case 'MIN_PRICE':
        return `${cropName} price in ${locationName} has fallen to ${currentPrice.toFixed(2)} ETB (below your minimum threshold of ${alert.min_price} ETB)`;
      
      case 'MAX_PRICE':
        return `${cropName} price in ${locationName} has risen to ${currentPrice.toFixed(2)} ETB (above your maximum threshold of ${alert.max_price} ETB)`;
      
      case 'PRICE_CHANGE':
        const direction = priceChange! > 0 ? 'increased' : 'decreased';
        return `${cropName} price in ${locationName} has ${direction} by ${Math.abs(priceChange!).toFixed(1)}% to ${currentPrice.toFixed(2)} ETB`;
      
      default:
        return `Price alert for ${cropName} in ${locationName}: ${currentPrice.toFixed(2)} ETB`;
    }
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
   * Clear price cache
   */
  async clearCache(): Promise<void> {
    this.cache.clear();
    await AsyncStorage.removeItem('priceCache');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0, // Would need to implement hit/miss tracking
    };
  }
}

// Export singleton instance
export const priceService = new PriceService();
export default PriceService;
