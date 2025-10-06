/**
 * Error Tracking Service
 * 
 * This module provides error tracking and reporting functionality.
 * It can be configured to work with external services like Sentry or to use a custom reporting endpoint.
 */

// Define error severity levels
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

// Interface for error context
export interface ErrorContext {
  userId?: string;
  username?: string;
  boardId?: string;
  component?: string;
  action?: string;
  additionalData?: Record<string, any>;
}

// Configuration options for the error tracker
interface ErrorTrackerConfig {
  enabled: boolean;
  captureUnhandledErrors: boolean;
  captureUnhandledRejections: boolean;
  captureConsoleErrors: boolean;
  sampleRate: number; // 0-1 value to determine what percentage of errors to report
  endpoint?: string; // Custom API endpoint for error reporting
  sentryDsn?: string; // Sentry DSN if using Sentry
  environment: 'development' | 'production' | 'test';
}

// Default configuration
const defaultConfig: ErrorTrackerConfig = {
  enabled: process.env.NODE_ENV === 'production',
  captureUnhandledErrors: true,
  captureUnhandledRejections: true,
  captureConsoleErrors: true,
  sampleRate: 1.0, // Report 100% of errors by default
  environment: process.env.NODE_ENV as 'development' | 'production' | 'test',
};

// The actual configuration that will be used
let config: ErrorTrackerConfig = { ...defaultConfig };

// Queue for batching error reports
const errorQueue: Array<{
  error: Error;
  context?: ErrorContext;
  severity: ErrorSeverity;
  timestamp: number;
}> = [];

// Flag to track if global handlers are set up
let handlersInitialized = false;

/**
 * Initialize the error tracking service
 * @param customConfig Configuration options
 */
export const initErrorTracking = (customConfig: Partial<ErrorTrackerConfig> = {}): void => {
  // Merge custom config with defaults
  config = {
    ...defaultConfig,
    ...customConfig,
  };

  // Only set up handlers once
  if (!handlersInitialized && config.enabled) {
    setupGlobalHandlers();
    handlersInitialized = true;
    console.log('Error tracking initialized');
  }
};

/**
 * Set up global error handlers
 */
const setupGlobalHandlers = (): void => {
  if (typeof window === 'undefined') {
    return; // Skip if not in browser environment
  }

  // Handle uncaught errors
  if (config.captureUnhandledErrors) {
    window.addEventListener('error', (event) => {
      captureError(event.error || new Error(event.message), {
        additionalData: {
          lineNumber: event.lineno,
          columnNumber: event.colno,
          filename: event.filename,
        },
      }, ErrorSeverity.ERROR);
      
      // Don't prevent default handling
      return false;
    });
  }

  // Handle unhandled promise rejections
  if (config.captureUnhandledRejections) {
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));
      
      captureError(error, {
        additionalData: {
          type: 'unhandledrejection',
          promise: event.promise,
        },
      }, ErrorSeverity.ERROR);
      
      // Don't prevent default handling
      return false;
    });
  }

  // Override console.error to capture errors logged there
  // ONLY enable in development to prevent production circular reference issues
  if (config.captureConsoleErrors && process.env.NODE_ENV === 'development') {
    const originalConsoleError = console.error;
    const errorLoggingInProgress = new WeakSet();

    console.error = (...args) => {
      // Call the original console.error
      originalConsoleError.apply(console, args);

      // Extract error object if present
      const errorArg = args.find(arg => arg instanceof Error);
      if (errorArg instanceof Error && !errorLoggingInProgress.has(errorArg)) {
        errorLoggingInProgress.add(errorArg);

        try {
          captureError(errorArg, {
            additionalData: {
              consoleArgs: args.map(arg => {
                if (arg instanceof Error) return arg.message;
                try {
                  // Safely stringify to prevent circular reference errors
                  return String(arg);
                } catch {
                  return '[Circular]';
                }
              }),
            },
          }, ErrorSeverity.WARNING);
        } catch (e) {
          // Silent fail to prevent recursive errors
        }
      }
    };
  }
};

/**
 * Capture and report an error
 * @param error The error object
 * @param context Additional context about the error
 * @param severity Error severity level
 */
