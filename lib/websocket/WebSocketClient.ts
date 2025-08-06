import { EventEmitter } from 'events';
import logger from '@/lib/logger/logger';

export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp?: number;
  userId?: string;
}

export interface WebSocketConfig {
  url: string;
  protocols?: string | string[];
  reconnectAttempts?: number;
  reconnectInterval?: number;
  maxReconnectInterval?: number;
  heartbeatInterval?: number;
  heartbeatTimeout?: number;
}

export class WebSocketClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts = 0;
  private maxReconnectAttempts: number;
  private reconnectInterval: number;
  private maxReconnectInterval: number;
  private heartbeatInterval: number;
  private heartbeatTimeout: number;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private isManualClose = false;
  private messageQueue: WebSocketMessage[] = [];
  private isConnected = false;

  constructor(config: WebSocketConfig) {
    super();
    this.config = config;
    this.maxReconnectAttempts = config.reconnectAttempts || 5;
    this.reconnectInterval = config.reconnectInterval || 1000;
    this.maxReconnectInterval = config.maxReconnectInterval || 30000;
    this.heartbeatInterval = config.heartbeatInterval || 30000;
    this.heartbeatTimeout = config.heartbeatTimeout || 10000;
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting || this.isConnected) {
        resolve();
        return;
      }

      this.isConnecting = true;
      this.isManualClose = false;

      try {
        this.ws = new WebSocket(this.config.url, this.config.protocols);
        this.setupEventHandlers(resolve, reject);
      } catch (error) {
        this.isConnecting = false;
        logger.warn({ error }, 'Failed to create WebSocket connection - this is expected if WebSocket endpoint is not available');
        // Don't reject, just resolve since WebSocket is optional
        resolve();
      }
    });
  }

  private setupEventHandlers(
    resolve: () => void,
    reject: (error: Error) => void
  ) {
    if (!this.ws) return;

    this.ws.onopen = () => {
      logger.info('WebSocket connection established');
      this.isConnecting = false;
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.flushMessageQueue();
      this.emit('connected');
      resolve();
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        logger.error({ error, data: event.data }, 'Failed to parse WebSocket message');
      }
    };

    this.ws.onclose = (event) => {
      logger.info({ code: event.code, reason: event.reason }, 'WebSocket connection closed');
      this.isConnected = false;
      this.isConnecting = false;
      this.stopHeartbeat();
      this.emit('disconnected', event);

      if (!this.isManualClose && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect();
      } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.emit('maxReconnectAttemptsReached');
        logger.warn('Max reconnection attempts reached - WebSocket endpoint may not be available');
      }
    };

    this.ws.onerror = (error) => {
      logger.warn({ error }, 'WebSocket error occurred - this is expected if WebSocket endpoint is not available');
      this.emit('error', error);
      // Don't reject, just resolve since WebSocket is optional for now
      this.isConnecting = false;
      resolve();
    };
  }

  private handleMessage(message: WebSocketMessage) {
    // Handle heartbeat responses
    if (message.type === 'pong') {
      this.emit('heartbeat');
      return;
    }

    // Emit the message for other handlers
    this.emit('message', message);
  }

  private startHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }

    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
        this.send({
          type: 'ping',
          payload: { timestamp: Date.now() }
        });

        // Set a timeout to detect if we don't receive a pong
        setTimeout(() => {
          if (this.isConnected) {
            logger.warn('Heartbeat timeout - connection may be stale');
            this.emit('heartbeatTimeout');
            this.reconnect();
          }
        }, this.heartbeatTimeout);
      }
    }, this.heartbeatInterval);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    const delay = Math.min(
      this.reconnectInterval * Math.pow(2, this.reconnectAttempts),
      this.maxReconnectInterval
    );

    logger.info({ delay, attempt: this.reconnectAttempts + 1 }, 'Scheduling WebSocket reconnection');

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect().catch((error) => {
        logger.error({ error }, 'Reconnection attempt failed');
      });
    }, delay);
  }

  public reconnect(): Promise<void> {
    this.disconnect();
    return this.connect();
  }

  public send(message: WebSocketMessage): boolean {
    if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      // Queue message for later if not connected
      this.messageQueue.push(message);
      logger.debug({ message }, 'Message queued - WebSocket not connected');
      return false;
    }

    try {
      const messageStr = JSON.stringify(message);
      this.ws.send(messageStr);
      logger.debug({ message }, 'WebSocket message sent');
      return true;
    } catch (error) {
      logger.error({ error, message }, 'Failed to send WebSocket message');
      return false;
    }
  }

  private flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }

  public disconnect(): void {
    this.isManualClose = true;
    this.isConnected = false;
    this.stopHeartbeat();

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }

    this.messageQueue = [];
    logger.info('WebSocket manually disconnected');
  }

  public getConnectionState(): {
    isConnected: boolean;
    isConnecting: boolean;
    reconnectAttempts: number;
    readyState: number | null;
  } {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts,
      readyState: this.ws?.readyState || null,
    };
  }

  public isReady(): boolean {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN;
  }
}

export default WebSocketClient; 