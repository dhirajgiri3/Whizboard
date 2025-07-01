"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useBoardContext } from '@/components/context/BoardContext';
import logger from '@/lib/logger';
import { Cursor } from '@/components/canvas/LiveCursors';

interface DrawingLineData {
  id: string;
  points: number[];
  tool: string;
  color: string;
  strokeWidth: number;
}

function isDrawingLineData(obj: unknown): obj is DrawingLineData {
  return typeof obj === 'object' && 
         obj !== null && 
         typeof (obj as DrawingLineData).id === 'string' &&
         Array.isArray((obj as DrawingLineData).points) &&
         typeof (obj as DrawingLineData).tool === 'string' &&
         typeof (obj as DrawingLineData).color === 'string' &&
         typeof (obj as DrawingLineData).strokeWidth === 'number';
}

interface RealTimeEvent {
  type: string;
  payload: Record<string, unknown>;
}

interface BoardElement {
  id: string;
  type: 'line' | 'shape';
  data: Record<string, unknown>;
  userId: string;
  timestamp: number;
}

interface CollaboratorData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface UseRealTimeCollaborationProps {
  boardId: string;
  userId?: string;
  userName?: string;
  isOwner?: boolean;
  onBoardUpdate?: (elements: BoardElement[]) => void;
  onCursorMove?: (cursors: Record<string, Cursor>) => void;
  onElementAdded?: (element: BoardElement) => void;
  onElementUpdated?: (element: BoardElement) => void;
  onElementDeleted?: (elementId: string) => void;
}

