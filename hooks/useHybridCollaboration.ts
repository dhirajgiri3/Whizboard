"use client";

import { useCallback, useState, useEffect } from 'react';
import { useRealTimeCollaboration } from './useRealTimeCollaboration';
import { useAwarenessCollaboration } from './useAwarenessCollaboration';

export interface UseHybridCollaborationProps {
  boardId: string;
  userId: string;
  userName: string;
  isOwner: boolean;
  useAwareness?: boolean; // Feature flag for gradual migration
  onBoardUpdate?: (elements: any[]) => void;
  onCursorMove?: (cursors: any) => void;
  onElementAdded?: (element: any) => void;
  onElementUpdated?: (element: any) => void;
  onElementDeleted?: (elementId: string) => void;
  onUserPresenceUpdate?: (presence: any) => void;
}

/**
 * Hybrid collaboration hook that can use either the old system or new awareness system
 * Allows for gradual migration with feature flags
 */
export function useHybridCollaboration(props: UseHybridCollaborationProps) {
  const {
    boardId,
    userId,
    userName,
    isOwner,
    useAwareness = false,
    onBoardUpdate,
    onCursorMove,
    onElementAdded,
    onElementUpdated,
    onElementDeleted,
    onUserPresenceUpdate,
  } = props;

  // Track whether CRDT awareness is available
  const [isCRDTAvailable, setIsCRDTAvailable] = useState(true);

  // Legacy collaboration system
  const legacyCollaboration = useRealTimeCollaboration({
    boardId,
    userId,
    userName,
    isOwner,
    onBoardUpdate,
    onCursorMove,
    onElementAdded,
    onElementUpdated,
    onElementDeleted,
    onUserPresenceUpdate,
  });

  // Always call the hook, but we'll handle errors via state
  const awarenessProps = {
    boardId,
    userId,
    userName,
    onCursorMove,
    onPresenceUpdate: onUserPresenceUpdate,
    onUserJoined: (userId: string, userName: string) => {
      console.log(`[Awareness] ${userName} joined`);
    },
    onUserLeft: (userId: string) => {
      console.log(`[Awareness] User ${userId} left`);
    },
  };

  // Create a safe version of awareness collaboration that won't throw if CRDT context is missing
  const safeAwarenessCollaboration = (() => {
    try {
      // Try to use the CRDT-based collaboration
      return useAwarenessCollaboration(awarenessProps);
    } catch (error) {
      // If it fails, update state and return a mock implementation
      if (isCRDTAvailable) {
        console.warn('CRDT Context not available, falling back to legacy collaboration', error);
        // Use setTimeout to avoid state updates during render
        setTimeout(() => setIsCRDTAvailable(false), 0);
      }
      
      // Return a dummy implementation with the same interface
      return {
        isConnected: false,
        cursors: {},
        presence: {},
        connectedUsers: 0,
        broadcastCursorMovement: () => {},
        updateUserPresence: () => {},
        setEditingElement: () => {},
        clearEditingElement: () => {},
        updateSelection: () => {},
        getConnectionStats: () => ({ connectedUsers: 0, localClientId: 0, totalClients: 0 }),
        getEditingUsers: () => ({}),
      };
    }
  })();

  // Hybrid cursor movement that works with both systems
  const hybridBroadcastCursorMovement = useCallback((
    x: number,
    y: number,
    currentTool?: string,
    isDrawing?: boolean,
    isSelecting?: boolean,
    activeElementId?: string,
    pressure?: number
  ) => {
    if (useAwareness && isCRDTAvailable) {
      // Use new awareness system
      safeAwarenessCollaboration.broadcastCursorMovement(
        x, y, currentTool, isDrawing, isSelecting, activeElementId, pressure
      );
    } else {
      // Use legacy system
      legacyCollaboration.broadcastCursorMovement(
        x, y, currentTool, isDrawing, isSelecting, activeElementId, pressure
      );
    }
  }, [useAwareness, isCRDTAvailable, safeAwarenessCollaboration, legacyCollaboration]);

  // For now, return the appropriate system based on the flag
  if (useAwareness && isCRDTAvailable) {
    return {
      ...safeAwarenessCollaboration,
      // Override cursor movement with hybrid version
      broadcastCursorMovement: hybridBroadcastCursorMovement,
      // Add no-op functions for methods not yet migrated
      broadcastDrawingStart: () => { console.log('[Awareness] Drawing events handled by CRDT'); },
      broadcastDrawingUpdate: () => { console.log('[Awareness] Drawing events handled by CRDT'); },
      broadcastDrawingComplete: () => { console.log('[Awareness] Drawing events handled by CRDT'); },
      broadcastElementUpdate: () => { console.log('[Awareness] Element events handled by CRDT'); },
      broadcastTextElementCreate: () => { console.log('[Awareness] Text events handled by CRDT'); },
      broadcastTextElementUpdate: () => { console.log('[Awareness] Text events handled by CRDT'); },
      broadcastTextElementDelete: () => { console.log('[Awareness] Text events handled by CRDT'); },
      broadcastTextElementEditStart: (id: string) => { safeAwarenessCollaboration.setEditingElement(id, 'text'); },
      broadcastTextElementEditFinish: () => { safeAwarenessCollaboration.clearEditingElement(); },
      broadcastShapeElementCreate: () => { console.log('[Awareness] Shape events handled by CRDT'); },
      broadcastShapeElementUpdate: () => { console.log('[Awareness] Shape events handled by CRDT'); },
      broadcastShapeElementDelete: () => { console.log('[Awareness] Shape events handled by CRDT'); },
      updateAndBroadcastPresence: (updates: Record<string, unknown>) => { safeAwarenessCollaboration.updateUserPresence(updates); },
    };
  } else {
    return legacyCollaboration;
  }
}