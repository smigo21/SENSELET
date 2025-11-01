import { io, Socket } from 'socket.io-client';

const WS_BASE_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(WS_BASE_URL, {
        auth: {
          token,
        },
        transports: ['websocket'],
      });

      this.socket.on('connect', () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        resolve();
      });

      this.socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
        this.handleReconnect();
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        reject(error);
      });

      // Setup event listeners
      this.setupEventListeners();
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.socket?.connect();
      }, 1000 * this.reconnectAttempts);
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    // Price updates
    this.socket.on('price_update', (data) => {
      console.log('Price update received:', data);
      // Emit custom event for price updates
      this.emit('priceUpdate', data);
    });

    // Trip updates
    this.socket.on('trip_update', (data) => {
      console.log('Trip update received:', data);
      this.emit('tripUpdate', data);
    });

    // Notification updates
    this.socket.on('notification', (data) => {
      console.log('Notification received:', data);
      this.emit('notification', data);
    });

    // Sensor alerts
    this.socket.on('sensor_alert', (data) => {
      console.log('Sensor alert received:', data);
      this.emit('sensorAlert', data);
    });
  }

  // Event emitter functionality
  private eventListeners: { [event: string]: Function[] } = {};

  on(event: string, callback: Function): void {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  off(event: string, callback: Function): void {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }
  }

  private emit(event: string, data: any): void {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data));
    }
  }

  // Send messages
  send(event: string, data: any): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('WebSocket not connected, message not sent:', event, data);
    }
  }

  // Join/Leave rooms
  joinRoom(room: string): void {
    this.send('join_room', { room });
  }

  leaveRoom(room: string): void {
    this.send('leave_room', { room });
  }

  // Disconnect
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const websocketService = new WebSocketService();
export default websocketService;
