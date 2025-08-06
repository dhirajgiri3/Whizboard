import logger from '@/lib/logger/logger';

export interface MemoryInfo {
  used: number;
  total: number;
  limit: number;
  percentage: number;
}

export interface CanvasElement {
  id: string;
  type: string;
  data: any;
  visible: boolean;
  inViewport: boolean;
  lastAccessed: number;
}

export interface MemoryManagerConfig {
  maxElementsInMemory: number;
  viewportBuffer: number; // Extra elements to keep in memory around viewport
  cleanupInterval: number;
  memoryThreshold: number; // Percentage of memory usage to trigger cleanup
  elementTimeout: number; // Time in ms before considering element for cleanup
}

export class MemoryManager {
  private config: MemoryManagerConfig;
  private elements: Map<string, CanvasElement> = new Map();
  private viewportBounds: { x: number; y: number; width: number; height: number } | null = null;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private isMonitoring = false;

  constructor(config: Partial<MemoryManagerConfig> = {}) {
    this.config = {
      maxElementsInMemory: 1000,
      viewportBuffer: 50,
      cleanupInterval: 30000, // 30 seconds
      memoryThreshold: 80, // 80% memory usage
      elementTimeout: 300000, // 5 minutes
      ...config,
    };
  }

  /**
   * Start memory monitoring
   */
  public startMonitoring(): void {
    if (this.isMonitoring) {
      logger.warn('Memory monitoring already started');
      return;
    }

    this.isMonitoring = true;
    this.cleanupTimer = setInterval(() => {
      this.performCleanup();
    }, this.config.cleanupInterval);

    logger.info('Memory monitoring started');
  }

  /**
   * Stop memory monitoring
   */
  public stopMonitoring(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.isMonitoring = false;
    logger.info('Memory monitoring stopped');
  }

  /**
   * Add an element to memory management
   */
  public addElement(id: string, type: string, data: any): void {
    const element: CanvasElement = {
      id,
      type,
      data,
      visible: true,
      inViewport: false,
      lastAccessed: Date.now(),
    };

    this.elements.set(id, element);
    this.checkMemoryLimit();
  }

  /**
   * Update element visibility based on viewport
   */
  public updateViewport(x: number, y: number, width: number, height: number): void {
    this.viewportBounds = { x, y, width, height };
    
    // Update which elements are in viewport
    this.elements.forEach((element) => {
      element.inViewport = this.isElementInViewport(element);
      if (element.inViewport) {
        element.lastAccessed = Date.now();
      }
    });
  }

  /**
   * Mark element as accessed
   */
  public markElementAccessed(id: string): void {
    const element = this.elements.get(id);
    if (element) {
      element.lastAccessed = Date.now();
    }
  }

  /**
   * Remove element from memory management
   */
  public removeElement(id: string): void {
    this.elements.delete(id);
  }

  /**
   * Get elements that should be rendered (in viewport + buffer)
   */
  public getVisibleElements(): CanvasElement[] {
    const visibleElements: CanvasElement[] = [];
    
    this.elements.forEach((element) => {
      if (element.visible && (element.inViewport || this.isElementNearViewport(element))) {
        visibleElements.push(element);
      }
    });

    return visibleElements;
  }

  /**
   * Check if element is in viewport
   */
  private isElementInViewport(element: CanvasElement): boolean {
    if (!this.viewportBounds) return true;

    // This is a simplified check - in a real implementation,
    // you'd need to check the actual element bounds
    const elementBounds = this.getElementBounds(element);
    if (!elementBounds) return true;

    return (
      elementBounds.x < this.viewportBounds.x + this.viewportBounds.width &&
      elementBounds.x + elementBounds.width > this.viewportBounds.x &&
      elementBounds.y < this.viewportBounds.y + this.viewportBounds.height &&
      elementBounds.y + elementBounds.height > this.viewportBounds.y
    );
  }

  /**
   * Check if element is near viewport (within buffer)
   */
  private isElementNearViewport(element: CanvasElement): boolean {
    if (!this.viewportBounds) return true;

    const elementBounds = this.getElementBounds(element);
    if (!elementBounds) return true;

    const buffer = this.config.viewportBuffer;
    return (
      elementBounds.x < this.viewportBounds.x + this.viewportBounds.width + buffer &&
      elementBounds.x + elementBounds.width > this.viewportBounds.x - buffer &&
      elementBounds.y < this.viewportBounds.y + this.viewportBounds.height + buffer &&
      elementBounds.y + elementBounds.height > this.viewportBounds.y - buffer
    );
  }

