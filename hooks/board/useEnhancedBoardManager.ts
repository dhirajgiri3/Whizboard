/**
 * Enhanced Board Manager Hook
 * Integrates optimized undo/redo with CRDT and fixes sticky note color issues
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { CRDTCore, BoardElement } from '@/lib/crdt/CRDTCore';
import { useOptimizedUndoRedo } from './useOptimizedUndoRedo';
import { useStickyNoteColor } from '@/hooks/ui/useStickyNoteColor';
import { StickyNoteElement, FrameElement, TextElement, ShapeElement, ImageElement } from '@/types';

interface UseEnhancedBoardManagerProps {
  boardId: string;
  userId: string;
  enableCRDT?: boolean;
  maxUndoHistory?: number;
}

interface UseEnhancedBoardManagerResult {
  // CRDT
  crdt: CRDTCore | null;
  isConnected: boolean;

  // Elements
  elements: BoardElement[];
  stickyNotes: StickyNoteElement[];

  // Undo/Redo
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;

  // Sticky Note Color
  currentStickyNoteColor: string;
  setStickyNoteColor: (color: string) => void;
  getRandomStickyNoteColor: () => string;

  // Element Operations
  addElement: (element: BoardElement) => void;
  updateElement: (id: string, updates: Partial<BoardElement>) => void;
  removeElement: (id: string) => void;
  clearBoard: () => void;

  // Utility
  getStats: () => any;
  exportData: () => any;
}

/**
 * Enhanced board manager with optimized undo/redo and fixed color selection
 */
