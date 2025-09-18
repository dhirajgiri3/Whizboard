/**
 * Performance Metrics Utility
 * 
 * This utility provides tools for monitoring and reporting performance metrics
 * such as First Contentful Paint (FCP), Largest Contentful Paint (LCP),
 * Time to Interactive (TTI), and custom render times.
 */

// Types of performance metrics we track
export enum MetricType {
  // Web Vitals
  FCP = 'first-contentful-paint',
  LCP = 'largest-contentful-paint',
  FID = 'first-input-delay',
  CLS = 'cumulative-layout-shift',
  TTI = 'time-to-interactive',
  TTFB = 'time-to-first-byte',
  
  // Custom metrics
  BOARD_LOAD = 'board-load-time',
  BOARD_RENDER = 'board-render-time',
  ELEMENT_RENDER = 'element-render-time',
  COLLABORATION_LATENCY = 'collaboration-latency',
  API_RESPONSE = 'api-response-time',
}

// Interface for a performance metric
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  userId?: string;
  boardId?: string;
  elementCount?: number;
  deviceInfo?: {
    userAgent: string;
    screenWidth: number;
    screenHeight: number;
    devicePixelRatio: number;
    connection?: {
      effectiveType: string;
      downlink: number;
      rtt: number;
    };
  };
}

// Store metrics in memory (for dev tools)
const metrics: Record<string, PerformanceMetric[]> = {};

/**
 * Record a performance metric
 * @param type Type of metric
 * @param value Value of the metric (usually in milliseconds)
 * @param additionalData Additional context data
 */
export const recordMetric = (
  type: MetricType | string,
  value: number,
  additionalData: {
    userId?: string;
    boardId?: string;
    elementCount?: number;
  } = {}
): void => {
  if (typeof window === 'undefined') return;
  
  // Create the metric object
  const metric: PerformanceMetric = {
    name: type,
    value,
    timestamp: Date.now(),
    ...additionalData,
    deviceInfo: {
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      devicePixelRatio: window.devicePixelRatio,
      connection: 'connection' in navigator && (navigator as any).connection ? {
        effectiveType: (navigator as any).connection.effectiveType,
        downlink: (navigator as any).connection.downlink,
        rtt: (navigator as any).connection.rtt,
      } : undefined,
    },
  };
  
  // Store metric in memory
  if (!metrics[type]) {
    metrics[type] = [];
  }
  metrics[type].push(metric);
  
  // Limit the number of stored metrics to prevent memory issues
  if (metrics[type].length > 100) {
    metrics[type] = metrics[type].slice(-100);
  }
  
  // Send metric to server if in production
  if (process.env.NODE_ENV === 'production') {
    sendMetricToServer(metric).catch(console.error);
  }
  
  // Log metric in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${type}: ${value.toFixed(2)}ms`, additionalData);
  }
};

/**
 * Send a metric to the server for storage and analysis
 * @param metric The metric to send
 */
const sendMetricToServer = async (metric: PerformanceMetric): Promise<void> => {
  try {
    await fetch('/api/monitoring/metrics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ metric }),
      // Use keepalive to ensure the request completes even if the page is unloading
      keepalive: true,
    });
  } catch (error) {
    // Silent fail - we don't want to disrupt the user experience
    console.error('Failed to send metric to server:', error);
  }
};

/**
 * Get metrics of a specific type
 * @param type Type of metric to retrieve
 * @returns Array of metrics of the specified type
 */
export const getMetrics = (type: MetricType | string): PerformanceMetric[] => {
  return metrics[type] || [];
};

/**
 * Get the average value of a specific metric type
 * @param type Type of metric
 * @returns Average value or null if no metrics of that type exist
 */
export const getAverageMetric = (type: MetricType | string): number | null => {
  const typeMetrics = getMetrics(type);
  if (typeMetrics.length === 0) return null;
  
  const sum = typeMetrics.reduce((acc, metric) => acc + metric.value, 0);
  return sum / typeMetrics.length;
};

/**
 * Start measuring a custom metric
 * @param name Name for the measurement
 * @returns Function to stop the measurement and record the metric
 */
export const startMeasurement = (name: string): () => void => {
  const startTime = performance.now();
  
  return (additionalData = {}) => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    recordMetric(name, duration, additionalData);
  };
};

/**
 * Measure the execution time of a function
 * @param fn Function to measure
 * @param metricName Name of the metric
 * @param additionalData Additional data to include with the metric
 * @returns Result of the function
 */
export const measureFunction = async <T>(
  fn: () => Promise<T> | T,
  metricName: string,
  additionalData = {}
): Promise<T> => {
  const startTime = performance.now();
  
  try {
    const result = await fn();
    const endTime = performance.now();
    recordMetric(metricName, endTime - startTime, additionalData);
    return result;
  } catch (error) {
    const endTime = performance.now();
    recordMetric(`${metricName}_error`, endTime - startTime, additionalData);
    throw error;
  }
};

/**
 * Initialize web vitals monitoring
 */
export const initWebVitals = (): void => {
  if (typeof window === 'undefined') return;
  
  // Use web-vitals library if available
  if ('webVitals' in window) {
    import('web-vitals').then(({ onFCP, onLCP, onFID, onCLS, onTTFB }) => {
      onFCP((metric) => recordMetric(MetricType.FCP, metric.value));
      onLCP((metric) => recordMetric(MetricType.LCP, metric.value));
      onFID((metric) => recordMetric(MetricType.FID, metric.value));
      onCLS((metric) => recordMetric(MetricType.CLS, metric.value * 1000)); // Convert to ms for consistency
      onTTFB((metric) => recordMetric(MetricType.TTFB, metric.value));
    }).catch(console.error);
  }
  
  // Fallback using Performance API
  else {
    // First Contentful Paint
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find((entry) => entry.name === 'first-contentful-paint');
    if (fcpEntry) {
      recordMetric(MetricType.FCP, fcpEntry.startTime);
    }
    
    // Time to First Byte
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navEntry) {
      recordMetric(MetricType.TTFB, navEntry.responseStart - navEntry.requestStart);
    }
    
    // Use PerformanceObserver for other metrics
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          recordMetric(MetricType.LCP, lastEntry.startTime);
          lcpObserver.disconnect();
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (e) {
        console.error('LCP monitoring error:', e);
      }
      
      // First Input Delay
      try {
        const fidObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry) => {
            if (entry.name === 'first-input') {
              recordMetric(MetricType.FID, (entry as PerformanceEventTiming).processingStart - entry.startTime);
              fidObserver.disconnect();
            }
          });
        });
        fidObserver.observe({ type: 'first-input', buffered: true });
      } catch (e) {
        console.error('FID monitoring error:', e);
      }
      
      // Layout Shifts
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry) => {
            if (!entry.hadRecentInput) {
              clsValue += (entry as any).value;
            }
          });
          recordMetric(MetricType.CLS, clsValue * 1000); // Convert to ms for consistency
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
      } catch (e) {
        console.error('CLS monitoring error:', e);
      }
    }
  }
};

// Initialize web vitals monitoring if in browser environment
if (typeof window !== 'undefined') {
  // Wait for the page to be fully loaded
  if (document.readyState === 'complete') {
    initWebVitals();
  } else {
    window.addEventListener('load', initWebVitals);
  }
}