export const captureError = (
  error: Error,
  context?: ErrorContext,
  severity: ErrorSeverity = ErrorSeverity.ERROR
): void => {
  if (!config.enabled) return;
  
  // Apply sampling - randomly decide whether to report this error
  if (Math.random() > config.sampleRate) return;

  // Add to queue for potential batching
  errorQueue.push({
    error,
    context,
    severity,
    timestamp: Date.now(),
  });

  // Process queue immediately for now
  // In a more sophisticated implementation, we might batch these
  processErrorQueue();
};

/**
 * Process the queued errors
 */
const processErrorQueue = async (): Promise<void> => {
  if (errorQueue.length === 0) return;

  // Take all errors from the queue
  const errors = [...errorQueue];
  errorQueue.length = 0;

  // If we have a Sentry DSN, send to Sentry
  if (config.sentryDsn) {
    try {
      await sendToSentry(errors);
    } catch (e) {
      console.error('Failed to send errors to Sentry:', e);
      // Fall back to custom endpoint if available
      if (config.endpoint) {
        await sendToCustomEndpoint(errors);
      }
    }
  } 
  // Otherwise use custom endpoint if available
  else if (config.endpoint) {
    try {
      await sendToCustomEndpoint(errors);
    } catch (e) {
      console.error('Failed to send errors to custom endpoint:', e);
    }
  } 
  // Log to console as last resort
  else {
    errors.forEach(({ error, context, severity }) => {
      console.group(`[${severity.toUpperCase()}] Error captured`);
      console.error(error);
      if (context) {
        console.info('Context:', context);
      }
      console.groupEnd();
    });
  }
};

/**
 * Send errors to Sentry
 * @param errors Array of error objects with context
 */
const sendToSentry = async (errors: Array<{
  error: Error;
  context?: ErrorContext;
  severity: ErrorSeverity;
  timestamp: number;
}>): Promise<void> => {
  // This is a placeholder - in a real implementation, we would:
  // 1. Import and initialize Sentry
  // 2. Map our severity levels to Sentry's
  // 3. Use Sentry's API to report the errors
  
  console.log('Would send to Sentry:', errors);
  
  // Example implementation (commented out):
  /*
  import * as Sentry from '@sentry/browser';
  
  if (!Sentry.isInitialized()) {
    Sentry.init({
      dsn: config.sentryDsn,
      environment: config.environment,
    });
  }
  
  errors.forEach(({ error, context, severity }) => {
    Sentry.withScope(scope => {
      // Set user info if available
      if (context?.userId) {
        scope.setUser({
          id: context.userId,
          username: context.username,
        });
      }
      
      // Set extra context
      if (context) {
        scope.setExtras(context);
      }
      
      // Set severity
      switch (severity) {
        case ErrorSeverity.INFO:
          scope.setLevel('info');
          break;
        case ErrorSeverity.WARNING:
          scope.setLevel('warning');
          break;
        case ErrorSeverity.ERROR:
          scope.setLevel('error');
          break;
        case ErrorSeverity.CRITICAL:
          scope.setLevel('fatal');
          break;
      }
      
      // Capture the error
      Sentry.captureException(error);
    });
  });
  */
};

/**
 * Send errors to a custom API endpoint
 * @param errors Array of error objects with context
 */
const sendToCustomEndpoint = async (errors: Array<{
  error: Error;
  context?: ErrorContext;
  severity: ErrorSeverity;
  timestamp: number;
}>): Promise<void> => {
  if (!config.endpoint) return;
  
  try {
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        errors: errors.map(({ error, context, severity, timestamp }) => ({
          message: error.message,
          stack: error.stack,
          name: error.name,
          context,
          severity,
          timestamp,
          environment: config.environment,
        })),
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
  } catch (e) {
    // Log but don't re-capture this error to avoid loops
    console.error('Failed to send errors to endpoint:', e);
  }
};

/**
 * Set the user context for error reporting
 * @param userId User ID
 * @param username Username
 */
export const setUserContext = (userId: string, username?: string): void => {
  // This is a placeholder - in a real implementation with Sentry, we would:
  // Sentry.setUser({ id: userId, username });
  
  console.log('Would set user context:', { userId, username });
};

/**
 * Clear the user context
 */
export const clearUserContext = (): void => {
  // This is a placeholder - in a real implementation with Sentry, we would:
  // Sentry.setUser(null);
  
  console.log('Would clear user context');
};

// Initialize with default config
initErrorTracking();
