/**
 * Optimized Undo/Redo Hook
 * Provides instant, local undo/redo functionality without server calls
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { BoardElement } from '../lib/crdt/CRDTCore';

interface BoardState {
  elements: BoardElement[];
  timestamp: number;
  action: string;
}

interface UseOptimizedUndoRedoResult {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  saveState: (elements: BoardElement[], action: string) => void;
  clearHistory: () => void;
  getHistoryInfo: () => { historySize: number; currentIndex: number };
}

interface UseOptimizedUndoRedoProps {
  maxHistorySize?: number;
  onStateChange?: (elements: BoardElement[]) => void;
  debounceMs?: number;
}

/**
 * Optimized undo/redo hook with local state management
 */
export function useOptimizedUndoRedo({
  maxHistorySize = 50,
  onStateChange,
  debounceMs = 500,
}: UseOptimizedUndoRedoProps = {}): UseOptimizedUndoRedoResult {

  const [history, setHistory] = useState<BoardState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  // Debouncing for rapid changes
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastSaveRef = useRef<number>(0);

  // Calculate derived state
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  /**
   * Save current state to history
   */
  const saveState = useCallback((elements: BoardElement[], action: string) => {
    // Debounce rapid saves
    const now = Date.now();
    const timeSinceLastSave = now - lastSaveRef.current;

    if (timeSinceLastSave < debounceMs) {
      // Clear existing timeout and set new one
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveStateImmediate(elements, action);
      }, debounceMs);
      return;
    }

    saveStateImmediate(elements, action);
  }, [debounceMs]);

  const saveStateImmediate = useCallback((elements: BoardElement[], action: string) => {
    lastSaveRef.current = Date.now();

    setHistory(prevHistory => {
      const newState: BoardState = {
        elements: JSON.parse(JSON.stringify(elements)), // Deep clone
        timestamp: Date.now(),
        action,
      };

      // Remove any states after current index (when we're in the middle of history)
      const newHistory = prevHistory.slice(0, currentIndex + 1);

      // Add new state
      newHistory.push(newState);

      // Limit history size
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
        setCurrentIndex(prev => Math.max(0, prev));
      } else {
        setCurrentIndex(newHistory.length - 1);
      }

      console.log(`💾 Saved state: ${action} (${newHistory.length} states)`);
      return newHistory;
    });
  }, [currentIndex, maxHistorySize]);

  /**
   * Undo last action
   */
  const undo = useCallback(() => {
    if (!canUndo) return;

    const prevIndex = currentIndex - 1;
    const prevState = history[prevIndex];

    if (prevState && onStateChange) {
      console.log(`⏪ Undo: ${history[currentIndex]?.action || 'Unknown'} → ${prevState.action}`);
      onStateChange(prevState.elements);
      setCurrentIndex(prevIndex);
    }
  }, [canUndo, currentIndex, history, onStateChange]);

  /**
   * Redo next action
   */
  const redo = useCallback(() => {
    if (!canRedo) return;

    const nextIndex = currentIndex + 1;
    const nextState = history[nextIndex];

    if (nextState && onStateChange) {
      console.log(`⏩ Redo: ${history[currentIndex]?.action || 'Unknown'} → ${nextState.action}`);
      onStateChange(nextState.elements);
      setCurrentIndex(nextIndex);
    }
  }, [canRedo, currentIndex, history, onStateChange]);

  /**
   * Clear all history
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
    console.log('🗑️ Cleared undo/redo history');
  }, []);

  /**
   * Get history information for debugging
   */
  const getHistoryInfo = useCallback(() => ({
    historySize: history.length,
    currentIndex,
  }), [history.length, currentIndex]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't handle shortcuts when typing
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdKey = isMac ? e.metaKey : e.ctrlKey;

      if (cmdKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (cmdKey && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    canUndo,
    canRedo,
    undo,
    redo,
    saveState,
    clearHistory,
    getHistoryInfo,
  };
}