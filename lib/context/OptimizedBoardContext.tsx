"use client";

import React, { createContext, useContext, useCallback, useRef, useEffect } from 'react';
import { debounce, throttle, TimestampOptimizer } from '@/lib/utils/performanceOptimizer';
import { useBoardContext } from './BoardContext';

interface OptimizedBoardContextType {
  optimizedUpdateTimestamp: (boardId: string) => void;
  debouncedUpdateTimestamp: (boardId: string) => void;
  throttledUpdateTimestamp: (boardId: string) => void;
}

const OptimizedBoardContext = createContext<OptimizedBoardContextType | undefined>(undefined);

export function OptimizedBoardProvider({ children }: { children: React.ReactNode }) {
  const { updateBoardTimestamp } = useBoardContext();
  const timestampOptimizerRef = useRef<Map<string, TimestampOptimizer>>(new Map());

  // Optimized timestamp update with batching and throttling
  const optimizedUpdateTimestamp = useCallback((boardId: string) => {
    if (!timestampOptimizerRef.current.has(boardId)) {
      const optimizer = new TimestampOptimizer(updateBoardTimestamp, boardId, 1000);
      timestampOptimizerRef.current.set(boardId, optimizer);
    }

    const optimizer = timestampOptimizerRef.current.get(boardId)!;
    optimizer.update(boardId, updateBoardTimestamp);
  }, [updateBoardTimestamp]);

  // Debounced timestamp update (waits for user to stop typing/acting)
  const debouncedUpdateTimestamp = useCallback(
    debounce((boardId: string) => {
      updateBoardTimestamp(boardId).catch(console.error);
    }, 500), // 500ms debounce
    [updateBoardTimestamp]
  );

  // Throttled timestamp update (limits frequency)
  const throttledUpdateTimestamp = useCallback(
    throttle((boardId: string) => {
      updateBoardTimestamp(boardId).catch(console.error);
    }, 1000), // 1 second throttle
    [updateBoardTimestamp]
  );

  // Cleanup optimizers on unmount
  useEffect(() => {
    return () => {
      timestampOptimizerRef.current.clear();
    };
  }, []);

  const value: OptimizedBoardContextType = {
    optimizedUpdateTimestamp,
    debouncedUpdateTimestamp,
    throttledUpdateTimestamp,
  };

  return (
    <OptimizedBoardContext.Provider value={value}>
      {children}
    </OptimizedBoardContext.Provider>
  );
}

export function useOptimizedBoardContext() {
  const context = useContext(OptimizedBoardContext);
  if (context === undefined) {
    throw new Error('useOptimizedBoardContext must be used within an OptimizedBoardProvider');
  }
  return context;
}
