import logger from '@/lib/logger/logger';

export interface ErrorInfo {
  id: string;
  type: 'network' | 'graphql' | 'websocket' | 'canvas' | 'memory' | 'unknown';
  message: string;
  stack?: string;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  context?: Record<string, any>;
}

export interface RecoveryStrategy {
  type: string;
  action: () => Promise<void>;
  priority: number;
  maxAttempts: number;
}

export interface ErrorRecoveryConfig {
  maxRetries: number;
  retryDelay: number;
  exponentialBackoff: boolean;
  autoRecovery: boolean;
  logErrors: boolean;
}

export class ErrorRecoveryManager {
  private config: ErrorRecoveryConfig;
  private errors: Map<string, ErrorInfo> = new Map();
  private recoveryStrategies: Map<string, RecoveryStrategy> = new Map();
  private isRecovering = false;
  private recoveryQueue: Array<{ errorId: string; strategy: RecoveryStrategy }> = [];

  constructor(config: Partial<ErrorRecoveryConfig> = {}) {
    this.config = {
      maxRetries: 3,
      retryDelay: 1000,
      exponentialBackoff: true,
      autoRecovery: true,
      logErrors: true,
      ...config,
    };

    this.setupDefaultStrategies();
  }

  /**
   * Setup default recovery strategies
   */
  private setupDefaultStrategies(): void {
    // Network error recovery
    this.addRecoveryStrategy({
      type: 'network',
      action: async () => {
        logger.info('Attempting network recovery');
        // Implement network recovery logic
        await this.delay(1000);
      },
      priority: 1,
      maxAttempts: 3,
    });

    // WebSocket error recovery
    this.addRecoveryStrategy({
      type: 'websocket',
      action: async () => {
        logger.info('Attempting WebSocket recovery');
        // Implement WebSocket reconnection logic
        await this.delay(2000);
      },
      priority: 2,
      maxAttempts: 5,
    });

    // GraphQL error recovery
    this.addRecoveryStrategy({
      type: 'graphql',
      action: async () => {
        logger.info('Attempting GraphQL recovery');
        // Implement GraphQL client reset logic
        await this.delay(1500);
      },
      priority: 3,
      maxAttempts: 3,
    });

    // Canvas error recovery
    this.addRecoveryStrategy({
      type: 'canvas',
      action: async () => {
        logger.info('Attempting canvas recovery');
        // Implement canvas reset logic
        await this.delay(500);
      },
      priority: 4,
      maxAttempts: 2,
    });

    // Memory error recovery
    this.addRecoveryStrategy({
      type: 'memory',
      action: async () => {
        logger.info('Attempting memory recovery');
        // Implement memory cleanup logic
        await this.delay(1000);
      },
      priority: 5,
      maxAttempts: 1,
    });
  }

  /**
   * Add a recovery strategy
   */
  public addRecoveryStrategy(strategy: RecoveryStrategy): void {
    this.recoveryStrategies.set(strategy.type, strategy);
    logger.debug({ strategyType: strategy.type }, 'Recovery strategy added');
  }

  /**
   * Handle an error
   */
  public handleError(
    type: ErrorInfo['type'],
    message: string,
    context?: Record<string, any>,
    stack?: string
  ): string {
    const errorId = this.generateErrorId();
    const errorInfo: ErrorInfo = {
      id: errorId,
      type,
      message,
      stack,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: this.config.maxRetries,
      context,
    };

    this.errors.set(errorId, errorInfo);

    if (this.config.logErrors) {
      // Don't log WebSocket errors as critical since they're expected
      if (type === 'websocket') {
        logger.warn({ errorInfo }, 'WebSocket error recorded - this is expected if WebSocket endpoint is not available');
      } else {
        logger.error({ errorInfo }, 'Error recorded');
      }
    }

    if (this.config.autoRecovery) {
      this.scheduleRecovery(errorId);
    }

    return errorId;
  }

  /**
   * Schedule recovery for an error
   */
  private scheduleRecovery(errorId: string): void {
    const error = this.errors.get(errorId);
    if (!error) return;

    const strategy = this.recoveryStrategies.get(error.type);
    if (!strategy) {
      logger.warn({ errorType: error.type }, 'No recovery strategy found for error type');
      return;
    }

    this.recoveryQueue.push({ errorId, strategy });
    this.processRecoveryQueue();
  }

  /**
   * Process the recovery queue
   */
  private async processRecoveryQueue(): Promise<void> {
    if (this.isRecovering || this.recoveryQueue.length === 0) {
      return;
    }

    this.isRecovering = true;

    try {
      // Sort by priority (lower number = higher priority)
      this.recoveryQueue.sort((a, b) => a.strategy.priority - b.strategy.priority);

      while (this.recoveryQueue.length > 0) {
        const { errorId, strategy } = this.recoveryQueue.shift()!;
        await this.attemptRecovery(errorId, strategy);
      }
    } finally {
      this.isRecovering = false;
    }
  }

