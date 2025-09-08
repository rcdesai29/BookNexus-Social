import SockJS from 'sockjs-client';

export interface WebSocketMessage {
  type: string;
  data: any;
  userId?: string;
  timestamp?: number;
}

export type NotificationHandler = (message: WebSocketMessage) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private handlers: Map<string, NotificationHandler[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private isConnecting = false;

  /**
   * Connect to the WebSocket server
   */
  connect(): Promise<void> {
    console.log('WebSocket connect() method called');
    
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return Promise.resolve();
    }

    if (this.isConnecting) {
      console.log('WebSocket connection already in progress');
      return Promise.resolve();
    }

    this.isConnecting = true;
    console.log('Starting WebSocket connection to: http://localhost:8088/api/v1/ws/notifications');

    return new Promise((resolve, reject) => {
      try {
        // Use SockJS for better browser compatibility
        const sockJS = new SockJS('http://localhost:8088/api/v1/ws/notifications');
        console.log('SockJS instance created:', sockJS);
        this.socket = sockJS as any; // Cast to WebSocket interface

        if (this.socket) {
          this.socket.onopen = () => {
            console.log('WebSocket connected to BookNexus notifications');
            this.reconnectAttempts = 0;
            this.isConnecting = false;
            resolve();
          };

          this.socket.onmessage = (event) => {
            try {
              const message: WebSocketMessage = JSON.parse(event.data);
              this.handleMessage(message);
            } catch (error) {
              console.error('Error parsing WebSocket message:', error);
            }
          };

          this.socket.onclose = (event) => {
            console.log('WebSocket connection closed:', event.code, event.reason);
            this.isConnecting = false;
            this.attemptReconnect();
          };

          this.socket.onerror = (error) => {
            console.error('WebSocket error occurred:', error);
            console.error('Error details:', {
              type: error.type,
              target: error.target,
              readyState: this.socket?.readyState
            });
            this.isConnecting = false;
            reject(error);
          };
        } else {
          reject(new Error('Failed to create WebSocket connection'));
        }

      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.handlers.clear();
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
  }

  /**
   * Subscribe to specific message types
   */
  subscribe(type: string, handler: NotificationHandler): void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    this.handlers.get(type)!.push(handler);
  }

  /**
   * Unsubscribe from specific message types
   */
  unsubscribe(type: string, handler: NotificationHandler): void {
    const handlers = this.handlers.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Send a message to the server
   */
  send(message: WebSocketMessage): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message:', message);
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  private handleMessage(message: WebSocketMessage): void {
    console.log('Received WebSocket message:', message);

    // Handle specific message types
    const handlers = this.handlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error('Error in message handler:', error);
        }
      });
    }

    // Also call general handlers
    const generalHandlers = this.handlers.get('*');
    if (generalHandlers) {
      generalHandlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error('Error in general message handler:', error);
        }
      });
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect().catch(error => {
          console.error('Reconnection failed:', error);
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.log('Max reconnection attempts reached');
    }
  }
}

// Create singleton instance
export const webSocketService = new WebSocketService();

// Auto-connect when user is authenticated (you can modify this logic)
export const initializeWebSocket = () => {
  console.log('initializeWebSocket() called');
  // Check if user is logged in using the correct token key
  const token = localStorage.getItem('auth_token');
  console.log('Auth token found:', token ? 'YES' : 'NO');
  
  if (token) {
    console.log('User is authenticated, connecting WebSocket...');
    webSocketService.connect().catch(error => {
      console.error('Failed to initialize WebSocket:', error);
    });
  } else {
    console.log('User not authenticated, skipping WebSocket connection');
  }
};

export default webSocketService;