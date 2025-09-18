/**
 * Simplified React Hook for CRDT Document Management
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { CRDTDocument, CRDTDocumentConfig, BoardElement } from './CRDTDocument';

export interface UseCRDTDocumentResult {
  // Document instance
  document: CRDTDocument | null;

  // Connection status
  isConnected: boolean;
  isLoading: boolean;
  error: Error | null;

  // Document data
  elements: BoardElement[];
  stats: ReturnType<CRDTDocument['getStats']> | null;

  // Actions
  setElement: (element: BoardElement) => void;
  removeElement: (id: string) => void;
  getElement: (id: string) => BoardElement | null;
  getElementsInViewport: (viewport: { x: number; y: number; width: number; height: number }) => BoardElement[];
  sync: () => void;
  exportJSON: () => any;
}

/**
 * Simplified hook for managing a CRDT document instance
 */
export function useCRDTDocument(config: CRDTDocumentConfig): UseCRDTDocumentResult {
  const [document, setDocument] = useState<CRDTDocument | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [elements, setElements] = useState<BoardElement[]>([]);
  const [stats, setStats] = useState<ReturnType<CRDTDocument['getStats']> | null>(null);

  const documentRef = useRef<CRDTDocument | null>(null);
  const mountedRef = useRef(true);

  // Initialize document
  useEffect(() => {
    const initializeDocument = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const doc = new CRDTDocument(config);
        documentRef.current = doc;

        if (!mountedRef.current) {
          doc.destroy();
          return;
        }

        setDocument(doc);

        // Set up listeners
        const updateElements = () => {
          if (!mountedRef.current) return;
          setElements(doc.getAllElements());
          setStats(doc.getStats());
        };

        const updateConnection = () => {
          if (!mountedRef.current) return;
          setIsConnected(doc.isConnected());
        };

        // Subscribe to changes
        const unsubscribeElements = doc.onElementsChange(updateElements);
        doc.on('connection', updateConnection);

        // Initial updates
        updateElements();
        updateConnection();

        setIsLoading(false);
        console.log('✅ CRDT document initialized');

      } catch (err) {
        console.error('❌ Failed to initialize CRDT document:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setIsLoading(false);
      }
    };

    initializeDocument();

    return () => {
      mountedRef.current = false;
      if (documentRef.current) {
        documentRef.current.destroy();
        documentRef.current = null;
      }
    };
  }, [config.boardId, config.userId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Actions
  const setElement = useCallback((element: BoardElement) => {
    document?.setElement(element);
  }, [document]);

  const removeElement = useCallback((id: string) => {
    document?.removeElement(id);
  }, [document]);

  const getElement = useCallback((id: string) => {
    return document?.getElement(id) || null;
  }, [document]);

  const getElementsInViewport = useCallback((viewport: { x: number; y: number; width: number; height: number }) => {
    return document?.getElementsInViewport(viewport) || [];
  }, [document]);

  const sync = useCallback(() => {
    document?.sync();
  }, [document]);

  const exportJSON = useCallback(() => {
    return document?.toJSON();
  }, [document]);

  return {
    document,
    isConnected,
    isLoading,
    error,
    elements,
    stats,
    setElement,
    removeElement,
    getElement,
    getElementsInViewport,
    sync,
    exportJSON,
  };
}