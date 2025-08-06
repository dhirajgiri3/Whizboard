// Phase 1 Components - Core Infrastructure & Bug Fixes
export { default as PerformanceMonitor } from '../performance/PerformanceMonitor';
export { default as MemoryManager } from '../performance/MemoryManager';
export { default as DataRecoveryManager } from '../recovery/DataRecoveryManager';
export { default as ErrorRecoveryManager } from '../recovery/ErrorRecoveryManager';
export { default as WebSocketClient } from '../websocket/WebSocketClient';

// Re-export types for convenience
export type { PerformanceMetrics, PerformanceThresholds } from '../performance/PerformanceMonitor';
export type { ErrorInfo, RecoveryStrategy } from '../recovery/ErrorRecoveryManager'; 