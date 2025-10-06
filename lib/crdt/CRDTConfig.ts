/**
 * Production-optimized CRDT Configuration
 * Provides environment-specific settings for optimal performance
 */

export interface CRDTProductionConfig {
  // WebSocket Configuration
  websocket: {
    url?: string;
    reconnectAttempts: number;
    reconnectDelay: number;
    maxReconnectDelay: number;
    timeout: number;
    pingInterval: number;
  };

  // Awareness Protocol Settings
  awareness: {
    cursorThrottleMs: number;
    presenceUpdateInterval: number;
    inactiveTimeoutMs: number;
    maxTrailLength: number;
  };

  // Performance Optimization
  performance: {
    maxDocumentSize: number; // Maximum document size in bytes
    gcInterval: number; // Garbage collection interval in ms
    compressionEnabled: boolean;
    batchUpdateSize: number;
  };

  // Offline Support
  offline: {
    enabled: boolean;
    storageQuota: number; // IndexedDB storage quota in MB
    syncOnReconnect: boolean;
    conflictResolution: 'latest' | 'merge';
  };

  // Monitoring & Debugging
  monitoring: {
    enableMetrics: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    performanceTracking: boolean;
  };
}

/**
 * Default configuration for development environment
 */
export const DEVELOPMENT_CONFIG: CRDTProductionConfig = {
  websocket: {
    url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000/api/ws/crdt',
    reconnectAttempts: 5,
    reconnectDelay: 1000,
    maxReconnectDelay: 10000,
    timeout: 5000,
    pingInterval: 30000,
  },
  awareness: {
    cursorThrottleMs: 50, // More responsive in development
    presenceUpdateInterval: 10000, // 10 seconds
    inactiveTimeoutMs: 30000, // 30 seconds
    maxTrailLength: 10,
  },
  performance: {
    maxDocumentSize: 50 * 1024 * 1024, // 50MB
    gcInterval: 60000, // 1 minute
    compressionEnabled: false, // Disabled for easier debugging
    batchUpdateSize: 10,
  },
  offline: {
    enabled: true,
    storageQuota: 100, // 100MB
    syncOnReconnect: true,
    conflictResolution: 'merge',
  },
  monitoring: {
    enableMetrics: true,
    logLevel: 'debug',
    performanceTracking: true,
  },
};

/**
 * Optimized configuration for production environment
 */
export const PRODUCTION_CONFIG: CRDTProductionConfig = {
  websocket: {
    url: process.env.NEXT_PUBLIC_WS_URL || 'wss://ws.whizboard.space/ws/crdt',
    reconnectAttempts: 10,
    reconnectDelay: 2000,
    maxReconnectDelay: 30000,
    timeout: 10000,
    pingInterval: 45000,
  },
  awareness: {
    cursorThrottleMs: 100, // Balanced for performance
    presenceUpdateInterval: 30000, // 30 seconds
    inactiveTimeoutMs: 60000, // 1 minute
    maxTrailLength: 5, // Reduced for performance
  },
  performance: {
    maxDocumentSize: 100 * 1024 * 1024, // 100MB
    gcInterval: 300000, // 5 minutes
    compressionEnabled: true,
    batchUpdateSize: 50, // Larger batches for efficiency
  },
  offline: {
    enabled: true,
    storageQuota: 500, // 500MB
    syncOnReconnect: true,
    conflictResolution: 'latest', // Faster resolution
  },
  monitoring: {
    enableMetrics: true,
    logLevel: 'warn',
    performanceTracking: false, // Disabled for performance
  },
};

/**
 * Configuration for testing environment
 */
export const TEST_CONFIG: CRDTProductionConfig = {
  websocket: {
    url: 'ws://localhost:8080/test-ws',
    reconnectAttempts: 1,
    reconnectDelay: 100,
    maxReconnectDelay: 1000,
    timeout: 1000,
    pingInterval: 5000,
  },
  awareness: {
    cursorThrottleMs: 10, // Very fast for tests
    presenceUpdateInterval: 1000, // 1 second
    inactiveTimeoutMs: 5000, // 5 seconds
    maxTrailLength: 3,
  },
  performance: {
    maxDocumentSize: 1 * 1024 * 1024, // 1MB
    gcInterval: 5000, // 5 seconds
    compressionEnabled: false,
    batchUpdateSize: 1,
  },
  offline: {
    enabled: false, // Disabled for predictable tests
    storageQuota: 10, // 10MB
    syncOnReconnect: false,
    conflictResolution: 'latest',
  },
  monitoring: {
    enableMetrics: false,
    logLevel: 'error',
    performanceTracking: false,
  },
};

/**
 * Get configuration based on current environment
 */
export function getCRDTConfig(): CRDTProductionConfig {
  const env = process.env.NODE_ENV;

  switch (env) {
    case 'production':
      return PRODUCTION_CONFIG;
    case 'test':
      return TEST_CONFIG;
    case 'development':
    default:
      return DEVELOPMENT_CONFIG;
  }
}

/**
 * Override configuration with custom settings
 */
export function createCustomCRDTConfig(
  overrides: Partial<CRDTProductionConfig>
): CRDTProductionConfig {
  const baseConfig = getCRDTConfig();

  return {
    websocket: { ...baseConfig.websocket, ...overrides.websocket },
    awareness: { ...baseConfig.awareness, ...overrides.awareness },
    performance: { ...baseConfig.performance, ...overrides.performance },
    offline: { ...baseConfig.offline, ...overrides.offline },
    monitoring: { ...baseConfig.monitoring, ...overrides.monitoring },
  };
}

/**
 * Validate configuration settings
 */
export function validateCRDTConfig(config: CRDTProductionConfig): string[] {
  const errors: string[] = [];

  // Validate WebSocket settings
  if (config.websocket.reconnectAttempts < 1) {
    errors.push('WebSocket reconnectAttempts must be at least 1');
  }
  if (config.websocket.timeout < 1000) {
    errors.push('WebSocket timeout must be at least 1000ms');
  }

  // Validate awareness settings
  if (config.awareness.cursorThrottleMs < 10) {
    errors.push('Cursor throttle must be at least 10ms');
  }
  if (config.awareness.presenceUpdateInterval < 1000) {
    errors.push('Presence update interval must be at least 1000ms');
  }

  // Validate performance settings
  if (config.performance.maxDocumentSize < 1024 * 1024) {
    errors.push('Max document size must be at least 1MB');
  }
  if (config.performance.batchUpdateSize < 1) {
    errors.push('Batch update size must be at least 1');
  }

  // Validate offline settings
  if (config.offline.storageQuota < 1) {
    errors.push('Storage quota must be at least 1MB');
  }

  return errors;
}