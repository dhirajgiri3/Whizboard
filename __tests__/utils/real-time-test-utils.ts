/**
 * Real-Time Testing Utilities
 * 
 * This module provides utilities for testing real-time components,
 * including mocks for WebSockets, time control, and network simulation.
 */

import { vi } from 'vitest';

// Mock WebSocket events
type WebSocketEventType = 'open' | 'message' | 'close' | 'error';
type WebSocketEventListener = (event: any) => void;
type WebSocketEventListeners = Record<WebSocketEventType, WebSocketEventListener[]>;

// Enhanced WebSocket mock
export class MockWebSocket {
  public url: string;
  public readyState: number = 0; // CONNECTING
  public protocol: string = '';
  public extensions: string = '';
  public bufferedAmount: number = 0;
  public binaryType: BinaryType = 'blob';
  
  private eventListeners: WebSocketEventListeners = {
    open: [],
    message: [],
    close: [],
    error: [],
  };
  
  private sentMessages: any[] = [];
  private autoResponder?: (data: any) => any;
  private connectionDelay: number = 50; // Simulated connection delay in ms
  
  constructor(url: string, protocols?: string | string[]) {
    this.url = url;
    if (typeof protocols === 'string') {
      this.protocol = protocols;
    } else if (Array.isArray(protocols) && protocols.length > 0) {
      this.protocol = protocols[0];
    }
    
    // Simulate connection delay
    setTimeout(() => this.simulateOpen(), this.connectionDelay);
  }
  
  // WebSocket API methods
  public send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
    if (this.readyState !== 1) {
      throw new Error('WebSocket is not open');
    }
    
    this.sentMessages.push(data);
    
    // If an auto-responder is set, use it to generate a response
    if (this.autoResponder) {
      const response = this.autoResponder(data);
      if (response) {
        this.simulateMessage(response);
      }
    }
  }
  
  public close(code?: number, reason?: string): void {
    if (this.readyState === 3) return; // Already closed
    
    this.readyState = 2; // CLOSING
    setTimeout(() => {
      this.readyState = 3; // CLOSED
      this.dispatchEvent('close', { code, reason, wasClean: true });
    }, 0);
  }
  
  public addEventListener(type: WebSocketEventType, listener: WebSocketEventListener): void {
    if (this.eventListeners[type]) {
      this.eventListeners[type].push(listener);
    }
  }
  
  public removeEventListener(type: WebSocketEventType, listener: WebSocketEventListener): void {
    if (this.eventListeners[type]) {
      const index = this.eventListeners[type].indexOf(listener);
      if (index !== -1) {
        this.eventListeners[type].splice(index, 1);
      }
    }
  }
  
  // Helper methods for testing
  private dispatchEvent(type: WebSocketEventType, eventData: any): void {
    const event = { ...eventData, type };
    
    // Call the specific event handler if defined
    const handlerName = `on${type}` as keyof MockWebSocket;
    const handler = this[handlerName] as unknown as WebSocketEventListener;
    if (typeof handler === 'function') {
      handler(event);
    }
    
    // Call all registered event listeners
    this.eventListeners[type].forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error(`Error in WebSocket ${type} event listener:`, error);
      }
    });
  }
  
  // Methods for controlling the mock in tests
  public simulateOpen(): void {
    this.readyState = 1; // OPEN
    this.dispatchEvent('open', {});
  }
  
  public simulateMessage(data: any): void {
    if (this.readyState !== 1) return; // Only dispatch if open
    
    let messageData: string;
    if (typeof data === 'string') {
      messageData = data;
    } else {
      try {
        messageData = JSON.stringify(data);
      } catch (e) {
        messageData = String(data);
      }
    }
    
    this.dispatchEvent('message', {
      data: messageData,
      origin: this.url,
      lastEventId: '',
      source: null,
      ports: [],
    });
  }
  
  public simulateError(error: any = {}): void {
    this.dispatchEvent('error', error);
  }
  
  public simulateClose(code: number = 1000, reason: string = '', wasClean: boolean = true): void {
    this.readyState = 3; // CLOSED
    this.dispatchEvent('close', { code, reason, wasClean });
  }
  
  public getSentMessages(): any[] {
    return [...this.sentMessages];
  }
  
  public clearSentMessages(): void {
    this.sentMessages = [];
  }
  
  public setAutoResponder(responder: (data: any) => any): void {
    this.autoResponder = responder;
  }
  
  public setConnectionDelay(delay: number): void {
    this.connectionDelay = delay;
  }
  
  // Event handlers (will be set by user code)
  public onopen: ((event: any) => void) | null = null;
  public onmessage: ((event: any) => void) | null = null;
  public onclose: ((event: any) => void) | null = null;
  public onerror: ((event: any) => void) | null = null;
}

