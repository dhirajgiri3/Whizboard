/**
 * Performance Markers Utility
 * Adds performance markers around critical paths for monitoring and optimization
 * Only active in development mode
 */

interface PerformanceEntry {
  name: string;
  startTime: number;
  duration?: number;
  type: 'mark' | 'measure';
}

class PerformanceMarkers {
  private isActive: boolean = false;
  private measurements: Map<string, PerformanceEntry[]> = new Map();
  private activeMarks: Map<string, number> = new Map();

  constructor() {
    this.isActive = process.env.NODE_ENV === 'development' && typeof window !== 'undefined' && 'performance' in window;

    if (this.isActive) {
      console.log('🚀 Performance Markers initialized for development');
    }
  }

  /**
   * Start a performance measurement
   */
  markStart(name: string): void {
    if (!this.isActive) return;

    try {
      const markName = `${name}-start`;
      performance.mark(markName);
      this.activeMarks.set(name, performance.now());
    } catch (error) {
      console.warn('Performance mark failed:', error);
    }
  }

  /**
   * End a performance measurement and calculate duration
   */
  markEnd(name: string): number | null {
    if (!this.isActive) return null;

    try {
      const startTime = this.activeMarks.get(name);
      if (startTime === undefined) {
        console.warn(`Performance mark "${name}" was never started`);
        return null;
      }

      const endMarkName = `${name}-end`;
      const measureName = `${name}-measure`;

      performance.mark(endMarkName);
      performance.measure(measureName, `${name}-start`, endMarkName);

      const duration = performance.now() - startTime;

      // Store measurement
      const entries = this.measurements.get(name) || [];
      entries.push({
        name,
        startTime,
        duration,
        type: 'measure'
      });

      // Keep only last 10 measurements per operation
      if (entries.length > 10) {
        entries.splice(0, entries.length - 10);
      }

      this.measurements.set(name, entries);
      this.activeMarks.delete(name);

      // Log slow operations (> 16ms, which could cause frame drops)
      if (duration > 16) {
        console.warn(`🐌 Slow operation detected: "${name}" took ${duration.toFixed(2)}ms`);
      }

      return duration;
    } catch (error) {
      console.warn('Performance measure failed:', error);
      return null;
    }
  }

  /**
   * Create a simple performance mark
   */
  mark(name: string): void {
    if (!this.isActive) return;

    try {
      performance.mark(name);

      const entries = this.measurements.get(name) || [];
      entries.push({
        name,
        startTime: performance.now(),
        type: 'mark'
      });

      this.measurements.set(name, entries);
    } catch (error) {
      console.warn('Performance mark failed:', error);
    }
  }

  /**
   * Measure a function execution time
   */
  measureFunction<T>(name: string, fn: () => T): T {
    this.markStart(name);
    try {
      const result = fn();
      this.markEnd(name);
      return result;
    } catch (error) {
      this.markEnd(name);
      throw error;
    }
  }

  /**
   * Measure an async function execution time
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.markStart(name);
    try {
      const result = await fn();
      this.markEnd(name);
      return result;
    } catch (error) {
      this.markEnd(name);
      throw error;
    }
  }

  /**
   * Get average duration for an operation
   */
  getAverageDuration(name: string): number | null {
    const entries = this.measurements.get(name);
    if (!entries || entries.length === 0) return null;

    const durationsOnly = entries.filter(entry => entry.duration !== undefined);
    if (durationsOnly.length === 0) return null;

    const sum = durationsOnly.reduce((acc, entry) => acc + (entry.duration || 0), 0);
    return sum / durationsOnly.length;
  }

  /**
   * Get performance statistics for an operation
   */
  getStats(name: string): {
    count: number;
    average: number | null;
    min: number | null;
    max: number | null;
    recent: number | null;
  } | null {
    const entries = this.measurements.get(name);
    if (!entries || entries.length === 0) return null;

    const durationsOnly = entries.filter(entry => entry.duration !== undefined);
    if (durationsOnly.length === 0) return null;

    const durations = durationsOnly.map(entry => entry.duration!);
    const sum = durations.reduce((acc, val) => acc + val, 0);

    return {
      count: durations.length,
      average: sum / durations.length,
      min: Math.min(...durations),
      max: Math.max(...durations),
      recent: durations[durations.length - 1] || null
    };
  }

  /**
   * Log performance report
   */
  logReport(): void {
    if (!this.isActive || this.measurements.size === 0) return;

    console.group('📊 Performance Report');

    for (const [name, entries] of this.measurements) {
      const stats = this.getStats(name);
      if (stats) {
        console.log(`${name}:`, {
          calls: stats.count,
          avg: `${stats.average?.toFixed(2)}ms`,
          min: `${stats.min?.toFixed(2)}ms`,
          max: `${stats.max?.toFixed(2)}ms`,
          recent: `${stats.recent?.toFixed(2)}ms`
        });
      } else {
        console.log(`${name}:`, `${entries.length} marks`);
      }
    }

    console.groupEnd();
  }

  /**
   * Clear all measurements
   */
  clear(): void {
    this.measurements.clear();
    this.activeMarks.clear();

    if (this.isActive) {
      try {
        performance.clearMarks();
        performance.clearMeasures();
      } catch (error) {
        console.warn('Failed to clear performance entries:', error);
      }
    }
  }

  /**
   * Get all measurements (for debugging)
   */
  getAllMeasurements(): Record<string, PerformanceEntry[]> {
    return Object.fromEntries(this.measurements);
  }
}

// Create singleton instance
export const performanceMarkers = new PerformanceMarkers();

// Convenience functions
export const markStart = (name: string) => performanceMarkers.markStart(name);
export const markEnd = (name: string) => performanceMarkers.markEnd(name);
export const mark = (name: string) => performanceMarkers.mark(name);
export const measureFunction = <T>(name: string, fn: () => T) => performanceMarkers.measureFunction(name, fn);
export const measureAsync = <T>(name: string, fn: () => Promise<T>) => performanceMarkers.measureAsync(name, fn);

// React hook for measuring component render time
export const usePerformanceMeasure = (componentName: string) => {
  if (process.env.NODE_ENV === 'development') {
     
    const { useLayoutEffect } = require('react');

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useLayoutEffect(() => {
      performanceMarkers.mark(`${componentName}-render`);
    });
  }
};

// Global access for debugging
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as any).__performanceMarkers = performanceMarkers;
  console.log('🔧 Performance Markers available as window.__performanceMarkers');
}

export default PerformanceMarkers;