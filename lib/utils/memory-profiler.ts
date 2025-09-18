/**
 * Memory Profiler Utility
 * 
 * This utility provides tools for monitoring memory usage in the application
 * to help identify and debug memory leaks.
 */

// Interface for memory usage information
interface MemoryInfo {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
  timestamp: number;
}

// Memory usage history
const memoryHistory: MemoryInfo[] = [];
const MAX_HISTORY_LENGTH = 100;

// Check if performance.memory is available (Chrome only)
const isMemoryAPIAvailable = (): boolean => {
  return typeof performance !== 'undefined' && 
         'memory' in performance && 
         performance.memory !== undefined;
};

/**
 * Take a memory snapshot and add it to history
 * @returns Memory info or null if not available
 */
export const takeMemorySnapshot = (): MemoryInfo | null => {
  if (!isMemoryAPIAvailable()) {
    console.warn('Performance.memory API is not available in this browser');
    return null;
  }

  // Cast to any since TypeScript doesn't recognize memory property
  const memory = (performance as any).memory;
  
  const snapshot: MemoryInfo = {
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
    totalJSHeapSize: memory.totalJSHeapSize,
    usedJSHeapSize: memory.usedJSHeapSize,
    timestamp: Date.now()
  };
  
  // Add to history and maintain max length
  memoryHistory.push(snapshot);
  if (memoryHistory.length > MAX_HISTORY_LENGTH) {
    memoryHistory.shift();
  }
  
  return snapshot;
};

/**
 * Get memory usage history
 * @returns Array of memory snapshots
 */
export const getMemoryHistory = (): MemoryInfo[] => {
  return [...memoryHistory];
};

/**
 * Format bytes to human-readable string
 * @param bytes Number of bytes
 * @returns Formatted string (e.g., "45.5 MB")
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Calculate memory growth rate
 * @returns Growth rate in bytes per second or null if not enough data
 */
export const calculateMemoryGrowthRate = (): number | null => {
  if (memoryHistory.length < 2) {
    return null;
  }
  
  const first = memoryHistory[0];
  const last = memoryHistory[memoryHistory.length - 1];
  
  const memoryDiff = last.usedJSHeapSize - first.usedJSHeapSize;
  const timeDiff = (last.timestamp - first.timestamp) / 1000; // in seconds
  
  if (timeDiff <= 0) {
    return null;
  }
  
  return memoryDiff / timeDiff;
};

/**
 * Check if there's a potential memory leak based on growth rate
 * @param threshold Growth rate threshold in bytes per second
 * @returns Object with leak detection results
 */
export const detectMemoryLeak = (threshold = 1000000): { 
  isLeaking: boolean; 
  growthRate: number | null;
  growthRateFormatted: string | null;
} => {
  const growthRate = calculateMemoryGrowthRate();
  
  if (growthRate === null) {
    return { 
      isLeaking: false, 
      growthRate: null,
      growthRateFormatted: null
    };
  }
  
  return {
    isLeaking: growthRate > threshold,
    growthRate,
    growthRateFormatted: `${formatBytes(growthRate)}/s`
  };
};

/**
 * Start periodic memory monitoring
 * @param intervalMs Interval between snapshots in milliseconds
 * @param callback Optional callback function to run on each snapshot
 * @returns Function to stop monitoring
 */
export const startMemoryMonitoring = (
  intervalMs = 5000,
  callback?: (snapshot: MemoryInfo | null) => void
): () => void => {
  if (!isMemoryAPIAvailable()) {
    console.warn('Performance.memory API is not available in this browser');
    return () => {};
  }
  
  const intervalId = setInterval(() => {
    const snapshot = takeMemorySnapshot();
    if (callback && snapshot) {
      callback(snapshot);
    }
    
    // Check for potential leaks
    const leakCheck = detectMemoryLeak();
    if (leakCheck.isLeaking) {
      console.warn(
        `Potential memory leak detected! Memory growing at ${leakCheck.growthRateFormatted}`
      );
    }
  }, intervalMs);
  
  return () => clearInterval(intervalId);
};

// Memory monitoring utilities are exported above
// The MemoryMonitor component is in a separate file to avoid circular dependencies
