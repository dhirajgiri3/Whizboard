"use client";

import React, { useEffect, useRef, useState } from 'react';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { 
  PerformanceMonitor, 
  MemoryManager, 
  DataRecoveryManager, 
  ErrorRecoveryManager, 
  WebSocketClient,
  type PerformanceMetrics 
} from '@/lib/phase1';
import logger from '@/lib/logger/logger';
import { toast } from 'sonner';
import { AlertCircle, Activity, Database, Wifi, Zap } from 'lucide-react';

interface Phase1IntegrationProps {
  children: React.ReactNode;
  boardId?: string;
  userId?: string;
}

interface SystemStatus {
  performance: 'good' | 'warning' | 'critical';
  memory: 'good' | 'warning' | 'critical';
  network: 'good' | 'warning' | 'critical';
  websocket: 'good' | 'warning' | 'critical';
  recovery: 'good' | 'warning' | 'critical';
}

export default function Phase1Integration({ children, boardId, userId }: Phase1IntegrationProps) {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    performance: 'good',
    memory: 'good',
    network: 'good',
    websocket: 'good',
    recovery: 'good',
  });

  const [showStatus, setShowStatus] = useState(false);
  const [lastMetrics, setLastMetrics] = useState<PerformanceMetrics | null>(null);

  // Initialize managers
  const performanceMonitor = useRef<PerformanceMonitor>();
  const memoryManager = useRef<MemoryManager>();
  const dataRecoveryManager = useRef<DataRecoveryManager>();
  const errorRecoveryManager = useRef<ErrorRecoveryManager>();
  const webSocketClient = useRef<WebSocketClient>();

  useEffect(() => {
    // Initialize performance monitor
    performanceMonitor.current = new PerformanceMonitor({
      memoryUsagePercentage: 80,
      frameRateMin: 30,
      networkLatencyMax: 1000,
      renderTimeMax: 16,
      errorRateMax: 0.1,
    });

    // Initialize memory manager
    memoryManager.current = new MemoryManager({
      maxElementsInMemory: 1000,
      viewportBuffer: 50,
      cleanupInterval: 30000,
      memoryThreshold: 80,
      elementTimeout: 300000,
    });

    // Initialize data recovery manager
    dataRecoveryManager.current = new DataRecoveryManager({
      autoSaveInterval: 30000,
      maxLocalStorageSize: 5 * 1024 * 1024,
      maxRecoveryVersions: 10,
      compressionEnabled: true,
    });

    // Initialize error recovery manager
    errorRecoveryManager.current = new ErrorRecoveryManager({
      maxRetries: 3,
      retryDelay: 1000,
      exponentialBackoff: true,
      autoRecovery: true,
      logErrors: true,
    });

    // Initialize WebSocket client
    webSocketClient.current = new WebSocketClient({
      url: `${process.env.NODE_ENV === 'production' ? 'wss' : 'ws'}://${window.location.host}/api/graphql/ws`,
      reconnectAttempts: 5,
      reconnectInterval: 1000,
      maxReconnectInterval: 30000,
      heartbeatInterval: 30000,
      heartbeatTimeout: 10000,
    });

    // Start monitoring
    performanceMonitor.current.startMonitoring();
    memoryManager.current.startMonitoring();

    // Start auto-save if boardId is provided
    if (boardId) {
      dataRecoveryManager.current.startAutoSave(boardId);
    }

    // Connect WebSocket (optional - will work without it)
    webSocketClient.current.connect().catch((error) => {
      logger.warn({ error }, 'WebSocket connection failed - this is expected if WebSocket endpoint is not available');
      // Don't treat this as a critical error since WebSocket is optional
      setSystemStatus(prev => ({ ...prev, websocket: 'warning' }));
    });

    // Setup event listeners
    setupEventListeners();

    logger.info('Phase 1 integration initialized');

    return () => {
      // Cleanup
      performanceMonitor.current?.stopMonitoring();
      memoryManager.current?.stopMonitoring();
      dataRecoveryManager.current?.stopAutoSave();
      webSocketClient.current?.disconnect();
      logger.info('Phase 1 integration cleaned up');
    };
  }, [boardId]);

  const setupEventListeners = () => {
    // Performance monitoring
    performanceMonitor.current?.addObserver((metrics) => {
      setLastMetrics(metrics);
      updateSystemStatus(metrics);
    });

    // WebSocket events
    webSocketClient.current?.on('connected', () => {
      logger.info('WebSocket connected');
      setSystemStatus(prev => ({ ...prev, websocket: 'good' }));
    });

    webSocketClient.current?.on('disconnected', () => {
      logger.warn('WebSocket disconnected - this is expected if WebSocket endpoint is not available');
      setSystemStatus(prev => ({ ...prev, websocket: 'warning' }));
    });

    webSocketClient.current?.on('error', (error) => {
      logger.warn({ error }, 'WebSocket error - this is expected if WebSocket endpoint is not available');
      setSystemStatus(prev => ({ ...prev, websocket: 'warning' }));
      // Don't treat WebSocket errors as critical since it's optional
    });

    webSocketClient.current?.on('maxReconnectAttemptsReached', () => {
      logger.warn('WebSocket max reconnection attempts reached - this is expected if WebSocket endpoint is not available');
      setSystemStatus(prev => ({ ...prev, websocket: 'warning' }));
      // Don't show error toast since WebSocket is optional
    });

    // Error recovery events
    errorRecoveryManager.current?.addRecoveryStrategy({
      type: 'websocket',
      action: async () => {
        logger.info('Attempting WebSocket reconnection');
        await webSocketClient.current?.reconnect();
      },
      priority: 1,
      maxAttempts: 5,
    });
  };

  const updateSystemStatus = (metrics: PerformanceMetrics) => {
    const newStatus: SystemStatus = {
      performance: 'good',
      memory: 'good',
      network: 'good',
      websocket: systemStatus.websocket,
      recovery: 'good',
    };

    // Check memory usage
    if (metrics.memoryUsage.percentage > 90) {
      newStatus.memory = 'critical';
    } else if (metrics.memoryUsage.percentage > 70) {
      newStatus.memory = 'warning';
    }

    // Check frame rate
    if (metrics.frameRate.average < 20) {
      newStatus.performance = 'critical';
    } else if (metrics.frameRate.average < 40) {
      newStatus.performance = 'warning';
    }

    // Check network latency
    if (metrics.networkLatency.average > 2000) {
      newStatus.network = 'critical';
    } else if (metrics.networkLatency.average > 500) {
      newStatus.network = 'warning';
    }

    // Check error rate
    if (metrics.errorRate.rate > 0.2) {
      newStatus.recovery = 'critical';
    } else if (metrics.errorRate.rate > 0.05) {
      newStatus.recovery = 'warning';
    }

    setSystemStatus(newStatus);

    // Show warnings for critical issues (only in production or when explicitly enabled)
    if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_SHOW_PERFORMANCE_WARNINGS === 'true') {
      if (newStatus.memory === 'critical') {
        toast.error('High memory usage detected. Consider refreshing the page.');
      }
      if (newStatus.performance === 'critical') {
        toast.error('Performance issues detected. Consider closing other tabs.');
      }
      if (newStatus.network === 'critical') {
        toast.error('Network issues detected. Check your connection.');
      }
    }
  };

  const getStatusIcon = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good':
        return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      case 'warning':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full" />;
      case 'critical':
        return <div className="w-2 h-2 bg-red-500 rounded-full" />;
    }
  };

  const getStatusColor = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
    }
  };

  return (
    <ErrorBoundary>
      <div className="relative">
        {children}
        
        {/* System Status Indicator */}
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setShowStatus(!showStatus)}
            className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-lg p-3 shadow-lg hover:bg-white transition-colors"
            title="System Status"
          >
            <Activity className="w-5 h-5 text-slate-600" />
          </button>

          {showStatus && (
            <div className="absolute bottom-full right-0 mb-2 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg p-4 shadow-xl min-w-64">
              <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                System Status
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {getStatusIcon(systemStatus.performance)}
                    Performance
                  </span>
                  <span className={getStatusColor(systemStatus.performance)}>
                    {lastMetrics?.frameRate.average.toFixed(1)} FPS
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {getStatusIcon(systemStatus.memory)}
                    Memory
                  </span>
                  <span className={getStatusColor(systemStatus.memory)}>
                    {lastMetrics?.memoryUsage.percentage.toFixed(1)}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {getStatusIcon(systemStatus.network)}
                    Network
                  </span>
                  <span className={getStatusColor(systemStatus.network)}>
                    {lastMetrics?.networkLatency.average.toFixed(0)}ms
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {getStatusIcon(systemStatus.websocket)}
                    WebSocket
                  </span>
                  <span className={getStatusColor(systemStatus.websocket)}>
                    {systemStatus.websocket === 'good' ? 'Connected' : 'Optional'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {getStatusIcon(systemStatus.recovery)}
                    Recovery
                  </span>
                  <span className={getStatusColor(systemStatus.recovery)}>
                    {lastMetrics?.errorRate.rate.toFixed(3)}/s
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-200">
                <button
                  onClick={() => {
                    memoryManager.current?.optimize();
                    performanceMonitor.current?.resetMetrics();
                    toast.success('System optimization completed');
                  }}
                  className="w-full text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                >
                  Optimize System
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
} 