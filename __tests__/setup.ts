import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import { MockWebSocket, MockEventSource } from './utils/real-time-test-utils';

// Store original implementations
const originalWebSocket = global.WebSocket;
const originalEventSource = global.EventSource;
const originalRAF = global.requestAnimationFrame;
const originalCAF = global.cancelAnimationFrame;
const originalFetch = global.fetch;

// Mock browser APIs for testing
beforeAll(() => {
  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: {
      data: {},
      getItem: function(key: string) { return this.data[key] || null; },
      setItem: function(key: string, value: string) { this.data[key] = value; },
      removeItem: function(key: string) { delete this.data[key]; },
      clear: function() { this.data = {}; },
      length: 0,
      key: function(index: number) { return Object.keys(this.data)[index] || null; },
    },
    writable: true,
  });

  // Mock performance API
  Object.defineProperty(window, 'performance', {
    value: {
      now: () => Date.now(),
      memory: {
        usedJSHeapSize: 1000000,
        totalJSHeapSize: 2000000,
        jsHeapSizeLimit: 10000000,
      },
      getEntriesByType: () => [],
      mark: () => {},
      measure: () => {},
      clearMarks: () => {},
      clearMeasures: () => {},
    },
    writable: true,
  });

  // Mock navigator
  Object.defineProperty(window, 'navigator', {
    value: {
      sendBeacon: () => true,
      userAgent: 'vitest',
      language: 'en-US',
      languages: ['en-US', 'en'],
      onLine: true,
      connection: {
        effectiveType: '4g',
        downlink: 10,
        rtt: 50,
      },
    },
    writable: true,
  });

  // Mock WebSocket with enhanced implementation
  global.WebSocket = MockWebSocket as any;

  // Mock EventSource with enhanced implementation
  global.EventSource = MockEventSource as any;

  // Mock requestAnimationFrame
  global.requestAnimationFrame = (callback: FrameRequestCallback) => {
    return setTimeout(() => callback(performance.now()), 16) as any;
  };

  // Mock cancelAnimationFrame
  global.cancelAnimationFrame = (handle: number) => {
    clearTimeout(handle);
  };

  // Mock IntersectionObserver
  global.IntersectionObserver = class IntersectionObserver {
    root: Element | null = null;
    rootMargin: string = '';
    thresholds: number[] = [];
    
    constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
      if (options?.root) this.root = options.root;
      if (options?.rootMargin) this.rootMargin = options.rootMargin;
      if (options?.threshold) {
        this.thresholds = Array.isArray(options.threshold) 
          ? options.threshold 
          : [options.threshold];
      }
    }
    
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
  };

  // Mock ResizeObserver
  global.ResizeObserver = class ResizeObserver {
    constructor(callback: ResizeObserverCallback) {}
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  // Mock MutationObserver
  global.MutationObserver = class MutationObserver {
    constructor(callback: MutationCallback) {}
    observe() {}
    disconnect() {}
    takeRecords() { return []; }
  };
});

// Clean up after each test
afterEach(() => {
  // Clear all timers
  vi.clearAllTimers();
  
  // Clear all mocks
  vi.clearAllMocks();
  
  // Reset localStorage
  window.localStorage.clear();
  
  // Reset fetch mocks if any
  if ((global.fetch as any).__isMockFunction) {
    vi.mocked(global.fetch).mockReset();
  }
});

// Clean up after all tests
afterAll(() => {
  // Restore original implementations
  global.WebSocket = originalWebSocket;
  global.EventSource = originalEventSource;
  global.requestAnimationFrame = originalRAF;
  global.cancelAnimationFrame = originalCAF;
  
  // Restore fetch if it was mocked
  if ((global.fetch as any).__isMockFunction) {
    global.fetch = originalFetch;
  }
}); 