// Mock for EventSource
export class MockEventSource {
  public url: string;
  public readyState: number = 0; // CONNECTING
  public withCredentials: boolean = false;
  
  private eventListeners: Record<string, ((event: any) => void)[]> = {
    open: [],
    message: [],
    error: [],
  };
  
  constructor(url: string, options?: EventSourceInit) {
    this.url = url;
    if (options?.withCredentials) {
      this.withCredentials = options.withCredentials;
    }
    
    // Simulate connection delay
    setTimeout(() => this.simulateOpen(), 50);
  }
  
  public addEventListener(type: string, listener: (event: any) => void): void {
    if (!this.eventListeners[type]) {
      this.eventListeners[type] = [];
    }
    this.eventListeners[type].push(listener);
  }
  
  public removeEventListener(type: string, listener: (event: any) => void): void {
    if (this.eventListeners[type]) {
      const index = this.eventListeners[type].indexOf(listener);
      if (index !== -1) {
        this.eventListeners[type].splice(index, 1);
      }
    }
  }
  
  public close(): void {
    this.readyState = 2; // CLOSED
  }
  
  // Methods for controlling the mock in tests
  public simulateOpen(): void {
    this.readyState = 1; // OPEN
    this.dispatchEvent('open', {});
  }
  
  public simulateMessage(data: any, eventName: string = 'message'): void {
    if (this.readyState !== 1) return; // Only dispatch if open
    
    let messageData: string;
    if (typeof data === 'string') {
      messageData = data;
    } else {
      try {
        messageData = JSON.stringify(data);
      } catch (e) {
        messageData = String(data);
      }
    }
    
    this.dispatchEvent(eventName, {
      data: messageData,
      type: eventName,
      lastEventId: '',
    });
  }
  
  public simulateError(error: any = {}): void {
    this.dispatchEvent('error', error);
  }
  
  private dispatchEvent(type: string, eventData: any): void {
    const event = { ...eventData, type };
    
    // Call the specific event handler if defined
    const handlerName = `on${type}` as keyof MockEventSource;
    const handler = this[handlerName] as unknown as (event: any) => void;
    if (typeof handler === 'function') {
      handler(event);
    }
    
    // Call all registered event listeners
    if (this.eventListeners[type]) {
      this.eventListeners[type].forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error(`Error in EventSource ${type} event listener:`, error);
        }
      });
    }
  }
  
  // Event handlers (will be set by user code)
  public onopen: ((event: any) => void) | null = null;
  public onmessage: ((event: any) => void) | null = null;
  public onerror: ((event: any) => void) | null = null;
}

// Network condition simulation
export interface NetworkCondition {
  latency: number;       // Base latency in ms
  jitter: number;        // Random variation in latency (±ms)
  packetLoss: number;    // Probability of packet loss (0-1)
  bandwidth: number;     // Bandwidth limit in KB/s (0 = unlimited)
}

// Default network conditions presets
export const NetworkConditions = {
  PERFECT: { latency: 0, jitter: 0, packetLoss: 0, bandwidth: 0 },
  GOOD: { latency: 50, jitter: 10, packetLoss: 0, bandwidth: 1000 },
  AVERAGE: { latency: 100, jitter: 30, packetLoss: 0.01, bandwidth: 500 },
  POOR: { latency: 300, jitter: 100, packetLoss: 0.05, bandwidth: 100 },
  TERRIBLE: { latency: 1000, jitter: 500, packetLoss: 0.1, bandwidth: 10 },
};

// Network simulator for testing network conditions
export class NetworkSimulator {
  private condition: NetworkCondition;
  private enabled: boolean = false;
  
