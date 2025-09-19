"use client";

import { useCallback } from 'react';
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

  // New awareness-based collaboration
  const awarenessCollaboration = useAwarenessCollaboration({
    boardId,
    userId,
    userName,
    onCursorMove,
    onPresenceUpdate: onUserPresenceUpdate,
    onUserJoined: (userId, userName) => {
      console.log(`[Awareness] ${userName} joined`);
    },
    onUserLeft: (userId) => {
      console.log(`[Awareness] User ${userId} left`);
    },
  });

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
    if (useAwareness) {
      // Use new awareness system
      awarenessCollaboration.broadcastCursorMovement(
        x, y, currentTool, isDrawing, isSelecting, activeElementId, pressure
      );
    } else {
      // Use legacy system
      legacyCollaboration.broadcastCursorMovement(
        x, y, currentTool, isDrawing, isSelecting, activeElementId, pressure
      );
    }
  }, [useAwareness, awarenessCollaboration, legacyCollaboration]);

  // For now, return the appropriate system based on the flag
  if (useAwareness) {
    return {
      ...awarenessCollaboration,
      // Override cursor movement with hybrid version
      broadcastCursorMovement: hybridBroadcastCursorMovement,
      // Add no-op functions for methods not yet migrated
      broadcastDrawingStart: () => console.log('[Awareness] Drawing events handled by CRDT'),
      broadcastDrawingUpdate: () => console.log('[Awareness] Drawing events handled by CRDT'),
      broadcastDrawingComplete: () => console.log('[Awareness] Drawing events handled by CRDT'),
      broadcastElementUpdate: () => console.log('[Awareness] Element events handled by CRDT'),
      broadcastTextElementCreate: () => console.log('[Awareness] Text events handled by CRDT'),
      broadcastTextElementUpdate: () => console.log('[Awareness] Text events handled by CRDT'),
      broadcastTextElementDelete: () => console.log('[Awareness] Text events handled by CRDT'),
      broadcastTextElementEditStart: (id: string) => awarenessCollaboration.setEditingElement(id, 'text'),
      broadcastTextElementEditFinish: () => awarenessCollaboration.clearEditingElement(),
      broadcastShapeElementCreate: () => console.log('[Awareness] Shape events handled by CRDT'),
      broadcastShapeElementUpdate: () => console.log('[Awareness] Shape events handled by CRDT'),
      broadcastShapeElementDelete: () => console.log('[Awareness] Shape events handled by CRDT'),
      updateAndBroadcastPresence: (updates: any) => awarenessCollaboration.updateUserPresence(updates),
    };
  } else {
    return legacyCollaboration;
  }
}