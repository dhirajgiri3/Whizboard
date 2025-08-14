// Performance optimization utilities

// Debounce function to limit API calls
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function to limit frequency
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Batch multiple calls into a single request
export class CallBatcher {
  private batch: Array<{ id: string; callback: () => void }> = [];
  private timer: NodeJS.Timeout | null = null;
  private maxBatchSize: number;
  private maxWaitTime: number;

  constructor(maxBatchSize = 5, maxWaitTime = 200) {
    this.maxBatchSize = maxBatchSize;
    this.maxWaitTime = maxWaitTime;
  }

  add(callback: () => void, id?: string): void {
    const requestId = id || `req-${Date.now()}-${Math.random()}`;
    this.batch.push({ id: requestId, callback });

    // Clear existing timer
    if (this.timer) {
      clearTimeout(this.timer);
    }

    // Process immediately if batch is full
    if (this.batch.length >= this.maxBatchSize) {
      this.processBatch();
      return;
    }

    // Set timer to process batch after wait time
    this.timer = setTimeout(() => {
      this.processBatch();
    }, this.maxWaitTime);
  }

  private processBatch(): void {
    if (this.batch.length === 0) return;

    // Execute all callbacks in the batch
    this.batch.forEach(({ callback }) => {
      try {
        callback();
      } catch (error) {
        console.error('Error in batched callback:', error);
      }
    });

    // Clear the batch
    this.batch = [];
    this.timer = null;
  }

  clear(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.batch = [];
  }
}

// Optimized timestamp updater
export class TimestampOptimizer {
  private batcher: CallBatcher;
  private lastUpdate: number = 0;
  private minInterval: number;

  constructor(updateFunction: (boardId: string) => Promise<void>, boardId: string, minInterval = 1000) {
    this.minInterval = minInterval;
    this.batcher = new CallBatcher(3, 500); // Batch up to 3 updates, wait 500ms
  }

  update(boardId: string, updateFunction: (boardId: string) => Promise<void>): void {
    const now = Date.now();
    
    // Skip if too soon since last update
    if (now - this.lastUpdate < this.minInterval) {
      return;
    }

    this.batcher.add(() => {
      updateFunction(boardId).then(() => {
        this.lastUpdate = Date.now();
      }).catch(console.error);
    });
  }

  forceUpdate(boardId: string, updateFunction: (boardId: string) => Promise<void>): void {
    this.lastUpdate = 0; // Reset timer
    this.update(boardId, updateFunction);
  }
}
