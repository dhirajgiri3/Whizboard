'use client';

import { useEffect, useCallback, useRef } from 'react';
import { 
  recordMetric, 
  startMeasurement, 
  measureFunction,
  MetricType 
} from '@/lib/utils/performance-metrics';

interface UsePerformanceMonitoringOptions {
  componentName: string;
  boardId?: string;
  elementCount?: number;
  userId?: string;
}

/**
 * Hook for monitoring performance within components
 * @param options Configuration options
 * @returns Object with performance monitoring methods
 */
export function usePerformanceMonitoring(options: UsePerformanceMonitoringOptions) {
  const { componentName, boardId, elementCount, userId } = options;
  const renderStartTime = useRef<number>(performance.now());
  
  // Record component render time on mount
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current;
    
    // Record the render time
    recordMetric(
      `${componentName}_render_time`,
      renderTime,
      { boardId, elementCount, userId }
    );
    
    // For board components, also record as board render time
    if (componentName.includes('Board')) {
      recordMetric(
        MetricType.BOARD_RENDER,
        renderTime,
        { boardId, elementCount, userId }
      );
    }
    
    return () => {
      // Record component unmount time
      recordMetric(
        `${componentName}_unmount_time`,
        performance.now() - renderStartTime.current,
        { boardId, elementCount, userId }
      );
    };
  }, [componentName, boardId, elementCount, userId]);
  
  /**
   * Measure the execution time of a function
   * @param fn Function to measure
   * @param metricName Name of the metric (will be prefixed with component name)
   * @returns Result of the function
   */
  const measure = useCallback(<T>(
    fn: () => T | Promise<T>,
    metricName: string
  ): Promise<T> => {
    return measureFunction(
      fn,
      `${componentName}_${metricName}`,
      { boardId, elementCount, userId }
    );
  }, [componentName, boardId, elementCount, userId]);
  
  /**
   * Start measuring a custom operation
   * @param operationName Name of the operation
   * @returns Function to stop the measurement
   */
  const startMeasuring = useCallback((operationName: string) => {
    return startMeasurement(`${componentName}_${operationName}`);
  }, [componentName]);
  
  /**
   * Record a specific metric
   * @param metricName Name of the metric
   * @param value Value of the metric (usually in milliseconds)
   */
  const recordCustomMetric = useCallback((
    metricName: string,
    value: number
  ) => {
    recordMetric(
      `${componentName}_${metricName}`,
      value,
      { boardId, elementCount, userId }
    );
  }, [componentName, boardId, elementCount, userId]);
  
  /**
   * Record API response time
   * @param apiName Name of the API
   * @param responseTime Response time in milliseconds
   */
  const recordApiResponseTime = useCallback((
    apiName: string,
    responseTime: number
  ) => {
    recordMetric(
      MetricType.API_RESPONSE,
      responseTime,
      { 
        boardId, 
        userId,
        apiName 
      }
    );
  }, [boardId, userId]);
  
  /**
   * Record collaboration latency
   * @param latency Latency in milliseconds
   */
  const recordCollaborationLatency = useCallback((latency: number) => {
    recordMetric(
      MetricType.COLLABORATION_LATENCY,
      latency,
      { boardId, userId }
    );
  }, [boardId, userId]);
  
  return {
    measure,
    startMeasuring,
    recordCustomMetric,
    recordApiResponseTime,
    recordCollaborationLatency,
  };
}

export default usePerformanceMonitoring;
