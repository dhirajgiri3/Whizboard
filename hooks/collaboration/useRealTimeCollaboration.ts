"use client";

import { useEffect, useRef, useState, useCallback, createElement } from 'react';
import api from '@/lib/http/axios';
import { toast } from 'sonner';
import { useBoardContext } from '@/lib/context/BoardContext';
import logger from '@/lib/logger/logger';
import { User, EnhancedCursor, UserPresenceData } from '@/types';
import { UserPlus, UserMinus, Wifi, WifiOff, Type, Shapes, Pencil } from 'lucide-react';

type RealtimeElement = {
  id: string;
  type: 'line' | 'shape' | 'text';
  data: Record<string, unknown>;
};

export interface UseRealTimeCollaborationProps {
  boardId: string;
  userId: string;
  userName: string;
  isOwner: boolean;
  onBoardUpdate?: (elements: RealtimeElement[]) => void;
  onCursorMove?: (cursors: Record<string, EnhancedCursor>) => void;
  onElementAdded?: (element: RealtimeElement) => void;
  onElementUpdated?: (element: RealtimeElement) => void;
  onElementDeleted?: (elementId: string) => void;
  onUserPresenceUpdate?: (presence: UserPresenceData) => void;
}

interface RealTimeEvent {
  type: string;
  payload: any;
}

// Local interface for drawing data used in real-time events
interface DrawingLineData {
  id: string;
  points: number[];
  tool: string;
  color: string;
  strokeWidth: number;
}

function isDrawingLineData(obj: any): obj is DrawingLineData {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    Array.isArray(obj.points) &&
    typeof obj.tool === 'string' &&
    typeof obj.color === 'string' &&
    typeof obj.strokeWidth === 'number'
  );
}