  constructor(condition: NetworkCondition = NetworkConditions.GOOD) {
    this.condition = condition;
  }
  
  public enable(): void {
    this.enabled = true;
  }
  
  public disable(): void {
    this.enabled = false;
  }
  
  public setCondition(condition: NetworkCondition): void {
    this.condition = condition;
  }
  
  public async simulateNetworkDelay(size: number = 0): Promise<void> {
    if (!this.enabled) return;
    
    // Calculate delay based on latency, jitter, and bandwidth
    let delay = this.condition.latency;
    
    // Add random jitter
    if (this.condition.jitter > 0) {
      delay += (Math.random() * 2 - 1) * this.condition.jitter;
    }
    
    // Add bandwidth delay if specified
    if (this.condition.bandwidth > 0 && size > 0) {
      const bandwidthDelay = (size / this.condition.bandwidth) * 1000;
      delay += bandwidthDelay;
    }
    
    // Ensure delay is not negative
    delay = Math.max(0, delay);
    
    // Simulate packet loss
    if (Math.random() < this.condition.packetLoss) {
      throw new Error('Simulated packet loss');
    }
    
    // Wait for the calculated delay
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  public wrapFetch(): void {
    const originalFetch = global.fetch;
    const simulator = this;
    
    global.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
      if (!simulator.enabled) {
        return originalFetch(input, init);
      }
      
      try {
        // Calculate request size (approximate)
        let requestSize = 500; // Base size in bytes
        if (init?.body) {
          if (typeof init.body === 'string') {
            requestSize += init.body.length;
          } else if (init.body instanceof Blob || init.body instanceof ArrayBuffer) {
            requestSize += (init.body as any).size || (init.body as any).byteLength || 0;
          }
        }
        
        // Simulate request delay
        await simulator.simulateNetworkDelay(requestSize);
        
        // Make the actual request
        const response = await originalFetch(input, init);
        
        // Clone the response to get its size
        const clone = response.clone();
        const buffer = await clone.arrayBuffer();
        const responseSize = buffer.byteLength;
        
        // Simulate response delay
        await simulator.simulateNetworkDelay(responseSize);
        
        return response;
      } catch (error) {
        if ((error as Error).message === 'Simulated packet loss') {
          throw new Error('Network request failed');
        }
        throw error;
      }
    };
  }
  
  public unwrapFetch(): void {
    // Restore original fetch if it was wrapped
    if (global.fetch && (global.fetch as any).__wrapped) {
      global.fetch = (global.fetch as any).__original;
    }
  }
}

// Time control for testing time-dependent code
export class TimeController {
  private originalSetTimeout: typeof setTimeout;
  private originalClearTimeout: typeof clearTimeout;
  private originalSetInterval: typeof setInterval;
  private originalClearInterval: typeof clearInterval;
  private originalDateNow: typeof Date.now;
  private originalPerformanceNow: () => number;
  
  private timers: Map<number, { callback: Function, delay: number, args: any[], nextTime: number, isInterval: boolean }> = new Map();
  private timerIdCounter: number = 1;
  private currentTime: number = 0;
  private isEnabled: boolean = false;
  
  constructor(initialTime: number = Date.now()) {
    this.currentTime = initialTime;
    this.originalSetTimeout = global.setTimeout;
    this.originalClearTimeout = global.clearTimeout;
    this.originalSetInterval = global.setInterval;
    this.originalClearInterval = global.clearInterval;
    this.originalDateNow = Date.now;
    this.originalPerformanceNow = performance.now;
  }
  
  public enable(): void {
    if (this.isEnabled) return;
    
    // Mock setTimeout
    global.setTimeout = (callback: Function, delay: number = 0, ...args: any[]) => {
      const id = this.timerIdCounter++;
      this.timers.set(id, {
        callback,
        delay,
        args,
        nextTime: this.currentTime + delay,
        isInterval: false,
      });
      return id;
    };
    
    // Mock clearTimeout
    global.clearTimeout = (id: number) => {
      this.timers.delete(id);
      return undefined;
    };
    
    // Mock setInterval
    global.setInterval = (callback: Function, delay: number = 0, ...args: any[]) => {
      const id = this.timerIdCounter++;
      this.timers.set(id, {
        callback,
        delay,
        args,
        nextTime: this.currentTime + delay,
        isInterval: true,
      });
      return id;
    };
    
    // Mock clearInterval
    global.clearInterval = (id: number) => {
      this.timers.delete(id);
      return undefined;
    };
    
    // Mock Date.now
    Date.now = () => this.currentTime;
    
    // Mock performance.now
    performance.now = () => this.currentTime;
    
    this.isEnabled = true;
  }
  
