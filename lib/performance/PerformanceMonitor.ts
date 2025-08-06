import logger from '@/lib/logger/logger';

export interface PerformanceMetrics {
  memoryUsage: {
    used: number;
    total: number;
    limit: number;
    percentage: number;
  };
  frameRate: {
    current: number;
    average: number;
    min: number;
    max: number;
  };
  networkLatency: {
    average: number;
    min: number;
    max: number;
    samples: number;
  };
  renderTime: {
    average: number;
    min: number;
    max: number;
    samples: number;
  };
  errorRate: {
    total: number;
    rate: number;
    lastReset: number;
  };
}

export interface PerformanceThresholds {
  memoryUsagePercentage: number;
  frameRateMin: number;
  networkLatencyMax: number;
  renderTimeMax: number;
  errorRateMax: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private thresholds: PerformanceThresholds;
  private frameRateSamples: number[] = [];
  private networkLatencySamples: number[] = [];
  private renderTimeSamples: number[] = [];
  private errorCount = 0;
  private lastErrorReset = Date.now();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;
  private observers: Set<(metrics: PerformanceMetrics) => void> = new Set();

  constructor(thresholds: Partial<PerformanceThresholds> = {}) {
    this.thresholds = {
      memoryUsagePercentage: 80,
      frameRateMin: 30,
      networkLatencyMax: 1000,
      renderTimeMax: 16, // 60fps = 16ms per frame
      errorRateMax: 0.1, // 10% error rate
      ...thresholds,
    };

    this.metrics = this.initializeMetrics();
  }

  private initializeMetrics(): PerformanceMetrics {
    return {
      memoryUsage: {
        used: 0,
        total: 0,
        limit: 0,
        percentage: 0,
      },
      frameRate: {
        current: 0,
        average: 0,
        min: Infinity,
        max: 0,
      },
      networkLatency: {
        average: 0,
        min: Infinity,
        max: 0,
        samples: 0,
      },
      renderTime: {
        average: 0,
        min: Infinity,
        max: 0,
        samples: 0,
      },
      errorRate: {
        total: 0,
        rate: 0,
        lastReset: Date.now(),
      },
    };
  }