export function useEnhancedBoardManager({
  boardId,
  userId,
  enableCRDT = true,
  maxUndoHistory = 50,
}: UseEnhancedBoardManagerProps): UseEnhancedBoardManagerResult {

  const [crdt, setCRDT] = useState<CRDTCore | null>(null);
  const [elements, setElements] = useState<BoardElement[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const elementsRef = useRef<BoardElement[]>([]);
  const isInitializedRef = useRef(false);

  // Enhanced sticky note color management
  const {
    currentColor: currentStickyNoteColor,
    setColor: setStickyNoteColor,
    getRandomColor: getRandomStickyNoteColor,
  } = useStickyNoteColor({
    onColorChange: (color) => {
      console.log(`🎨 Sticky note color changed to: ${color}`);
    },
  });

  // Optimized undo/redo
  const {
    canUndo,
    canRedo,
    undo: undoAction,
    redo: redoAction,
    saveState,
    clearHistory,
  } = useOptimizedUndoRedo({
    maxHistorySize: maxUndoHistory,
    onStateChange: (newElements) => {
      // Apply state change to both local state and CRDT
      setElements(newElements);
      elementsRef.current = newElements;

      if (crdt) {
        // Update CRDT with new state
        const currentElements = crdt.getAllElements();

        // Remove elements that are no longer present
        currentElements.forEach(element => {
          if (!newElements.find(e => e.id === element.id)) {
            crdt.removeElement(element.id);
          }
        });

        // Add or update elements
        newElements.forEach(element => {
          crdt.setElement(element);
        });
      }
    },
  });

  // Initialize CRDT
  useEffect(() => {
    if (enableCRDT && boardId && userId) {
      const crdtInstance = new CRDTCore({
        boardId,
        userId,
        enableOffline: true,
      });

      setCRDT(crdtInstance);

      // Set up CRDT listeners
      const unsubscribe = crdtInstance.onElementsChange(() => {
        const newElements = crdtInstance.getAllElements();
        setElements(newElements);
        elementsRef.current = newElements;
      });

      crdtInstance.on('connection', () => {
        setIsConnected(crdtInstance.isConnected());
      });

      // Initial connection status
      setIsConnected(crdtInstance.isConnected());

      console.log(`🔗 CRDT initialized for board: ${boardId}`);

      return () => {
        unsubscribe();
        crdtInstance.destroy();
      };
    }
  }, [boardId, userId, enableCRDT]);

  // Save initial state to history
  useEffect(() => {
    if (!isInitializedRef.current && elements.length === 0) {
      saveState([], 'Initial state');
      isInitializedRef.current = true;
    }
  }, [elements, saveState]);

  /**
   * Add element with history tracking
   */
  const addElement = useCallback((element: BoardElement) => {
    const newElements = [...elementsRef.current, element];

    setElements(newElements);
    elementsRef.current = newElements;

    if (crdt) {
      crdt.setElement(element);
    }

    saveState(newElements, `Add ${element.type}`);
    console.log(`➕ Added ${element.type}: ${element.id}`);
  }, [crdt, saveState]);

  /**
   * Update element with history tracking
   */
  const updateElement = useCallback((id: string, updates: Partial<BoardElement>) => {
    const currentElement = elementsRef.current.find(e => e.id === id);
    if (!currentElement) return;

    const updatedElement = { ...currentElement, ...updates, updatedAt: Date.now() };
    const newElements = elementsRef.current.map(e =>
      e.id === id ? updatedElement : e
    );

    setElements(newElements);
    elementsRef.current = newElements;

    if (crdt) {
      crdt.setElement(updatedElement);
    }

    saveState(newElements, `Update ${currentElement.type}`);
    console.log(`✏️ Updated ${currentElement.type}: ${id}`);
  }, [crdt, saveState]);

  /**
   * Remove element with history tracking
   */
  const removeElement = useCallback((id: string) => {
    const elementToRemove = elementsRef.current.find(e => e.id === id);
    if (!elementToRemove) return;

    const newElements = elementsRef.current.filter(e => e.id !== id);

    setElements(newElements);
    elementsRef.current = newElements;

    if (crdt) {
      crdt.removeElement(id);
    }

    saveState(newElements, `Remove ${elementToRemove.type}`);
    console.log(`🗑️ Removed ${elementToRemove.type}: ${id}`);
  }, [crdt, saveState]);

  /**
   * Clear board with history tracking
   */
  const clearBoard = useCallback(() => {
    const newElements: BoardElement[] = [];

    setElements(newElements);
    elementsRef.current = newElements;

    if (crdt) {
      // Remove all elements from CRDT
      elements.forEach(element => {
        crdt.removeElement(element.id);
      });
    }

    saveState(newElements, 'Clear board');
    console.log('🧹 Board cleared');
  }, [crdt, elements, saveState]);

  /**
   * Enhanced undo with instant feedback
   */
  const undo = useCallback(() => {
    console.log('⏪ Undo triggered');
    undoAction();
  }, [undoAction]);

  /**
   * Enhanced redo with instant feedback
   */
  const redo = useCallback(() => {
    console.log('⏩ Redo triggered');
    redoAction();
  }, [redoAction]);

  /**
   * Get sticky notes from elements
   */
  const stickyNotes = elements
    .filter(el => el.type === 'sticky-note')
    .map(el => ({
      id: el.id,
      type: 'sticky-note' as const,
      x: el.x,
      y: el.y,
      width: el.width || 240,
      height: el.height || 240,
      text: el.data.text || '',
      color: el.data.color || currentStickyNoteColor,
      fontSize: el.data.fontSize || 16,
      createdBy: el.createdBy,
      createdAt: el.createdAt,
      updatedAt: el.updatedAt,
    }));

  /**
   * Get board statistics
   */
  const getStats = useCallback(() => {
    const stats = {
      totalElements: elements.length,
      byType: elements.reduce((acc, el) => {
        acc[el.type] = (acc[el.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      isConnected,
      undoRedoStats: {
        canUndo,
        canRedo,
      },
    };

    if (crdt) {
      return {
        ...stats,
        crdtStats: {
          isConnected: crdt.isConnected(),
          totalElements: crdt.getAllElements().length
        }
      };
    }

    return stats;
  }, [elements, isConnected, canUndo, canRedo, crdt]);

  /**
   * Export board data
   */
  const exportData = useCallback(() => {
    const data: {
      elements: typeof elements;
      metadata: {
        boardId: string;
        userId: string;
        exportedAt: number;
        version: string;
      };
      stats: ReturnType<typeof getStats>;
      crdtData?: Uint8Array;
    } = {
      elements,
      metadata: {
        boardId,
        userId,
        exportedAt: Date.now(),
        version: '2.0',
      },
      stats: getStats(),
    };

    if (crdt) {
      data.crdtData = crdt.exportData();
    }

    return data;
  }, [elements, boardId, userId, getStats, crdt]);

  return {
    crdt,
    isConnected,
    elements,
    stickyNotes,
    canUndo,
    canRedo,
    undo,
    redo,
    currentStickyNoteColor,
    setStickyNoteColor,
    getRandomStickyNoteColor,
    addElement,
    updateElement,
    removeElement,
    clearBoard,
    getStats,
    exportData,
  };
}