  /**
   * Get element bounds (simplified - should be implemented based on element type)
   */
  private getElementBounds(element: CanvasElement): { x: number; y: number; width: number; height: number } | null {
    // This is a simplified implementation
    // In a real implementation, you'd extract bounds from element.data based on element.type
    if (element.data && element.data.x !== undefined && element.data.y !== undefined) {
      return {
        x: element.data.x,
        y: element.data.y,
        width: element.data.width || 100,
        height: element.data.height || 100,
      };
    }
    return null;
  }

  /**
   * Check memory limit and trigger cleanup if needed
   */
  private checkMemoryLimit(): void {
    if (this.elements.size > this.config.maxElementsInMemory) {
      this.performCleanup();
    }
  }

  /**
   * Perform memory cleanup
   */
  private performCleanup(): void {
    const memoryInfo = this.getMemoryInfo();
    
    // Check if we need to clean up based on memory usage
    if (memoryInfo.percentage > this.config.memoryThreshold) {
      this.cleanupOldElements();
    }

    // Always clean up elements that haven't been accessed recently
    this.cleanupInactiveElements();
  }

  /**
   * Clean up old elements that haven't been accessed recently
   */
  private cleanupInactiveElements(): void {
    const now = Date.now();
    const elementsToRemove: string[] = [];

    this.elements.forEach((element, id) => {
      if (!element.inViewport && 
          now - element.lastAccessed > this.config.elementTimeout) {
        elementsToRemove.push(id);
      }
    });

    elementsToRemove.forEach(id => {
      this.elements.delete(id);
    });

    if (elementsToRemove.length > 0) {
      logger.info({ removedCount: elementsToRemove.length }, 'Cleaned up inactive elements');
    }
  }

  /**
   * Clean up old elements when memory is high
   */
  private cleanupOldElements(): void {
    const elementsArray = Array.from(this.elements.entries());
    
    // Sort by last accessed time (oldest first)
    elementsArray.sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);

    // Remove oldest elements that are not in viewport
    const elementsToRemove = elementsArray
      .filter(([, element]) => !element.inViewport)
      .slice(0, Math.floor(this.elements.size * 0.2)); // Remove 20% of elements

    elementsToRemove.forEach(([id]) => {
      this.elements.delete(id);
    });

    if (elementsToRemove.length > 0) {
      logger.info({ removedCount: elementsToRemove.length }, 'Cleaned up old elements due to memory pressure');
    }
  }

  /**
   * Get current memory information
   */
  public getMemoryInfo(): MemoryInfo {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
      };
    }

    // Fallback if performance.memory is not available
    return {
      used: 0,
      total: 0,
      limit: 0,
      percentage: 0,
    };
  }

  /**
   * Get memory manager statistics
   */
  public getStats(): {
    totalElements: number;
    visibleElements: number;
    viewportElements: number;
    memoryInfo: MemoryInfo;
  } {
    const visibleElements = this.getVisibleElements();
    const viewportElements = Array.from(this.elements.values()).filter(el => el.inViewport);

    return {
      totalElements: this.elements.size,
      visibleElements: visibleElements.length,
      viewportElements: viewportElements.length,
      memoryInfo: this.getMemoryInfo(),
    };
  }

  /**
   * Optimize memory usage
   */
  public optimize(): void {
    logger.info('Starting memory optimization');
    
    // Perform cleanup
    this.performCleanup();
    
    // Suggest garbage collection if available
    if ('gc' in window) {
      (window as any).gc();
    }
    
    logger.info('Memory optimization completed');
  }

  /**
   * Clear all elements
   */
  public clear(): void {
    this.elements.clear();
    logger.info('Memory manager cleared');
  }

  /**
   * Get element by ID
   */
  public getElement(id: string): CanvasElement | undefined {
    const element = this.elements.get(id);
    if (element) {
      element.lastAccessed = Date.now();
    }
    return element;
  }

  /**
   * Update element data
   */
  public updateElement(id: string, data: any): void {
    const element = this.elements.get(id);
    if (element) {
      element.data = data;
      element.lastAccessed = Date.now();
    }
  }

  /**
   * Set element visibility
   */
  public setElementVisibility(id: string, visible: boolean): void {
    const element = this.elements.get(id);
    if (element) {
      element.visible = visible;
      element.lastAccessed = Date.now();
    }
  }
}

export default MemoryManager; 