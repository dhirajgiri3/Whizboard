import { beforeAll } from 'vitest';

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
    },
    writable: true,
  });

  // Mock navigator
  Object.defineProperty(window, 'navigator', {
    value: {
      sendBeacon: () => true,
    },
    writable: true,
  });

  // Mock WebSocket
  global.WebSocket = class {
    url: string;
    readyState: number;
    
    constructor(url: string) {
      this.url = url;
      this.readyState = 1; // OPEN
    }
    
    close() {}
    send() {}
    addEventListener() {}
    removeEventListener() {}
  } as any;

  // Mock EventSource
  global.EventSource = class {
    url: string;
    readyState: number;
    
    constructor(url: string) {
      this.url = url;
      this.readyState = 1; // OPEN
    }
    
    close() {}
    addEventListener() {}
    removeEventListener() {}
  } as any;

  // Mock requestAnimationFrame
  global.requestAnimationFrame = (callback: FrameRequestCallback) => {
    return setTimeout(callback, 16) as any;
  };

  // Mock cancelAnimationFrame
  global.cancelAnimationFrame = (handle: number) => {
    clearTimeout(handle);
  };
}); 