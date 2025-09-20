'use client';

import { useEffect, useCallback } from 'react';
import { 
  recordCollaborationEvent, 
  CollaborationEventType, 
  getBoardStatistics,
  BoardStatistics
} from '@/lib/utils/collaboration-stats';
import { useState } from 'react';

interface UseCollaborationStatsOptions {
  boardId: string;
  userId?: string;
  username?: string;
}

/**
 * Hook for tracking and accessing collaboration statistics
 * @param options Configuration options
 * @returns Object with collaboration statistics and tracking methods
 */
export function useCollaborationStats(options: UseCollaborationStatsOptions) {
  const { boardId, userId, username } = options;
  const [statistics, setStatistics] = useState<BoardStatistics | null>(null);
  
  // Update statistics periodically
  useEffect(() => {
    if (!boardId) return;
    
    // Initial statistics
    setStatistics(getBoardStatistics(boardId));
    
    // Update every second
    const intervalId = setInterval(() => {
      setStatistics(getBoardStatistics(boardId));
    }, 1000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [boardId]);
  
  // Record user joined when component mounts
  useEffect(() => {
    if (boardId && userId && username) {
      recordCollaborationEvent({
        type: CollaborationEventType.USER_JOINED,
        timestamp: Date.now(),
        boardId,
        userId,
        username,
      });
      
      // Record user left when component unmounts
      return () => {
        recordCollaborationEvent({
          type: CollaborationEventType.USER_LEFT,
          timestamp: Date.now(),
          boardId,
          userId,
          username,
        });
      };
    }
  }, [boardId, userId, username]);
  
  /**
   * Record a cursor movement event
   * @param position Cursor position
   */
  const recordCursorMoved = useCallback((position: { x: number; y: number }) => {
    if (!boardId || !userId) return;
    
    recordCollaborationEvent({
      type: CollaborationEventType.CURSOR_MOVED,
      timestamp: Date.now(),
      boardId,
      userId,
      additionalData: { position },
    });
  }, [boardId, userId]);
  
  /**
   * Record an element created event
   * @param elementId Element ID
   * @param elementType Element type
   */
  const recordElementCreated = useCallback((elementId: string, elementType: string) => {
    if (!boardId || !userId) return;
    
    recordCollaborationEvent({
      type: CollaborationEventType.ELEMENT_CREATED,
      timestamp: Date.now(),
      boardId,
      userId,
      elementId,
      elementType,
    });
  }, [boardId, userId]);
  
  /**
   * Record an element updated event
   * @param elementId Element ID
   * @param elementType Element type
   */
  const recordElementUpdated = useCallback((elementId: string, elementType: string) => {
    if (!boardId || !userId) return;
    
    recordCollaborationEvent({
      type: CollaborationEventType.ELEMENT_UPDATED,
      timestamp: Date.now(),
      boardId,
      userId,
      elementId,
      elementType,
    });
  }, [boardId, userId]);
  
  /**
   * Record an element deleted event
   * @param elementId Element ID
   * @param elementType Element type
   */
  const recordElementDeleted = useCallback((elementId: string, elementType: string) => {
    if (!boardId || !userId) return;
    
    recordCollaborationEvent({
      type: CollaborationEventType.ELEMENT_DELETED,
      timestamp: Date.now(),
      boardId,
      userId,
      elementId,
      elementType,
    });
  }, [boardId, userId]);
  
  /**
   * Record a sync completed event with latency
   * @param latency Latency in milliseconds
   */
  const recordSyncCompleted = useCallback((latency: number) => {
    if (!boardId) return;
    
    recordCollaborationEvent({
      type: CollaborationEventType.SYNC_COMPLETED,
      timestamp: Date.now(),
      boardId,
      latency,
    });
  }, [boardId]);
  
  /**
   * Record a connection state change event
   * @param state Connection state ('established', 'lost', or 'reconnected')
   */
  const recordConnectionState = useCallback((
    state: 'established' | 'lost' | 'reconnected'
  ) => {
    if (!boardId) return;
    
    let eventType: CollaborationEventType;
    switch (state) {
      case 'established':
        eventType = CollaborationEventType.CONNECTION_ESTABLISHED;
        break;
      case 'lost':
        eventType = CollaborationEventType.CONNECTION_LOST;
        break;
      case 'reconnected':
        eventType = CollaborationEventType.CONNECTION_RECONNECTED;
        break;
    }
    
    recordCollaborationEvent({
      type: eventType,
      timestamp: Date.now(),
      boardId,
      userId,
    });
  }, [boardId, userId]);
  
  /**
   * Record a custom collaboration event
   * @param type Event type
   * @param additionalData Additional event data
   */
  const recordCustomEvent = useCallback((
    type: string,
    additionalData: Record<string, any> = {}
  ) => {
    if (!boardId) return;
    
    recordCollaborationEvent({
      type,
      timestamp: Date.now(),
      boardId,
      userId,
      additionalData,
    });
  }, [boardId, userId]);
  
  return {
    // Current statistics
    statistics,
    
    // Active users
    activeUsers: statistics?.activeUsers || new Map(),
    activeUserCount: statistics ? 
      Array.from(statistics.activeUsers.values()).filter(u => u.isActive).length : 0,
    
    // Connection quality
    connectionQuality: statistics?.connectionQuality || 'excellent',
    averageLatency: statistics?.averageLatency || 0,
    
    // Element counts
    elementCounts: statistics?.elementCounts || {},
    totalElements: statistics ? 
      Object.values(statistics.elementCounts).reduce((sum, count) => sum + count, 0) : 0,
    
    // Event recording methods
    recordCursorMoved,
    recordElementCreated,
    recordElementUpdated,
    recordElementDeleted,
    recordSyncCompleted,
    recordConnectionState,
    recordCustomEvent,
  };
}

export default useCollaborationStats;