  /**
   * Start performance monitoring
   */
  public startMonitoring(intervalMs: number = 5000): void {
    if (this.isMonitoring) {
      logger.warn('Performance monitoring already started');
      return;
    }

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.updateMetrics();
      this.checkThresholds();
      this.notifyObservers();
    }, intervalMs);

    logger.info({ intervalMs }, 'Performance monitoring started');
  }

  /**
   * Stop performance monitoring
   */
  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    logger.info('Performance monitoring stopped');
  }

  /**
   * Update performance metrics
   */
  private updateMetrics(): void {
    this.updateMemoryUsage();
    this.updateFrameRate();
    this.updateErrorRate();
  }

  /**
   * Update memory usage metrics
   */
  private updateMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const used = memory.usedJSHeapSize;
      const total = memory.totalJSHeapSize;
      const limit = memory.jsHeapSizeLimit;

      this.metrics.memoryUsage = {
        used,
        total,
        limit,
        percentage: (used / limit) * 100,
      };
    }
  }

  /**
   * Update frame rate metrics
   */
  private updateFrameRate(): void {
    // Calculate frame rate using requestAnimationFrame
    let frameCount = 0;
    let lastTime = performance.now();

    const measureFrameRate = (currentTime: number) => {
      frameCount++;
      const deltaTime = currentTime - lastTime;

      if (deltaTime >= 1000) { // Measure over 1 second
        const fps = (frameCount * 1000) / deltaTime;
        
        this.frameRateSamples.push(fps);
        if (this.frameRateSamples.length > 60) { // Keep last 60 samples
          this.frameRateSamples.shift();
        }

        this.metrics.frameRate = {
          current: fps,
          average: this.calculateAverage(this.frameRateSamples),
          min: Math.min(...this.frameRateSamples),
          max: Math.max(...this.frameRateSamples),
        };

        frameCount = 0;
        lastTime = currentTime;
      }

      if (this.isMonitoring) {
        requestAnimationFrame(measureFrameRate);
      }
    };

    requestAnimationFrame(measureFrameRate);
  }

  /**
   * Update error rate metrics
   */
  private updateErrorRate(): void {
    const now = Date.now();
    const timeSinceReset = now - this.lastErrorReset;
    
    if (timeSinceReset >= 60000) { // Reset every minute
      this.errorCount = 0;
      this.lastErrorReset = now;
    }

    this.metrics.errorRate = {
      total: this.errorCount,
      rate: this.errorCount / (timeSinceReset / 1000), // errors per second
      lastReset: this.lastErrorReset,
    };
  }

  /**
   * Record a network latency measurement
   */
  public recordNetworkLatency(latencyMs: number): void {
    this.networkLatencySamples.push(latencyMs);
    if (this.networkLatencySamples.length > 100) { // Keep last 100 samples
      this.networkLatencySamples.shift();
    }

    this.metrics.networkLatency = {
      average: this.calculateAverage(this.networkLatencySamples),
      min: Math.min(...this.networkLatencySamples),
      max: Math.max(...this.networkLatencySamples),
      samples: this.networkLatencySamples.length,
    };
  }

  /**
   * Record a render time measurement
   */
  public recordRenderTime(renderTimeMs: number): void {
    this.renderTimeSamples.push(renderTimeMs);
    if (this.renderTimeSamples.length > 100) { // Keep last 100 samples
      this.renderTimeSamples.shift();
    }

    this.metrics.renderTime = {
      average: this.calculateAverage(this.renderTimeSamples),
      min: Math.min(...this.renderTimeSamples),
      max: Math.max(...this.renderTimeSamples),
      samples: this.renderTimeSamples.length,
    };
  }

  /**
   * Record an error occurrence
   */
  public recordError(): void {
    this.errorCount++;
    this.updateErrorRate();
  }

  /**
   * Check if metrics exceed thresholds
   */
  private checkThresholds(): void {
    const warnings: string[] = [];

    if (this.metrics.memoryUsage.percentage > this.thresholds.memoryUsagePercentage) {
      warnings.push(`Memory usage high: ${this.metrics.memoryUsage.percentage.toFixed(1)}%`);
    }

    if (this.metrics.frameRate.average < this.thresholds.frameRateMin) {
      warnings.push(`Frame rate low: ${this.metrics.frameRate.average.toFixed(1)} FPS`);
    }

    if (this.metrics.networkLatency.average > this.thresholds.networkLatencyMax) {
      warnings.push(`Network latency high: ${this.metrics.networkLatency.average.toFixed(1)}ms`);
    }

    if (this.metrics.renderTime.average > this.thresholds.renderTimeMax) {
      warnings.push(`Render time high: ${this.metrics.renderTime.average.toFixed(1)}ms`);
    }

    if (this.metrics.errorRate.rate > this.thresholds.errorRateMax) {
      warnings.push(`Error rate high: ${(this.metrics.errorRate.rate * 100).toFixed(1)}%`);
    }

    if (warnings.length > 0) {
      logger.warn({ warnings }, 'Performance thresholds exceeded');
      this.emit('thresholdsExceeded', warnings);
    }
  }

  /**
   * Calculate average of an array of numbers
   */
  private calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }

  /**
   * Get current performance metrics
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Add an observer for performance metrics
   */
  public addObserver(observer: (metrics: PerformanceMetrics) => void): void {
    this.observers.add(observer);
  }

  /**
   * Remove an observer
   */
  public removeObserver(observer: (metrics: PerformanceMetrics) => void): void {
    this.observers.delete(observer);
  }

  /**
   * Notify all observers of updated metrics
   */
  private notifyObservers(): void {
    this.observers.forEach(observer => {
      try {
        observer(this.getMetrics());
      } catch (error) {
        logger.error({ error }, 'Error in performance observer');
      }
    });
  }

  /**
   * Emit custom events
   */
  private emit(event: string, data?: any): void {
    // This could be replaced with a proper event emitter
    logger.info({ event, data }, 'Performance event emitted');
  }

  /**
   * Get performance recommendations
   */
  public getRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.metrics.memoryUsage.percentage > 70) {
      recommendations.push('Consider reducing memory usage by cleaning up unused objects');
    }

    if (this.metrics.frameRate.average < 50) {
      recommendations.push('Consider optimizing rendering performance');
    }

    if (this.metrics.networkLatency.average > 500) {
      recommendations.push('Network latency is high, consider optimizing API calls');
    }

    if (this.metrics.renderTime.average > 16) {
      recommendations.push('Render time is high, consider optimizing canvas operations');
    }

    if (this.metrics.errorRate.rate > 0.05) {
      recommendations.push('Error rate is high, review error handling');
    }

    return recommendations;
  }

  /**
   * Generate performance report
   */
  public generateReport(): {
    summary: string;
    metrics: PerformanceMetrics;
    recommendations: string[];
    timestamp: number;
  } {
    const recommendations = this.getRecommendations();
    const summary = recommendations.length > 0 
      ? `Performance issues detected: ${recommendations.length} recommendations`
      : 'Performance is within acceptable limits';

    return {
      summary,
      metrics: this.getMetrics(),
      recommendations,
      timestamp: Date.now(),
    };
  }

  /**
   * Reset all metrics
   */
  public resetMetrics(): void {
    this.metrics = this.initializeMetrics();
    this.frameRateSamples = [];
    this.networkLatencySamples = [];
    this.renderTimeSamples = [];
    this.errorCount = 0;
    this.lastErrorReset = Date.now();
    logger.info('Performance metrics reset');
  }
}

export default PerformanceMonitor; 