  /**
   * Attempt recovery for an error
   */
  private async attemptRecovery(errorId: string, strategy: RecoveryStrategy): Promise<void> {
    const error = this.errors.get(errorId);
    if (!error) return;

    if (error.retryCount >= strategy.maxAttempts) {
      logger.warn({ errorId, retryCount: error.retryCount }, 'Max retry attempts reached');
      return;
    }

    try {
      logger.info({ errorId, strategyType: strategy.type }, 'Attempting error recovery');
      
      await strategy.action();
      
      // Mark error as resolved
      this.errors.delete(errorId);
      logger.info({ errorId }, 'Error recovery successful');
      
    } catch (recoveryError) {
      error.retryCount++;
      
      logger.error({ 
        errorId, 
        retryCount: error.retryCount, 
        recoveryError: recoveryError.message 
      }, 'Error recovery failed');

      // Schedule retry if under max attempts
      if (error.retryCount < strategy.maxAttempts) {
        const delay = this.calculateRetryDelay(error.retryCount);
        setTimeout(() => {
          this.recoveryQueue.push({ errorId, strategy });
          this.processRecoveryQueue();
        }, delay);
      }
    }
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(retryCount: number): number {
    if (this.config.exponentialBackoff) {
      return this.config.retryDelay * Math.pow(2, retryCount - 1);
    }
    return this.config.retryDelay;
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get error information
   */
  public getError(errorId: string): ErrorInfo | undefined {
    return this.errors.get(errorId);
  }

  /**
   * Get all active errors
   */
  public getActiveErrors(): ErrorInfo[] {
    return Array.from(this.errors.values());
  }

  /**
   * Get errors by type
   */
  public getErrorsByType(type: ErrorInfo['type']): ErrorInfo[] {
    return Array.from(this.errors.values()).filter(error => error.type === type);
  }

  /**
   * Clear resolved errors
   */
  public clearResolvedErrors(): void {
    const now = Date.now();
    const timeout = 5 * 60 * 1000; // 5 minutes

    for (const [errorId, error] of this.errors.entries()) {
      if (now - error.timestamp > timeout) {
        this.errors.delete(errorId);
      }
    }
  }

  /**
   * Force recovery for an error
   */
  public async forceRecovery(errorId: string): Promise<boolean> {
    const error = this.errors.get(errorId);
    if (!error) return false;

    const strategy = this.recoveryStrategies.get(error.type);
    if (!strategy) return false;

    try {
      await strategy.action();
      this.errors.delete(errorId);
      logger.info({ errorId }, 'Forced recovery successful');
      return true;
    } catch (recoveryError) {
      logger.error({ errorId, recoveryError: recoveryError.message }, 'Forced recovery failed');
      return false;
    }
  }

  /**
   * Get recovery statistics
   */
  public getStats(): {
    totalErrors: number;
    errorsByType: Record<string, number>;
    recoveryQueueLength: number;
    isRecovering: boolean;
  } {
    const errorsByType: Record<string, number> = {};
    
    for (const error of this.errors.values()) {
      errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
    }

    return {
      totalErrors: this.errors.size,
      errorsByType,
      recoveryQueueLength: this.recoveryQueue.length,
      isRecovering: this.isRecovering,
    };
  }

  /**
   * Reset the error recovery manager
   */
  public reset(): void {
    this.errors.clear();
    this.recoveryQueue = [];
    this.isRecovering = false;
    logger.info('Error recovery manager reset');
  }

  /**
   * Utility function for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Handle network errors
   */
  public handleNetworkError(message: string, context?: Record<string, any>): string {
    return this.handleError('network', message, context);
  }

  /**
   * Handle WebSocket errors
   */
  public handleWebSocketError(message: string, context?: Record<string, any>): string {
    return this.handleError('websocket', message, context);
  }

  /**
   * Handle GraphQL errors
   */
  public handleGraphQLError(message: string, context?: Record<string, any>): string {
    return this.handleError('graphql', message, context);
  }

  /**
   * Handle canvas errors
   */
  public handleCanvasError(message: string, context?: Record<string, any>): string {
    return this.handleError('canvas', message, context);
  }

  /**
   * Handle memory errors
   */
  public handleMemoryError(message: string, context?: Record<string, any>): string {
    return this.handleError('memory', message, context);
  }

  /**
   * Check if there are any critical errors
   */
  public hasCriticalErrors(): boolean {
    const criticalTypes: ErrorInfo['type'][] = ['network']; // Removed 'websocket' since it's optional
    return this.getActiveErrors().some(error => criticalTypes.includes(error.type));
  }

  /**
   * Get error summary for reporting
   */
  public getErrorSummary(): {
    totalErrors: number;
    criticalErrors: number;
    errorTypes: Record<string, number>;
    oldestError: number;
    newestError: number;
  } {
    const errors = this.getActiveErrors();
    const errorTypes: Record<string, number> = {};
    let oldestError = Date.now();
    let newestError = 0;

    for (const error of errors) {
      errorTypes[error.type] = (errorTypes[error.type] || 0) + 1;
      oldestError = Math.min(oldestError, error.timestamp);
      newestError = Math.max(newestError, error.timestamp);
    }

    const criticalErrors = errors.filter(error => 
      ['network'].includes(error.type) // Removed 'websocket' since it's optional
    ).length;

    return {
      totalErrors: errors.length,
      criticalErrors,
      errorTypes,
      oldestError,
      newestError,
    };
  }
}

export default ErrorRecoveryManager; 