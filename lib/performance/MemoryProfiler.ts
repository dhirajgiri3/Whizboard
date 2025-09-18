/**
 * Memory Profiler for Development Environment
 * Tracks memory usage, detects leaks, and provides insights
 * Only active in development mode
 */

interface MemorySnapshot {
  timestamp: number;
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  componentCount: number;
  eventListeners: number;
}

interface MemoryTrend {
  slope: number;
  correlation: number;
  isIncreasing: boolean;
}

class MemoryProfiler {
  private snapshots: MemorySnapshot[] = [];
  private isActive = false;
  private intervalId: NodeJS.Timeout | null = null;
  private componentCounts = new Map<string, number>();
  private eventListenerCount = 0;

  constructor() {
    if (process.env.NODE_ENV === 'development') {
      this.init();
    }
  }

  private init() {
    // Only initialize in browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      console.log('🔍 Memory Profiler skipped - not in browser environment');
      return;
    }

    this.isActive = true;
    this.startProfiling();

    // Add global error handler for memory issues
    window.addEventListener('error', this.handleError);

    // Add visibility change listener to pause/resume profiling
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    // Add beforeunload listener for cleanup
    window.addEventListener('beforeunload', this.cleanup);

    console.log('🔍 Memory Profiler initialized for development');
  }

  private handleError = (event: ErrorEvent) => {
    if (event.message.includes('memory') || event.message.includes('heap')) {
      console.error('🚨 Memory-related error detected:', event.message);
      this.logCurrentState();
    }
  };

  private handleVisibilityChange = () => {
    if (typeof document !== 'undefined' && document.hidden) {
      this.pauseProfiling();
    } else {
      this.resumeProfiling();
    }
  };

  private startProfiling() {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      this.takeSnapshot();
      this.analyzeMemoryTrends();
    }, 10000); // Take snapshot every 10 seconds

    // Take initial snapshot
    this.takeSnapshot();
  }

  private pauseProfiling() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private resumeProfiling() {
    if (!this.intervalId && this.isActive) {
      this.startProfiling();
    }
  }

  private takeSnapshot(): MemorySnapshot {
    const memory = (performance as any).memory;

    if (!memory) {
      // Fallback for browsers without memory API
      return {
        timestamp: Date.now(),
        usedJSHeapSize: 0,
        totalJSHeapSize: 0,
        jsHeapSizeLimit: 0,
        componentCount: this.getTotalComponentCount(),
        eventListeners: this.eventListenerCount,
      };
    }

    const snapshot: MemorySnapshot = {
      timestamp: Date.now(),
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      componentCount: this.getTotalComponentCount(),
      eventListeners: this.eventListenerCount,
    };

    this.snapshots.push(snapshot);

    // Keep only last 50 snapshots to prevent memory bloat
    if (this.snapshots.length > 50) {
      this.snapshots = this.snapshots.slice(-50);
    }

    return snapshot;
  }

  private getTotalComponentCount(): number {
    return Array.from(this.componentCounts.values()).reduce((sum, count) => sum + count, 0);
  }

  private analyzeMemoryTrends() {
    if (this.snapshots.length < 5) return;

    const recentSnapshots = this.snapshots.slice(-10);
    const trend = this.calculateTrend(recentSnapshots);

    if (trend.isIncreasing && trend.slope > 100000) { // 100KB per snapshot increase
      console.warn('📈 Memory usage is increasing rapidly:', {
        slopePerSecond: Math.round(trend.slope / 10), // Convert to per-second
        correlation: trend.correlation,
        currentUsage: this.formatBytes(recentSnapshots[recentSnapshots.length - 1].usedJSHeapSize),
      });
    }

    // Check for significant memory spikes
    const current = recentSnapshots[recentSnapshots.length - 1];
    const previous = recentSnapshots[recentSnapshots.length - 2];

    if (current && previous) {
      const increase = current.usedJSHeapSize - previous.usedJSHeapSize;
      if (increase > 5000000) { // 5MB increase in one snapshot
        console.warn('🚨 Large memory increase detected:', {
          increase: this.formatBytes(increase),
          currentUsage: this.formatBytes(current.usedJSHeapSize),
          componentCountIncrease: current.componentCount - previous.componentCount,
          eventListenerIncrease: current.eventListeners - previous.eventListeners,
        });
      }
    }
  }

  private calculateTrend(snapshots: MemorySnapshot[]): MemoryTrend {
    const n = snapshots.length;
    if (n < 2) return { slope: 0, correlation: 0, isIncreasing: false };

    const x = snapshots.map((_, i) => i);
    const y = snapshots.map(s => s.usedJSHeapSize);

    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    const sumYY = y.reduce((sum, val) => sum + val * val, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const correlation = (n * sumXY - sumX * sumY) / Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

    return {
      slope,
      correlation,
      isIncreasing: slope > 0 && correlation > 0.7, // Strong positive correlation
    };
  }

  private formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  // Public API for component tracking
  registerComponent(componentName: string) {
    const count = this.componentCounts.get(componentName) || 0;
    this.componentCounts.set(componentName, count + 1);
  }

  unregisterComponent(componentName: string) {
    const count = this.componentCounts.get(componentName) || 0;
    if (count > 0) {
      this.componentCounts.set(componentName, count - 1);
    }
  }

  incrementEventListenerCount() {
    this.eventListenerCount++;
  }

  decrementEventListenerCount() {
    this.eventListenerCount = Math.max(0, this.eventListenerCount - 1);
  }

  // Public API for manual profiling
  logCurrentState() {
    const snapshot = this.takeSnapshot();
    const componentBreakdown = Array.from(this.componentCounts.entries())
      .filter(([, count]) => count > 0)
      .sort(([, a], [, b]) => b - a);

    console.group('🔍 Current Memory State');
    console.log('Heap Usage:', this.formatBytes(snapshot.usedJSHeapSize));
    console.log('Total Heap:', this.formatBytes(snapshot.totalJSHeapSize));
    console.log('Heap Limit:', this.formatBytes(snapshot.jsHeapSizeLimit));
    console.log('Component Count:', snapshot.componentCount);
    console.log('Event Listeners:', snapshot.eventListeners);

    if (componentBreakdown.length > 0) {
      console.log('Component Breakdown:', Object.fromEntries(componentBreakdown));
    }

    if (this.snapshots.length > 1) {
      const trend = this.calculateTrend(this.snapshots.slice(-5));
      console.log('Memory Trend:', {
        slopePerSecond: Math.round(trend.slope / 10),
        correlation: trend.correlation.toFixed(3),
        status: trend.isIncreasing ? '📈 Increasing' : '📉 Stable/Decreasing',
      });
    }
    console.groupEnd();
  }

  getMemoryReport() {
    return {
      snapshots: this.snapshots.slice(),
      componentCounts: Object.fromEntries(this.componentCounts),
      eventListenerCount: this.eventListenerCount,
      isActive: this.isActive,
    };
  }

  private cleanup = () => {
    this.isActive = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Only remove event listeners if in browser environment
    if (typeof window !== 'undefined') {
      window.removeEventListener('error', this.handleError);
      window.removeEventListener('beforeunload', this.cleanup);
    }

    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }

    this.snapshots = [];
    this.componentCounts.clear();
  };
}

// Create singleton instance
export const memoryProfiler = new MemoryProfiler();

// React hook for component tracking
export const useMemoryProfiler = (componentName: string) => {
  if (process.env.NODE_ENV === 'development') {
     
    const { useEffect } = require('react');

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      memoryProfiler.registerComponent(componentName);
      return () => {
        memoryProfiler.unregisterComponent(componentName);
      };
    }, [componentName]);
  }
};

// Enhanced event listener tracking
export const addTrackedEventListener = (
  target: EventTarget,
  event: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions
) => {
  target.addEventListener(event, listener, options);

  if (process.env.NODE_ENV === 'development') {
    memoryProfiler.incrementEventListenerCount();
  }

  return () => {
    target.removeEventListener(event, listener, options);

    if (process.env.NODE_ENV === 'development') {
      memoryProfiler.decrementEventListenerCount();
    }
  };
};

// Global memory profiler access for debugging
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as any).__memoryProfiler = memoryProfiler;
  console.log('🔧 Memory Profiler available as window.__memoryProfiler');
}

export default MemoryProfiler;