  public disable(): void {
    if (!this.isEnabled) return;
    
    global.setTimeout = this.originalSetTimeout;
    global.clearTimeout = this.originalClearTimeout;
    global.setInterval = this.originalSetInterval;
    global.clearInterval = this.originalClearInterval;
    Date.now = this.originalDateNow;
    performance.now = this.originalPerformanceNow;
    
    this.isEnabled = false;
  }
  
  public advanceTime(milliseconds: number): void {
    if (!this.isEnabled) {
      throw new Error('TimeController is not enabled');
    }
    
    const targetTime = this.currentTime + milliseconds;
    
    // Process all timers that should fire before the target time
    while (true) {
      // Find the next timer to execute
      let nextTimerId: number | null = null;
      let nextTime = Infinity;
      
      for (const [id, timer] of this.timers.entries()) {
        if (timer.nextTime <= targetTime && timer.nextTime < nextTime) {
          nextTimerId = id;
          nextTime = timer.nextTime;
        }
      }
      
      if (nextTimerId === null) {
        break; // No more timers to process
      }
      
      // Update current time to the next timer's time
      this.currentTime = nextTime;
      
      // Execute the timer
      const timer = this.timers.get(nextTimerId)!;
      
      try {
        timer.callback(...timer.args);
      } catch (error) {
        console.error('Error in timer callback:', error);
      }
      
      // Remove one-time timers or reschedule intervals
      if (timer.isInterval) {
        timer.nextTime = this.currentTime + timer.delay;
      } else {
        this.timers.delete(nextTimerId);
      }
    }
    
    // Set the current time to the target time
    this.currentTime = targetTime;
  }
  
  public runAllTimers(): void {
    while (this.timers.size > 0) {
      this.advanceToNextTimer();
    }
  }
  
  public runOnlyPendingTimers(): void {
    const pendingTimers = new Set(this.timers.keys());
    
    for (const id of pendingTimers) {
      if (this.timers.has(id)) {
        this.advanceToNextTimer();
      }
    }
  }
  
  public advanceToNextTimer(): void {
    if (this.timers.size === 0) {
      return;
    }
    
    // Find the next timer
    let nextTime = Infinity;
    
    for (const timer of this.timers.values()) {
      if (timer.nextTime < nextTime) {
        nextTime = timer.nextTime;
      }
    }
    
    // Advance time to the next timer
    const timeToAdvance = nextTime - this.currentTime;
    if (timeToAdvance > 0) {
      this.advanceTime(timeToAdvance);
    }
  }
  
  public clearAllTimers(): void {
    this.timers.clear();
  }
  
  public getCurrentTime(): number {
    return this.currentTime;
  }
  
  public setCurrentTime(time: number): void {
    this.currentTime = time;
  }
}

// Setup functions for tests
export function setupRealTimeTests() {
  // Mock WebSocket
  const originalWebSocket = global.WebSocket;
  global.WebSocket = MockWebSocket as any;
  
  // Mock EventSource
  const originalEventSource = global.EventSource;
  global.EventSource = MockEventSource as any;
  
  // Create network simulator
  const networkSimulator = new NetworkSimulator();
  
  // Create time controller
  const timeController = new TimeController();
  
  return {
    cleanup: () => {
      global.WebSocket = originalWebSocket;
      global.EventSource = originalEventSource;
      networkSimulator.unwrapFetch();
      timeController.disable();
    },
    networkSimulator,
    timeController,
    mockWebSocketImplementation: () => {
      return MockWebSocket as any;
    },
    mockEventSourceImplementation: () => {
      return MockEventSource as any;
    },
  };
}

// Helper function to create a mock real-time event
export function createMockRealTimeEvent(type: string, data: any = {}) {
  return {
    type,
    timestamp: Date.now(),
    ...data,
  };
}
