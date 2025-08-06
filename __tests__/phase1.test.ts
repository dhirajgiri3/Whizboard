import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import PerformanceMonitor from '@/lib/performance/PerformanceMonitor';
import MemoryManager from '@/lib/performance/MemoryManager';
import DataRecoveryManager from '@/lib/recovery/DataRecoveryManager';
import ErrorRecoveryManager from '@/lib/recovery/ErrorRecoveryManager';

describe('Phase 1 Components', () => {
  let performanceMonitor: PerformanceMonitor;
  let memoryManager: MemoryManager;
  let dataRecoveryManager: DataRecoveryManager;
  let errorRecoveryManager: ErrorRecoveryManager;

  beforeEach(() => {
    performanceMonitor = new PerformanceMonitor();
    memoryManager = new MemoryManager();
    dataRecoveryManager = new DataRecoveryManager();
    errorRecoveryManager = new ErrorRecoveryManager();
  });

  afterEach(() => {
    performanceMonitor.stopMonitoring();
    memoryManager.stopMonitoring();
    dataRecoveryManager.stopAutoSave();
  });

  describe('PerformanceMonitor', () => {
    it('should initialize with default metrics', () => {
      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toBeDefined();
      expect(metrics.memoryUsage).toBeDefined();
      expect(metrics.frameRate).toBeDefined();
      expect(metrics.networkLatency).toBeDefined();
      expect(metrics.renderTime).toBeDefined();
      expect(metrics.errorRate).toBeDefined();
    });

    it('should record network latency', () => {
      performanceMonitor.recordNetworkLatency(100);
      const metrics = performanceMonitor.getMetrics();
      expect(metrics.networkLatency.samples).toBe(1);
    });

    it('should record render time', () => {
      performanceMonitor.recordRenderTime(16);
      const metrics = performanceMonitor.getMetrics();
      expect(metrics.renderTime.samples).toBe(1);
    });

    it('should record errors', () => {
      performanceMonitor.recordError();
      const metrics = performanceMonitor.getMetrics();
      expect(metrics.errorRate.total).toBeGreaterThan(0);
    });
  });

  describe('MemoryManager', () => {
    it('should add elements to memory management', () => {
      memoryManager.addElement('test-1', 'line', { x: 0, y: 0, width: 100, height: 100 });
      const stats = memoryManager.getStats();
      expect(stats.totalElements).toBe(1);
    });

    it('should get visible elements', () => {
      memoryManager.addElement('test-1', 'line', { x: 0, y: 0, width: 100, height: 100 });
      const visibleElements = memoryManager.getVisibleElements();
      expect(visibleElements).toHaveLength(1);
    });

    it('should update viewport', () => {
      memoryManager.updateViewport(0, 0, 800, 600);
      const stats = memoryManager.getStats();
      expect(stats).toBeDefined();
    });

    it('should get memory info', () => {
      const memoryInfo = memoryManager.getMemoryInfo();
      expect(memoryInfo).toBeDefined();
      expect(memoryInfo.used).toBeDefined();
      expect(memoryInfo.total).toBeDefined();
      expect(memoryInfo.limit).toBeDefined();
      expect(memoryInfo.percentage).toBeDefined();
    });
  });

  describe('DataRecoveryManager', () => {
    it('should save and load board state', () => {
      const boardId = 'test-board';
      const state = {
        elements: [{ id: '1', type: 'line', data: { x: 0, y: 0 } }],
        history: [],
        historyIndex: 0,
      };

      const saved = dataRecoveryManager.saveBoardState(boardId, state);
      expect(saved).toBe(true);

      const loaded = dataRecoveryManager.loadBoardState(boardId);
      expect(loaded).toBeDefined();
      expect(loaded?.id).toBe(boardId);
    });

    it('should check for recovery data', () => {
      const boardId = 'test-board';
      const hasData = dataRecoveryManager.hasRecoveryData(boardId);
      expect(typeof hasData).toBe('boolean');
    });

    it('should get recovery info', () => {
      const boardId = 'test-board';
      const info = dataRecoveryManager.getRecoveryInfo(boardId);
      expect(info).toBeDefined();
      expect(info.exists).toBeDefined();
    });

    it('should validate board state', () => {
      const validState = {
        id: 'test-board',
        elements: [],
        history: [],
        historyIndex: 0,
        lastSaved: Date.now(),
        version: 1,
      };

      const validation = dataRecoveryManager.validateBoardState(validState);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('ErrorRecoveryManager', () => {
    it('should handle errors', () => {
      const errorId = errorRecoveryManager.handleError('network', 'Connection lost');
      expect(errorId).toBeDefined();
    });

    it('should handle specific error types', () => {
      const networkErrorId = errorRecoveryManager.handleNetworkError('Network timeout');
      const websocketErrorId = errorRecoveryManager.handleWebSocketError('Connection closed');
      const graphqlErrorId = errorRecoveryManager.handleGraphQLError('Query failed');

      expect(networkErrorId).toBeDefined();
      expect(websocketErrorId).toBeDefined();
      expect(graphqlErrorId).toBeDefined();
    });

    it('should get active errors', () => {
      errorRecoveryManager.handleError('network', 'Test error');
      const activeErrors = errorRecoveryManager.getActiveErrors();
      expect(activeErrors.length).toBeGreaterThan(0);
    });

    it('should get errors by type', () => {
      errorRecoveryManager.handleNetworkError('Network error');
      const networkErrors = errorRecoveryManager.getErrorsByType('network');
      expect(networkErrors.length).toBeGreaterThan(0);
    });

    it('should get recovery statistics', () => {
      const stats = errorRecoveryManager.getStats();
      expect(stats).toBeDefined();
      expect(stats.totalErrors).toBeDefined();
      expect(stats.errorsByType).toBeDefined();
      expect(stats.recoveryQueueLength).toBeDefined();
      expect(stats.isRecovering).toBeDefined();
    });

    it('should check for critical errors', () => {
      const hasCritical = errorRecoveryManager.hasCriticalErrors();
      expect(typeof hasCritical).toBe('boolean');
    });

    it('should get error summary', () => {
      const summary = errorRecoveryManager.getErrorSummary();
      expect(summary).toBeDefined();
      expect(summary.totalErrors).toBeDefined();
      expect(summary.criticalErrors).toBeDefined();
      expect(summary.errorTypes).toBeDefined();
    });
  });

  describe('Integration', () => {
    it('should work together without conflicts', () => {
      // Test that all components can be used together
      expect(performanceMonitor).toBeDefined();
      expect(memoryManager).toBeDefined();
      expect(dataRecoveryManager).toBeDefined();
      expect(errorRecoveryManager).toBeDefined();

      // Test basic functionality
      performanceMonitor.recordNetworkLatency(100);
      memoryManager.addElement('test', 'line', { x: 0, y: 0 });
      dataRecoveryManager.saveBoardState('test-board', { elements: [] });
      errorRecoveryManager.handleNetworkError('Test error');

      // All should still be working
      expect(performanceMonitor.getMetrics()).toBeDefined();
      expect(memoryManager.getStats()).toBeDefined();
      expect(errorRecoveryManager.getStats()).toBeDefined();
    });
  });
}); 