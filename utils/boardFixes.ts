/**
 * Board Fixes Utility
 * Quick fixes for undo/redo and sticky note color issues
 */

import { BoardElement } from '../lib/crdt/CRDTCore';

// Simple in-memory state manager for undo/redo
class SimpleUndoRedoManager {
  private history: any[] = [];
  private currentIndex: number = -1;
  private maxHistory: number = 50;
  public onStateChange?: (state: any) => void;

  constructor(onStateChange?: (state: any) => void) {
    this.onStateChange = onStateChange;
  }

  saveState(state: any, action: string = 'Unknown') {
    // Remove any future states if we're in the middle of history
    this.history = this.history.slice(0, this.currentIndex + 1);

    // Add new state
    this.history.push({
      state: JSON.parse(JSON.stringify(state)), // Deep clone
      action,
      timestamp: Date.now(),
    });

    // Limit history size
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    } else {
      this.currentIndex++;
    }

    console.log(`💾 Saved state: ${action} (${this.history.length} states)`);
  }

  undo(): boolean {
    if (this.currentIndex <= 0) return false;

    this.currentIndex--;
    const prevState = this.history[this.currentIndex];

    if (prevState && this.onStateChange) {
      console.log(`⏪ Undo: ${prevState.action}`);
      this.onStateChange(prevState.state);
      return true;
    }

    return false;
  }

  redo(): boolean {
    if (this.currentIndex >= this.history.length - 1) return false;

    this.currentIndex++;
    const nextState = this.history[this.currentIndex];

    if (nextState && this.onStateChange) {
      console.log(`⏩ Redo: ${nextState.action}`);
      this.onStateChange(nextState.state);
      return true;
    }

    return false;
  }

  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  clear() {
    this.history = [];
    this.currentIndex = -1;
  }
}

// Simple color state manager
class StickyNoteColorManager {
  private currentColor: string = '#fef3c7';
  private listeners: Set<(color: string) => void> = new Set();

  constructor(initialColor?: string) {
    if (initialColor) {
      this.currentColor = initialColor;
    }

    // Load from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('whizboard-sticky-color');
      if (saved && this.isValidColor(saved)) {
        this.currentColor = saved;
      }
    }
  }

  getCurrentColor(): string {
    return this.currentColor;
  }

  setColor(color: string): void {
    if (!this.isValidColor(color)) {
      console.warn('Invalid color:', color);
      return;
    }

    this.currentColor = color;

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('whizboard-sticky-color', color);
    }

    // Notify listeners
    this.listeners.forEach(listener => listener(color));

    console.log(`🎨 Sticky note color changed to: ${color}`);
  }

  addListener(listener: (color: string) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private isValidColor(color: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }

  getRandomColor(): string {
    const colors = [
      '#fef3c7', '#dcfce7', '#dbeafe', '#fce7f3',
      '#f3e8ff', '#fed7e2', '#ffedd5', '#f0f9ff',
      '#ecfdf5', '#fef0ff', '#fef7ed', '#f1f5f9'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    this.setColor(randomColor);
    return randomColor;
  }
}

// Export singleton instances
export const undoRedoManager = new SimpleUndoRedoManager();
export const colorManager = new StickyNoteColorManager();

// Helper functions for integration
export function setupQuickUndoRedo(
  onStateChange: (state: any) => void
): {
  saveState: (state: any, action?: string) => void;
  undo: () => boolean;
  redo: () => boolean;
  canUndo: () => boolean;
  canRedo: () => boolean;
} {
  undoRedoManager.onStateChange = onStateChange;

  return {
    saveState: (state: any, action?: string) => undoRedoManager.saveState(state, action),
    undo: () => undoRedoManager.undo(),
    redo: () => undoRedoManager.redo(),
    canUndo: () => undoRedoManager.canUndo(),
    canRedo: () => undoRedoManager.canRedo(),
  };
}

export function setupStickyNoteColorFix(
  onColorChange: (color: string) => void
): {
  getCurrentColor: () => string;
  setColor: (color: string) => void;
  getRandomColor: () => string;
} {
  const unsubscribe = colorManager.addListener(onColorChange);

  // Clean up listener when component unmounts
  if (typeof window !== 'undefined') {
    const cleanup = () => unsubscribe();
    window.addEventListener('beforeunload', cleanup);
  }

  return {
    getCurrentColor: () => colorManager.getCurrentColor(),
    setColor: (color: string) => colorManager.setColor(color),
    getRandomColor: () => colorManager.getRandomColor(),
  };
}

// Keyboard shortcut handler
export function setupKeyboardShortcuts() {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return; // Don't handle when typing
    }

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const cmdKey = isMac ? e.metaKey : e.ctrlKey;

    if (cmdKey && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undoRedoManager.undo();
    } else if (cmdKey && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      undoRedoManager.redo();
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}