export function useRealTimeCollaboration({
  boardId,
  userId,
  userName,
  isOwner,
  onBoardUpdate,
  onCursorMove,
  onElementAdded,
  onElementUpdated,
  onElementDeleted,
}: UseRealTimeCollaborationProps) {
  const {
    addCollaborator,
    removeCollaborator,
    updateCollaboratorStatus,
    incrementPendingInvitations,
    decrementPendingInvitations,
  } = useBoardContext();

  const eventSourceRef = useRef<EventSource | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [cursors, setCursors] = useState<Record<string, Cursor>>({});
  const cursorThrottleRef = useRef<NodeJS.Timeout | null>(null);
  const handleRealTimeEventRef = useRef<((event: RealTimeEvent) => void) | null>(null);
  const hasJoinedRef = useRef(false);

  // Handle real-time events
  const handleRealTimeEvent = useCallback((event: RealTimeEvent) => {
    logger.debug('Received real-time event:', event);

    switch (event.type) {
      case 'connected':
        logger.info('SSE connection confirmed');
        break;

      case 'boardUpdates':
        if (onBoardUpdate && Array.isArray(event.payload.elements)) {
          onBoardUpdate(event.payload.elements as BoardElement[]);
        }
        break;

      case 'userJoined':
        if (typeof event.payload.id === 'string' && event.payload.id !== userId) {
          addCollaborator({
            id: event.payload.id,
            name: (event.payload.name as string) || 'Unknown User',
            email: (event.payload.email as string) || '',
            avatar: event.payload.avatar as string | undefined,
            isOnline: true,
            joinedAt: new Date().toISOString(),
          });

          toast.success(`${event.payload.name || 'User'} joined the board! 🎉`, {
            description: 'You can now collaborate in real-time.',
            duration: 4000,
          });
        }
        break;

      case 'userLeft':
        if (typeof event.payload.id === 'string' && event.payload.id !== userId) {
          removeCollaborator(event.payload.id);
          
          // Remove cursor
          setCursors(prev => {
            const updated = { ...prev };
            delete updated[event.payload.id as string];
            return updated;
          });

          toast.info(`User left the board`, {
            duration: 3000,
          });
        }
        break;

      case 'cursorMovement':
        if (typeof event.payload.userId === 'string' && event.payload.userId !== userId) {
          const userCursor = {
            x: (event.payload.x as number) || 0,
            y: (event.payload.y as number) || 0,
            userId: event.payload.userId,
            name: (event.payload.name as string) || 'Unknown User',
          };

          setCursors(prev => ({
            ...prev,
            [event.payload.userId as string]: userCursor,
          }));
          
          if (onCursorMove) {
            onCursorMove({
              ...cursors,
              [event.payload.userId as string]: userCursor,
            });
          }
        }
        break;

      case 'collaboratorInvited':
        if (isOwner && typeof event.payload.inviteeEmail === 'string') {
          incrementPendingInvitations();
          toast.success(`Invitation sent to ${event.payload.inviteeEmail}`, {
            description: 'They will receive an email with a link to join the board.',
            duration: 4000,
          });
        }
        break;

      case 'collaboratorJoined':
        if (event.payload.collaborator && 
            typeof (event.payload.collaborator as CollaboratorData).id === 'string' && 
            (event.payload.collaborator as CollaboratorData).id !== userId) {
          const collaborator = event.payload.collaborator as CollaboratorData;
          addCollaborator({
            id: collaborator.id,
            name: collaborator.name || 'Unknown User',
            email: collaborator.email || '',
            avatar: collaborator.avatar,
            isOnline: true,
            joinedAt: new Date().toISOString(),
          });

          toast.success(`${collaborator.name || 'User'} joined the board! 🎉`, {
            description: 'You can now collaborate in real-time.',
            duration: 5000,
          });

          if (isOwner) {
            decrementPendingInvitations();
          }
        }
        break;

      case 'invitationStatusChanged':
        if (isOwner && typeof event.payload.status === 'string' && typeof event.payload.email === 'string') {
          const { status, email } = event.payload;
          
          if (status === 'accepted') {
            toast.success(`${email} accepted your invitation! 🎉`, {
              description: 'They can now collaborate on the board.',
              duration: 4000,
            });
            decrementPendingInvitations();
          } else if (status === 'declined') {
            toast.info(`${email} declined your invitation`, {
              description: 'You can send them another invitation if needed.',
              duration: 4000,
            });
            decrementPendingInvitations();
          }
        }
        break;

      case 'elementAdded':
        if (typeof event.payload.userId === 'string' && 
            event.payload.userId !== userId && 
            onElementAdded &&
            typeof event.payload.id === 'string') {
          onElementAdded(event.payload as unknown as BoardElement);
        }
        break;

      case 'elementUpdated':
        if (typeof event.payload.userId === 'string' && 
            event.payload.userId !== userId && 
            onElementUpdated &&
            typeof event.payload.id === 'string') {
          onElementUpdated(event.payload as unknown as BoardElement);
        }
        break;

      case 'elementDeleted':
        if (typeof event.payload.userId === 'string' && 
            event.payload.userId !== userId && 
            onElementDeleted &&
            typeof event.payload.elementId === 'string') {
          onElementDeleted(event.payload.elementId);
        }
        break;

      case 'drawingStarted':
        if (typeof event.payload.userId === 'string' && 
            event.payload.userId !== userId &&
            event.payload.line &&
            typeof event.payload.line === 'object') {
          // Handle real-time drawing start from other users
          // You can implement optimistic UI updates here
          logger.debug('Real-time drawing started by another user', event.payload);
        }
        break;

      case 'drawingUpdated':
        if (typeof event.payload.userId === 'string' && 
            event.payload.userId !== userId &&
            isDrawingLineData(event.payload.line)) {
          // Handle real-time drawing updates from other users
          // This allows showing live drawing strokes as they happen
          if (onElementUpdated) {
            const lineData = event.payload.line;
            const liveElement: BoardElement = {
              id: lineData.id,
              type: 'line',
              data: lineData as unknown as Record<string, unknown>,
              userId: event.payload.userId,
              timestamp: typeof event.payload.timestamp === 'number' ? event.payload.timestamp : Date.now(),
            };
            onElementUpdated(liveElement);
          }
        }
        break;

      case 'drawingCompleted':
        if (typeof event.payload.userId === 'string' && 
            event.payload.userId !== userId &&
            isDrawingLineData(event.payload.line)) {
          // Handle completed drawing from other users
          if (onElementAdded) {
            const lineData = event.payload.line;
            const completedElement: BoardElement = {
              id: lineData.id,
              type: 'line',
              data: lineData as unknown as Record<string, unknown>,
              userId: event.payload.userId,
              timestamp: typeof event.payload.timestamp === 'number' ? event.payload.timestamp : Date.now(),
            };
            onElementAdded(completedElement);
          }
        }
        break;

      default:
        logger.debug('Unknown event type:', event.type);
    }
  }, [
    userId,
    isOwner,
    addCollaborator,
    removeCollaborator,
    incrementPendingInvitations,
    decrementPendingInvitations,
    onBoardUpdate,
    onCursorMove,
    onElementAdded,
    onElementUpdated,
    onElementDeleted,
    cursors,
  ]);

  // Update the ref whenever handleRealTimeEvent changes
  useEffect(() => {
    handleRealTimeEventRef.current = handleRealTimeEvent;
  });

  // Initialize SSE connection with stability checks
  useEffect(() => {
    if (!boardId || !userId) {
      logger.debug('Missing boardId or userId, skipping SSE connection');
      return;
    }

    // Prevent creating multiple connections
    if (eventSourceRef.current) {
      logger.debug('SSE connection already exists');
      return;
    }

    logger.info('Initializing SSE connection', { boardId, userId });

    const connectSSE = () => {
      try {
        const eventSource = new EventSource(`/api/graphql/sse?boardId=${boardId}&userId=${userId}`);
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          logger.info('SSE connection established');
          setIsConnected(true);
          toast.success('Connected to real-time collaboration', {
            duration: 2000,
          });
        };

        eventSource.onmessage = (event) => {
          try {
            const data: RealTimeEvent = JSON.parse(event.data);
            if (handleRealTimeEventRef.current) {
              handleRealTimeEventRef.current(data);
            }
          } catch (error) {
            logger.error('Error parsing SSE message:', error);
          }
        };

        eventSource.onerror = (error) => {
          logger.error('SSE connection error:', error);
          setIsConnected(false);
          hasJoinedRef.current = false; // Reset join status on disconnect
          
          // Don't auto-reconnect to prevent loops
          logger.info('SSE connection closed, not attempting reconnect to prevent loops');
        };
      } catch (error) {
        logger.error('Failed to establish SSE connection:', error);
      }
    };

    connectSSE();

    return () => {
      logger.info('Cleaning up SSE connection');
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        setIsConnected(false);
        hasJoinedRef.current = false; // Reset join status on cleanup
      }
    };
  }, [boardId, userId]); // Stable dependencies only

  // Broadcast drawing events (throttled)
  const broadcastDrawingStart = useCallback((line: DrawingLineData) => {
    if (!isConnected || !userId || !userName) return;

    fetch('/api/board/drawing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        boardId,
        userId,
        userName,
        line,
        action: 'start',
      }),
    }).catch(error => {
      logger.error('Failed to broadcast drawing start:', error);
    });
  }, [isConnected, boardId, userId, userName]);

  const broadcastDrawingUpdate = useCallback((line: DrawingLineData) => {
    if (!isConnected || !userId || !userName) return;

    // Throttle drawing updates to avoid spam
    fetch('/api/board/drawing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        boardId,
        userId,
        userName,
        line,
        action: 'update',
      }),
    }).catch(error => {
      logger.error('Failed to broadcast drawing update:', error);
    });
  }, [isConnected, boardId, userId, userName]);

  const broadcastDrawingComplete = useCallback((line: DrawingLineData) => {
    if (!isConnected || !userId || !userName) return;

    fetch('/api/board/drawing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        boardId,
        userId,
        userName,
        line,
        action: 'complete',
      }),
    }).catch(error => {
      logger.error('Failed to broadcast drawing complete:', error);
    });
  }, [isConnected, boardId, userId, userName]);
  const broadcastCursorMovement = useCallback((x: number, y: number) => {
    if (!isConnected || !userId || !userName) return;

    // Clear previous throttle
    if (cursorThrottleRef.current) {
      clearTimeout(cursorThrottleRef.current);
    }

    // Throttle cursor updates to avoid spam
    cursorThrottleRef.current = setTimeout(() => {
      fetch('/api/board/cursor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          boardId,
          userId,
          name: userName,
          x,
          y,
        }),
      }).catch(error => {
        logger.error('Failed to broadcast cursor movement:', error);
      });
    }, 50); // 50ms throttle for smooth movement
  }, [isConnected, boardId, userId, userName]);

  // Broadcast board element changes
  const broadcastElementAdd = useCallback((element: BoardElement) => {
    if (!isConnected || !userId) return;

    fetch('/api/board/element', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        boardId,
        action: 'add',
        element: {
          ...element,
          userId,
          timestamp: Date.now(),
        },
      }),
    }).catch(error => {
      logger.error('Failed to broadcast element add:', error);
    });
  }, [isConnected, boardId, userId]);

  const broadcastElementUpdate = useCallback((element: BoardElement) => {
    if (!isConnected || !userId) return;

    fetch('/api/board/element', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        boardId,
        action: 'update',
        element: {
          ...element,
          userId,
          timestamp: Date.now(),
        },
      }),
    }).catch(error => {
      logger.error('Failed to broadcast element update:', error);
    });
  }, [isConnected, boardId, userId]);

  const broadcastElementDelete = useCallback((elementId: string) => {
    if (!isConnected || !userId) return;

    fetch('/api/board/element', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        boardId,
        action: 'delete',
        elementId,
        userId,
        timestamp: Date.now(),
      }),
    }).catch(error => {
      logger.error('Failed to broadcast element delete:', error);
    });
  }, [isConnected, boardId, userId]);

  // Join board only once when connected (stable)
  useEffect(() => {
    // Only join if all conditions are met and we haven't joined yet
    if (!isConnected || !userId || !userName || hasJoinedRef.current) {
      return;
    }

    logger.info('Joining board once:', { boardId, userId, userName });
    hasJoinedRef.current = true;
    
    fetch('/api/board/join', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        boardId,
        user: {
          id: userId,
          name: userName,
        },
      }),
    }).catch(error => {
      logger.error('Failed to join board:', error);
      // Reset on error so user can retry
      hasJoinedRef.current = false;
    });
  }, [isConnected, boardId, userId, userName]);

  // Leave board ONLY on unmount (stable)
  useEffect(() => {
    const currentUserId = userId;
    const currentBoardId = boardId;
    
    return () => {
      // Only leave if we actually joined
      if (currentUserId && currentBoardId && hasJoinedRef.current) {
        logger.info('Leaving board on unmount:', { boardId: currentBoardId, userId: currentUserId });
        
        // Use beacon API for more reliable cleanup
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/board/leave', JSON.stringify({
            boardId: currentBoardId,
            userId: currentUserId,
          }));
        } else {
          fetch('/api/board/leave', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              boardId: currentBoardId,
              userId: currentUserId,
            }),
            keepalive: true, // Keep request alive during page unload
          }).catch(error => {
            logger.error('Failed to leave board:', error);
          });
        }
        
        hasJoinedRef.current = false;
      }
    };
  }, [boardId, userId]); // Capture current values but only run cleanup on unmount

  return {
    isConnected,
    cursors,
    broadcastCursorMovement,
    broadcastElementAdd,
    broadcastElementUpdate,
    broadcastElementDelete,
    broadcastDrawingStart,
    broadcastDrawingUpdate,
    broadcastDrawingComplete,
  };
}

export default useRealTimeCollaboration;