// Temporarily define Collaborator interface if not fully defined in types/index.ts yet
interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  joinedAt: string;
  presence?: {
    status: string;
    lastSeen: Date;
    sessionDuration: number;
    connectionQuality: string;
  };
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
  onUserPresenceUpdate,
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
  const [cursors, setCursors] = useState<Record<string, EnhancedCursor>>({});
  const cursorThrottleRef = useRef<NodeJS.Timeout | null>(null);
  const handleRealTimeEventRef = useRef<((event: RealTimeEvent) => void) | null>(null);
  const hasJoinedRef = useRef(false);
  
  // Add throttling refs for drawing updates
  const drawingUpdateThrottleRef = useRef<NodeJS.Timeout | null>(null);
  const pendingDrawingUpdateRef = useRef<DrawingLineData | null>(null);
  const lastDrawingUpdateRef = useRef<number>(0);
  
  // Constants for throttling - Optimized for performance and reduced server load
  const DRAWING_UPDATE_THROTTLE_MS = 150; // Balanced for smooth drawing with reduced API calls
  const CURSOR_THROTTLE_MS = 300; // Reduced cursor update frequency
  const PRESENCE_UPDATE_THROTTLE_MS = 30000; // Reduce presence updates to every 30 seconds

  // State for user presence and activity
  const [userPresence, setUserPresence] = useState<UserPresenceData | null>(null);
  const activityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityTimeRef = useRef<number>(Date.now());
  const sessionDurationRef = useRef<number>(0); // In minutes
  const totalActionsRef = useRef<number>(0);

  // Helper to update local user presence and broadcast
  const updateAndBroadcastPresence = useCallback((updates: Partial<UserPresenceData>) => {
    setUserPresence(prev => {
      const newPresence = {
        ...(prev || {
          userId,
          userName,
          userEmail: 'unknown', // Will be filled on join/login
          status: 'online',
          lastSeen: new Date(),
          sessionDuration: 0,
          connectionQuality: 'good',
          deviceInfo: {
            type: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
            browser: navigator.userAgent.includes('Firefox') ? 'Firefox' : navigator.userAgent.includes('Safari') ? 'Safari' : 'Chrome', // Simplified detection
            os: navigator.platform,
            screenSize: { width: window.innerWidth, height: window.innerHeight },
          },
        }),
        ...updates,
        lastSeen: new Date(), // Always update last seen on activity
      } as UserPresenceData;
      broadcastUserPresence(newPresence);
      return newPresence;
    });
  }, [boardId, userId, userName]);

  // Broadcast user presence
  const broadcastUserPresence = useCallback((presenceData: UserPresenceData) => {
    if (!isConnected) return;
    api.post('/api/board/user-presence', { boardId, userId, presence: presenceData }).catch(error => {
      logger.error('Failed to broadcast user presence:', error);
    });
  }, [isConnected, boardId, userId]);

  // Handle real-time events - optimized to prevent excessive re-renders
  const handleRealTimeEvent = useCallback((event: RealTimeEvent) => {
    logger.debug('Received real-time event:', event);

    switch (event.type) {
      case 'connected':
        logger.info('SSE connection confirmed');
        setIsConnected(true);
        toast.success('Connected to live collaboration', { icon: createElement(Wifi, { size: 16 }) , duration: 2000 });
        // On reconnection, rejoin the board
        if (hasJoinedRef.current) {
          joinBoard();
        }
        break;

      case 'boardUpdates':
        if (onBoardUpdate && Array.isArray(event.payload.elements)) {
          onBoardUpdate(event.payload.elements as RealtimeElement[]);
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
            presence: { // Initial presence for joined user
              status: 'online',
              lastSeen: new Date(),
              sessionDuration: 0,
              connectionQuality: 'good',
            }
          } as Collaborator); // Cast to Collaborator

          toast.success(`${event.payload.name || 'User'} joined the board`, {
            description: 'Collaboration is active.',
            icon: createElement(UserPlus, { size: 16 }),
            duration: 2500,
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

          toast.info('User left the board', { icon: createElement(UserMinus, { size: 16 }) , duration: 2500 });
        }
        break;

      case 'cursorMovement':
        if (typeof event.payload.userId === 'string' && event.payload.userId !== userId) {
          const nowTs = Date.now();
          const incomingX = (event.payload.x as number) || 0;
          const incomingY = (event.payload.y as number) || 0;
          const incomingId = event.payload.userId as string;
          
          setCursors(prev => {
            const prevCursor = prev[incomingId];
            const lastTs = prevCursor?.lastActivity ? prevCursor.lastActivity.getTime() : nowTs;
            const dt = Math.max(1, nowTs - lastTs);
            const dx = prevCursor ? incomingX - prevCursor.x : 0;
            const dy = prevCursor ? incomingY - prevCursor.y : 0;
            const velocity = { x: dx / dt, y: dy / dt };
            
            const newTrail = [
              ...((prevCursor?.trail as Array<{ x: number; y: number; timestamp: number }> | undefined) || []),
              { x: incomingX, y: incomingY, timestamp: nowTs }
            ].slice(-10);

            const userCursor: EnhancedCursor = {
              x: incomingX,
              y: incomingY,
              userId: incomingId,
              name: (event.payload.name as string) || 'Unknown User',
              color: event.payload.color as string | undefined,
              isActive: true,
              lastActivity: new Date(nowTs),
              currentTool: event.payload.currentTool as string | undefined,
              isDrawing: event.payload.isDrawing as boolean | undefined,
              isSelecting: event.payload.isSelecting as boolean | undefined,
              activeElementId: event.payload.activeElementId as string | undefined,
              pressure: event.payload.pressure as number | undefined,
              velocity,
              trail: newTrail,
            };

            const next = { ...prev, [incomingId]: userCursor };
            if (onCursorMove) {
              onCursorMove(next);
            }
            return next;
          });
        }
        break;

      case 'collaboratorInvited':
        if (isOwner && typeof event.payload.inviteeEmail === 'string') {
          incrementPendingInvitations();
          toast.success(`Invitation sent to ${event.payload.inviteeEmail}`, {
            description: 'They will receive an email with a link to join.',
            icon: createElement(UserPlus, { size: 16 }),
            duration: 2500,
          });
        }
        break;

      case 'collaboratorJoined':
        if (event.payload.collaborator && 
            typeof (event.payload.collaborator as User).id === 'string' && 
            (event.payload.collaborator as User).id !== userId) {
          const collaborator = event.payload.collaborator as User;
          addCollaborator({
            id: collaborator.id,
            name: collaborator.name || 'Unknown User',
            email: collaborator.email || '',
            avatar: collaborator.avatar,
            isOnline: true,
            joinedAt: new Date().toISOString(),
            presence: { // Initial presence for newly joined collaborator
              status: 'online',
              lastSeen: new Date(),
              sessionDuration: 0,
              connectionQuality: 'good',
            }
          } as Collaborator); // Cast to Collaborator

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
            toast.success(`${email} accepted your invitation`, { icon: createElement(UserPlus, { size: 16 }), duration: 2500 });
            decrementPendingInvitations();
          } else if (status === 'declined') {
            toast.info(`${email} declined your invitation`, { duration: 2500 });
            decrementPendingInvitations();
          }
        }
        break;

      case 'elementAdded':
        if (typeof event.payload.userId === 'string' && 
            event.payload.userId !== userId && 
            onElementAdded &&
            typeof event.payload.id === 'string') {
          onElementAdded(event.payload as unknown as RealtimeElement);
        }
        break;

      case 'elementUpdated':
        if (typeof event.payload.userId === 'string' && 
            event.payload.userId !== userId && 
            onElementUpdated &&
            typeof event.payload.id === 'string') {
          onElementUpdated(event.payload as unknown as RealtimeElement);
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
          // Create the line immediately so subsequent updates have a target to modify
          if (onElementAdded && isDrawingLineData(event.payload.line)) {
            const lineData = event.payload.line;
            const startedElement: RealtimeElement = {
              id: lineData.id,
              type: 'line',
              data: lineData as unknown as Record<string, unknown>,
            };
            onElementAdded(startedElement);
          }
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
            const liveElement: RealtimeElement = {
              id: lineData.id,
              type: 'line',
              data: lineData as unknown as Record<string, unknown>,
            };
            onElementUpdated(liveElement);
          } else if (onElementAdded) {
            // Fallback: if there is no updater, ensure we at least add/replace the line
            const lineData = event.payload.line;
            const fallbackElement: RealtimeElement = {
              id: lineData.id,
              type: 'line',
              data: lineData as unknown as Record<string, unknown>,
            };
            onElementAdded(fallbackElement);
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
            const completedElement: RealtimeElement = {
              id: lineData.id,
              type: 'line',
              data: lineData as unknown as Record<string, unknown>,
            };
            onElementAdded(completedElement);
          }
        }
        break;

      case 'textElementCreated':
        if (typeof event.payload.userId === 'string' && 
            event.payload.userId !== userId &&
            event.payload.textElement) {
          // Handle text element creation from other users
          if (onElementAdded) {
            const textElement: RealtimeElement = {
              id: event.payload.textElement.id,
              type: 'text',
              data: event.payload.textElement as unknown as Record<string, unknown>,
            };
            onElementAdded(textElement);
          }

          toast.info(`${event.payload.userName || 'User'} added text`, { icon: createElement(Type, { size: 16 }), duration: 2000 });
        }
        break;

      case 'textElementUpdated':
        if (typeof event.payload.userId === 'string' && 
            event.payload.userId !== userId &&
            event.payload.textElement) {
          // Handle text element updates from other users
          if (onElementUpdated) {
            const textElement: RealtimeElement = {
              id: event.payload.textElement.id,
              type: 'text',
              data: event.payload.textElement as unknown as Record<string, unknown>,
            };
            onElementUpdated(textElement);
          }
        }
        break;

      case 'textElementDeleted':
        if (typeof event.payload.userId === 'string' && 
            event.payload.userId !== userId &&
            typeof event.payload.textElementId === 'string') {
          // Handle text element deletion from other users
          if (onElementDeleted) {
            onElementDeleted(event.payload.textElementId);
          }

          toast.info(`${event.payload.userName || 'User'} deleted text`, { icon: createElement(Type, { size: 16 }), duration: 2000 });
        }
        break;

      case 'textElementEditingStarted':
        if (typeof event.payload.userId === 'string' && 
            event.payload.userId !== userId &&
            typeof event.payload.textElementId === 'string') {
          logger.debug(`User ${event.payload.userName} started editing text element ${event.payload.textElementId}`);
          
          toast.info(`${event.payload.userName || 'User'} started editing text`, {
            duration: 2000,
          });
        }
        break;

      case 'textElementEditingFinished':
        if (typeof event.payload.userId === 'string' && 
            event.payload.userId !== userId &&
            typeof event.payload.textElementId === 'string') {
          logger.debug(`User ${event.payload.userName} finished editing text element ${event.payload.textElementId}`);
        }
        break;

      // Shape-specific events
      case 'shapeElementCreated':
        if (typeof event.payload.userId === 'string' && 
            event.payload.userId !== userId &&
            event.payload.shapeElement) {
          // Handle shape element creation from other users
          if (onElementAdded) {
            const shapeElement: RealtimeElement = {
              id: event.payload.shapeElement.id,
              type: 'shape',
              data: event.payload.shapeElement as unknown as Record<string, unknown>,
            };
            onElementAdded(shapeElement);
          }

          toast.info(`${event.payload.userName || 'User'} added a ${event.payload.shapeElement?.shapeType || 'shape'}`, { icon: createElement(Shapes, { size: 16 }), duration: 2000 });
        }
        break;

      case 'shapeElementUpdated':
        if (typeof event.payload.userId === 'string' && 
            event.payload.userId !== userId &&
            event.payload.shapeElement) {
          // Handle shape element updates from other users
          if (onElementUpdated) {
            const shapeElement: RealtimeElement = {
              id: event.payload.shapeElement.id,
              type: 'shape',
              data: event.payload.shapeElement as unknown as Record<string, unknown>,
            };
            onElementUpdated(shapeElement);
          }
        }
        break;

      case 'shapeElementDeleted':
        if (typeof event.payload.userId === 'string' && 
            event.payload.userId !== userId &&
            typeof event.payload.shapeElementId === 'string') {
          // Handle shape element deletion from other users
          if (onElementDeleted) {
            onElementDeleted(event.payload.shapeElementId);
          }

          toast.info(`${event.payload.userName || 'User'} deleted a shape`, { icon: createElement(Shapes, { size: 16 }), duration: 2000 });
        }
        break;

      case 'shapeElementTransformed':
        if (typeof event.payload.userId === 'string' && 
            event.payload.userId !== userId &&
            event.payload.shapeElement) {
          // Handle shape element transformation from other users
          if (onElementUpdated) {
            const shapeElement: RealtimeElement = {
              id: event.payload.shapeElement.id,
              type: 'shape',
              data: event.payload.shapeElement as unknown as Record<string, unknown>,
            };
            onElementUpdated(shapeElement);
          }
          
          logger.debug(`User ${event.payload.userName} transformed shape element ${event.payload.shapeElement.id}`);
        }
        break;

      case 'userPresenceUpdate':
        if (onUserPresenceUpdate && event.payload.userId && event.payload.userId !== userId) {
          onUserPresenceUpdate(event.payload.presence as UserPresenceData);
          // Update collaborator status in context
          updateCollaboratorStatus(event.payload.userId, event.payload.presence.status === 'online');
        }
        break;

      case 'collaborationMetricsUpdate':
        // Handle metrics updates
        logger.debug('Collaboration metrics update:', event.payload);
        break;

      case 'commentAdded':
      case 'commentResolved':
      case 'annotationAdded':
      case 'discussionStarted':
      case 'permissionUpdated':
      case 'auditLogEntry':
        // Future handling for these events
        logger.info(`Received ${event.type} event:`, event.payload);
        break;

      default:
        logger.debug('Unknown event type:', event.type);
    }
  }, [
    userId, 
    isOwner, 
    addCollaborator, 
    removeCollaborator, 
    updateCollaboratorStatus,
    incrementPendingInvitations, 
    decrementPendingInvitations, 
    onBoardUpdate, 
    onCursorMove,
    onElementAdded,
    onElementUpdated,
    onElementDeleted,
    onUserPresenceUpdate
    // Removed cursors from dependency array to prevent infinite loops
  ]);

  handleRealTimeEventRef.current = handleRealTimeEvent;

  // Connection and disconnection logic
  useEffect(() => {
    if (!boardId || !userId) return;

    // Only establish SSE if not already connected
    if (eventSourceRef.current && eventSourceRef.current.readyState === EventSource.OPEN) {
      setIsConnected(true);
      return;
    }

    let reconnectTimeoutId: NodeJS.Timeout | null = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 10;

    const getReconnectDelay = (attempt: number): number => {
      // Exponential backoff with jitter: min 1s, max 30s
      const baseDelay = Math.min(1000 * Math.pow(2, attempt), 30000);
      const jitter = Math.random() * 1000;
      return baseDelay + jitter;
    };

    const connectSSE = () => {
      logger.info(`Attempting to connect to SSE for board ${boardId} and user ${userId} (attempt ${reconnectAttempts + 1})`);
      const eventSource = new EventSource(`/api/graphql/sse?boardId=${boardId}&userId=${userId}`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        logger.info('SSE connection opened.');
        setIsConnected(true);
        reconnectAttempts = 0; // Reset attempts on successful connection

        // Initial user presence broadcast
        updateAndBroadcastPresence({
          userEmail: userId, // Assuming userId is email for now
          status: 'online',
          sessionDuration: 0,
        });
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (handleRealTimeEventRef.current) {
            handleRealTimeEventRef.current(data);
          }
        } catch (error) {
          logger.error('Error parsing SSE message:', error);
        }
      };

      eventSource.onerror = (error) => {
        logger.error('SSE Error:', error);
        eventSource.close();
        setIsConnected(false);

        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts < maxReconnectAttempts) {
          const delay = getReconnectDelay(reconnectAttempts);
          logger.info(`Reconnecting SSE in ${Math.round(delay)}ms (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);

          reconnectTimeoutId = setTimeout(() => {
            reconnectAttempts++;
            connectSSE();
          }, delay);
        } else {
          logger.error('SSE max reconnection attempts reached. Manual refresh required.');
        }
      };
    };

    connectSSE();

    return () => {
      logger.info('Closing SSE connection.');
      if (reconnectTimeoutId) {
        clearTimeout(reconnectTimeoutId);
      }
      eventSourceRef.current?.close();
      setIsConnected(false);
    };
  }, [boardId, userId, updateAndBroadcastPresence]);

  // Join/Leave board API calls (stable)
  const joinBoard = useCallback(() => {
    if (!isConnected || !boardId || !userId || !userName || hasJoinedRef.current) return;

    logger.info('Joining board once:', { boardId, userId, userName });
    hasJoinedRef.current = true;
    
    api.post('/api/board/join', { boardId, user: { id: userId, name: userName } }).catch(error => {
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
          api.post('/api/board/leave', { boardId: currentBoardId, userId: currentUserId }).catch(error => {
            logger.error('Failed to leave board:', error);
          });
        }
        
        hasJoinedRef.current = false;
      }
    };
  }, [boardId, userId]); // Capture current values but only run cleanup on unmount

  // Activity tracking and presence updates
  useEffect(() => {
    if (!isConnected) return;

    // Store refs to track cleanup state
    let activityThrottleTimeout: NodeJS.Timeout | null = null;
    let mounted = true;

    // Start activity timer
    activityTimerRef.current = setInterval(() => {
      if (!mounted) return; // Prevent updates after unmount

      const now = Date.now();
      const idleTime = (now - lastActivityTimeRef.current) / 1000; // in seconds

      let status: UserPresenceData['status'] = 'online';
      let currentActivity = userPresence?.currentActivity;

      if (idleTime > 300) { // 5 minutes idle
        status = 'away';
        currentActivity = 'Idle';
      } else if (idleTime > 600) { // 10 minutes idle
        status = 'offline'; // Mark as offline if very long idle
        currentActivity = 'Disconnected';
      }

      sessionDurationRef.current += 1; // Increment session duration every minute
      updateAndBroadcastPresence({
        status,
        currentActivity,
        sessionDuration: sessionDurationRef.current,
        // connectionQuality: calculateConnectionQuality(), // Implement this based on network stats
      });
    }, 60000); // Update every minute

    const handleUserActivity = () => {
      if (!mounted) return; // Prevent updates after unmount

      lastActivityTimeRef.current = Date.now();
      if (userPresence?.status !== 'online') {
        updateAndBroadcastPresence({ status: 'online', currentActivity: 'Active' });
      }
      totalActionsRef.current += 1; // Increment total actions on any activity
    };

    // Throttle activity events to prevent excessive calls
    const throttledActivityHandler = () => {
      if (activityThrottleTimeout || !mounted) return;
      activityThrottleTimeout = setTimeout(() => {
        if (mounted) {
          handleUserActivity();
        }
        activityThrottleTimeout = null;
      }, 1000); // Throttle to once per second
    };

    window.addEventListener('mousemove', throttledActivityHandler, { passive: true });
    window.addEventListener('keydown', handleUserActivity, { passive: true });
    window.addEventListener('click', handleUserActivity, { passive: true });

    return () => {
      mounted = false; // Mark as unmounted

      if (activityTimerRef.current) {
        clearInterval(activityTimerRef.current);
        activityTimerRef.current = null;
      }
      if (activityThrottleTimeout) {
        clearTimeout(activityThrottleTimeout);
        activityThrottleTimeout = null;
      }
      window.removeEventListener('mousemove', throttledActivityHandler);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
    };
  }, [isConnected, updateAndBroadcastPresence, userPresence?.status]);

  // Broadcast cursor movement with enhanced data
  const broadcastCursorMovement = useCallback((x: number, y: number, currentTool?: string, isDrawing?: boolean, isSelecting?: boolean, activeElementId?: string, pressure?: number) => {
    if (!isConnected || !userId || !userName) return;

    if (cursorThrottleRef.current) {
      clearTimeout(cursorThrottleRef.current);
    }

    cursorThrottleRef.current = setTimeout(() => {
      const cursorData: EnhancedCursor = {
        x,
        y,
        userId,
        name: userName,
        isActive: true,
        lastActivity: new Date(),
        currentTool,
        isDrawing,
        isSelecting,
        activeElementId,
        pressure,
        // velocity: calculateVelocity(), // Future: implement velocity calculation
        // trail: getCursorTrail(), // Future: implement cursor trail
      };

      api.post('/api/board/cursor', { boardId, ...cursorData }).catch(error => {
        logger.error('Failed to broadcast cursor movement:', error);
      });
    }, CURSOR_THROTTLE_MS);
  }, [isConnected, boardId, userId, userName]);

  // Broadcast text element events
  const broadcastTextElementCreate = useCallback((textElement: any) => {
    if (!isConnected || !userId || !userName) return;

    api.post('/api/board/text', { boardId, userId, userName, textElement, action: 'create' }).catch(error => {
      logger.error('Failed to broadcast text element create:', error);
    });
  }, [isConnected, boardId, userId, userName]);

  const broadcastTextElementUpdate = useCallback((textElement: any) => {
    if (!isConnected || !userId || !userName) return;

    api.post('/api/board/text', { boardId, userId, userName, textElement, action: 'update' }).catch(error => {
      logger.error('Failed to broadcast text element update:', error);
    });
  }, [isConnected, boardId, userId, userName]);

  const broadcastTextElementDelete = useCallback((textElementId: string) => {
    if (!isConnected || !userId || !userName) return;

    api.post('/api/board/text', { boardId, userId, userName, textElement: { id: textElementId }, action: 'delete' }).catch(error => {
      logger.error('Failed to broadcast text element delete:', error);
    });
  }, [isConnected, boardId, userId, userName]);

  const broadcastTextElementEditStart = useCallback((textElementId: string) => {
    if (!isConnected || !userId || !userName) return;

    api.post('/api/board/text', { boardId, userId, userName, textElement: { id: textElementId }, action: 'startEdit' }).catch(error => {
      logger.error('Failed to broadcast text element edit start:', error);
    });
  }, [isConnected, boardId, userId, userName]);

  const broadcastTextElementEditFinish = useCallback((textElementId: string) => {
    if (!isConnected || !userId || !userName) return;

    api.post('/api/board/text', { boardId, userId, userName, textElement: { id: textElementId }, action: 'finishEdit' }).catch(error => {
      logger.error('Failed to broadcast text element edit finish:', error);
    });
  }, [isConnected, boardId, userId, userName]);

  const broadcastDrawingStart = useCallback((line: DrawingLineData) => {
    if (!isConnected || !userId || !userName) return;
    
    // Immediately send the start event
    api.post('/api/board/drawing', { boardId, userId, userName, line, action: 'start' }).catch(error => {
      logger.error('Failed to broadcast drawing start:', error);
    });
  }, [isConnected, boardId, userId, userName]);

  const broadcastDrawingUpdate = useCallback((line: DrawingLineData) => {
    if (!isConnected || !userId || !userName) return;
    
    const now = Date.now();
    // Throttle drawing updates
    if (now - lastDrawingUpdateRef.current < DRAWING_UPDATE_THROTTLE_MS) {
      pendingDrawingUpdateRef.current = line;
      return;
    }

    lastDrawingUpdateRef.current = now;
    pendingDrawingUpdateRef.current = null;

    api.post('/api/board/drawing', { boardId, userId, userName, line, action: 'update' }).catch(error => {
      logger.error('Failed to broadcast drawing update:', error);
    });

    // If there was a pending update, schedule it for the next interval
    if (drawingUpdateThrottleRef.current) {
      clearTimeout(drawingUpdateThrottleRef.current);
    }
    drawingUpdateThrottleRef.current = setTimeout(() => {
      if (pendingDrawingUpdateRef.current) {
        broadcastDrawingUpdate(pendingDrawingUpdateRef.current);
        pendingDrawingUpdateRef.current = null;
      }
    }, DRAWING_UPDATE_THROTTLE_MS);

  }, [isConnected, boardId, userId, userName]);

  const broadcastDrawingComplete = useCallback((line: DrawingLineData) => {
    if (!isConnected || !userId || !userName) return;

    // Ensure any pending updates are sent as part of the complete event
    if (drawingUpdateThrottleRef.current) {
      clearTimeout(drawingUpdateThrottleRef.current);
      drawingUpdateThrottleRef.current = null;
    }
    if (pendingDrawingUpdateRef.current) {
      // Use the last pending update for the complete event to ensure we have the latest points
      line = { ...line, points: pendingDrawingUpdateRef.current.points };
      pendingDrawingUpdateRef.current = null;
    }

    // Use requestAnimationFrame to ensure the line is fully rendered before broadcasting
    requestAnimationFrame(() => {
      api.post('/api/board/drawing', { boardId, userId, userName, line, action: 'complete' }).catch(error => {
        logger.error('Failed to broadcast drawing complete:', error);
      });
    });
  }, [isConnected, boardId, userId, userName]);

  const broadcastElementUpdate = useCallback((element: any) => {
    if (!isConnected || !userId || !userName) return;

    api.post('/api/board/element', { boardId, userId, userName, element, action: 'update' }).catch(error => {
      logger.error('Failed to broadcast element update:', error);
    });
  }, [isConnected, boardId, userId, userName]);

  const broadcastElementDelete = useCallback((elementId: string) => {
    if (!isConnected || !userId || !userName) return;

    api.post('/api/board/element', { boardId, userId, userName, elementId, action: 'delete' }).catch(error => {
      logger.error('Failed to broadcast element delete:', error);
    });
  }, [isConnected, boardId, userId, userName]);

  const broadcastShapeElementCreate = useCallback((shapeElement: any) => {
    if (!isConnected || !userId || !userName) return;

    api.post('/api/board/shape', { boardId, userId, userName, shapeElement, action: 'create' }).catch(error => {
      logger.error('Failed to broadcast shape element create:', error);
    });
  }, [isConnected, boardId, userId, userName]);

  const broadcastShapeElementUpdate = useCallback((shapeElement: any) => {
    if (!isConnected || !userId || !userName) return;

    api.post('/api/board/shape', { boardId, userId, userName, shapeElement, action: 'update' }).catch(error => {
      logger.error('Failed to broadcast shape element update:', error);
    });
  }, [isConnected, boardId, userId, userName]);

  const broadcastShapeElementDelete = useCallback((shapeElementId: string) => {
    if (!isConnected || !userId || !userName) return;

    api.post('/api/board/shape', { boardId, userId, userName, shapeElement: { id: shapeElementId }, action: 'delete' }).catch(error => {
      logger.error('Failed to broadcast shape element delete:', error);
    });
  }, [isConnected, boardId, userId, userName]);

  const broadcastShapeElementTransform = useCallback((shapeElement: any) => {
    if (!isConnected || !userId || !userName) return;

    api.post('/api/board/shape', { boardId, userId, userName, shapeElement, action: 'transform' }).catch(error => {
      logger.error('Failed to broadcast shape element transform:', error);
    });
  }, [isConnected, boardId, userId, userName]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (cursorThrottleRef.current) {
        clearTimeout(cursorThrottleRef.current);
        cursorThrottleRef.current = null;
      }
      // Add cleanup for drawing throttle
      if (drawingUpdateThrottleRef.current) {
        clearTimeout(drawingUpdateThrottleRef.current);
        drawingUpdateThrottleRef.current = null;
      }
    };
  }, []);

  return {
    isConnected,
    cursors,
    userPresence,
    broadcastCursorMovement,
    broadcastTextElementCreate,
    broadcastTextElementUpdate,
    broadcastTextElementDelete,
    broadcastTextElementEditStart,
    broadcastTextElementEditFinish,
    broadcastDrawingStart,
    broadcastDrawingUpdate,
    broadcastDrawingComplete,
    broadcastElementUpdate,
    broadcastElementDelete,
    broadcastShapeElementCreate,
    broadcastShapeElementUpdate,
    broadcastShapeElementDelete,
    updateAndBroadcastPresence, // Expose for external updates
  };
}
