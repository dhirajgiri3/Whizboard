'use client';

import { useEffect, useCallback } from 'react';
import { 
  captureError, 
  ErrorSeverity, 
  ErrorContext, 
  setUserContext,
  clearUserContext
} from '@/lib/utils/error-tracking';

interface UseErrorTrackingOptions {
  componentName?: string;
  userId?: string;
  username?: string;
  boardId?: string;
}

/**
 * Hook for tracking errors within components
 * @param options Configuration options
 * @returns Object with error tracking methods
 */
export function useErrorTracking(options: UseErrorTrackingOptions = {}) {
  const { componentName, userId, username, boardId } = options;

  // Set user context when the hook is initialized
  useEffect(() => {
    if (userId) {
      setUserContext(userId, username);
    }

    return () => {
      // Clear user context when component unmounts
      if (userId) {
        clearUserContext();
      }
    };
  }, [userId, username]);

  /**
   * Track an error with the given context
   */
  const trackError = useCallback((
    error: Error | string,
    additionalContext: Partial<ErrorContext> = {},
    severity: ErrorSeverity = ErrorSeverity.ERROR
  ) => {
    // Convert string to Error if needed
    const errorObj = typeof error === 'string' ? new Error(error) : error;

    // Combine component context with additional context
    const context: ErrorContext = {
      component: componentName,
      userId,
      username,
      boardId,
      ...additionalContext
    };

    // Filter out undefined values
    Object.keys(context).forEach(key => {
      if (context[key as keyof ErrorContext] === undefined) {
        delete context[key as keyof ErrorContext];
      }
    });

    // Capture the error
    captureError(errorObj, context, severity);
  }, [componentName, userId, username, boardId]);

  /**
   * Wrap a function to catch and report any errors
   */
  const withErrorTracking = useCallback(<T extends (...args: any[]) => any>(
    fn: T,
    actionName?: string,
    severity: ErrorSeverity = ErrorSeverity.ERROR
  ) => {
    return (...args: Parameters<T>): ReturnType<T> | undefined => {
      try {
        return fn(...args);
      } catch (error) {
        trackError(
          error instanceof Error ? error : new Error(String(error)),
          { action: actionName },
          severity
        );
        return undefined;
      }
    };
  }, [trackError]);

  /**
   * Wrap an async function to catch and report any errors
   */
  const withAsyncErrorTracking = useCallback(<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    actionName?: string,
    severity: ErrorSeverity = ErrorSeverity.ERROR
  ) => {
    return async (...args: Parameters<T>): Promise<ReturnType<T> | undefined> => {
      try {
        return await fn(...args);
      } catch (error) {
        trackError(
          error instanceof Error ? error : new Error(String(error)),
          { action: actionName },
          severity
        );
        return undefined;
      }
    };
  }, [trackError]);

  return {
    trackError,
    withErrorTracking,
    withAsyncErrorTracking,
    trackInfo: useCallback((message: string, context?: Partial<ErrorContext>) => {
      trackError(new Error(message), context, ErrorSeverity.INFO);
    }, [trackError]),
    trackWarning: useCallback((message: string, context?: Partial<ErrorContext>) => {
      trackError(new Error(message), context, ErrorSeverity.WARNING);
    }, [trackError]),
    trackCritical: useCallback((message: string, context?: Partial<ErrorContext>) => {
      trackError(new Error(message), context, ErrorSeverity.CRITICAL);
    }, [trackError]),
  };
}

export default useErrorTracking;
