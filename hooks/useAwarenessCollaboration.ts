"use client";

import { useEffect, useCallback, useState } from 'react';
import { useCRDTContext } from '@/lib/crdt/CRDTProvider';
import { UserCursor, UserPresence } from '@/lib/crdt/CRDTAwareness';
import { EnhancedCursor } from '@/types';
import { toast } from 'sonner';
import { createElement } from 'react';
import { UserPlus, UserMinus, Wifi, WifiOff } from 'lucide-react';

export interface UseAwarenessCollaborationProps {
  boardId: string;
  userId: string;
  userName: string;
  onCursorMove?: (cursors: Record<string, EnhancedCursor>) => void;
  onPresenceUpdate?: (presence: Record<string, UserPresence>) => void;
  onUserJoined?: (userId: string, userName: string) => void;
  onUserLeft?: (userId: string) => void;
}

export function useAwarenessCollaboration({
  boardId,
  userId,
  userName,
  onCursorMove,
  onPresenceUpdate,
  onUserJoined,
  onUserLeft,
}: UseAwarenessCollaborationProps) {
  const { document: crdtDoc, isConnected } = useCRDTContext();
  const [cursors, setCursors] = useState<Record<string, EnhancedCursor>>({});
  const [presence, setPresence] = useState<Record<string, UserPresence>>({});
  const [connectedUsers, setConnectedUsers] = useState<Set<string>>(new Set());

  // Helper function to convert UserCursor to EnhancedCursor
  const convertUserCursorToEnhancedCursor = useCallback((userCursor: UserCursor): EnhancedCursor => {
    return {
      ...userCursor,
      lastActivity: new Date(userCursor.lastActivity), // Convert timestamp to Date
      isTyping: false, // Default value, could be enhanced later
      trail: [], // Default empty trail
      velocity: { x: 0, y: 0 }, // Default velocity
    };
  }, []);

  // Initialize user presence when connected
  useEffect(() => {
    if (!crdtDoc || !isConnected) return;

    // Set initial presence
    crdtDoc.awareness.updatePresence({
      userId,
      name: userName,
      status: 'online',
      lastSeen: Date.now(),
      sessionDuration: 0,
      connectionQuality: 'good',
      currentActivity: 'Active',
    });

    // Show connection toast
    toast.success('Connected to live collaboration', {
      icon: createElement(Wifi, { size: 16 }),
      duration: 2000,
    });

    return () => {
      // Update presence to offline when disconnecting
      if (crdtDoc) {
        crdtDoc.awareness.updatePresence({
          status: 'offline',
          lastSeen: Date.now(),
          currentActivity: 'Disconnected',
        });
      }
    };
  }, [crdtDoc, isConnected, userId, userName]);

  // Subscribe to cursor changes
  useEffect(() => {
    if (!crdtDoc) return;

    const unsubscribe = crdtDoc.awareness.onCursorsChange((newCursors) => {
      // Convert UserCursor objects to EnhancedCursor objects
      const convertedCursors: Record<string, EnhancedCursor> = {};
      Object.entries(newCursors).forEach(([key, cursor]) => {
        convertedCursors[key] = convertUserCursorToEnhancedCursor(cursor);
      });

      setCursors(convertedCursors);
      onCursorMove?.(convertedCursors);
    });

    return unsubscribe;
  }, [crdtDoc, onCursorMove, convertUserCursorToEnhancedCursor]);

  // Subscribe to presence changes
  useEffect(() => {
    if (!crdtDoc) return;

    const unsubscribe = crdtDoc.awareness.onPresenceChange((newPresence) => {
      // Track user joins/leaves
      const currentUserIds = new Set(Object.keys(newPresence));
      const previousUserIds = connectedUsers;

      // Find newly joined users
      currentUserIds.forEach((id) => {
        if (!previousUserIds.has(id)) {
          const user = newPresence[id];
          if (user) {
            onUserJoined?.(user.userId, user.name);
            toast.success(`${user.name} joined the board`, {
              description: 'Collaboration is active.',
              icon: createElement(UserPlus, { size: 16 }),
              duration: 2500,
            });
          }
        }
      });

      // Find users who left
      previousUserIds.forEach((id) => {
        if (!currentUserIds.has(id)) {
          const user = presence[id];
          if (user) {
            onUserLeft?.(user.userId);
            toast.info(`${user.name} left the board`, {
              icon: createElement(UserMinus, { size: 16 }),
              duration: 2500,
            });
          }
        }
      });

      setConnectedUsers(currentUserIds);
      setPresence(newPresence);
      onPresenceUpdate?.(newPresence);
    });

    return unsubscribe;
  }, [crdtDoc, onPresenceUpdate, onUserJoined, onUserLeft, connectedUsers, presence]);

  // Handle connection status changes
  useEffect(() => {
    if (!crdtDoc) return;

    const handleConnectionChange = () => {
      const connected = crdtDoc.isConnected();
      if (!connected) {
        toast.error('Disconnected from collaboration', {
          icon: createElement(WifiOff, { size: 16 }),
          duration: 3000,
        });
      }
    };

    crdtDoc.on('connection', handleConnectionChange);

    return () => {
      crdtDoc.off('connection', handleConnectionChange);
    };
  }, [crdtDoc]);

  // Simplified broadcast functions using CRDT awareness
  const broadcastCursorMovement = useCallback((
    x: number,
    y: number,
    currentTool?: string,
    isDrawing?: boolean,
    isSelecting?: boolean,
    activeElementId?: string,
    pressure?: number
  ) => {
    if (!crdtDoc || !isConnected) return;

    crdtDoc.awareness.updateCursor({
      x,
      y,
      isActive: true,
      currentTool,
      isDrawing,
      isSelecting,
      activeElementId,
      pressure,
    });
  }, [crdtDoc, isConnected]);

  const updateUserPresence = useCallback((updates: Partial<UserPresence>) => {
    if (!crdtDoc || !isConnected) return;

    crdtDoc.awareness.updatePresence({
      ...updates,
      lastSeen: Date.now(),
    });
  }, [crdtDoc, isConnected]);

  const setEditingElement = useCallback((elementId: string, type: 'text' | 'shape' | 'drawing') => {
    if (!crdtDoc || !isConnected) return;

    crdtDoc.awareness.setEditingState({
      elementId,
      type,
      startTime: Date.now(),
    });
  }, [crdtDoc, isConnected]);

  const clearEditingElement = useCallback(() => {
    if (!crdtDoc || !isConnected) return;

    crdtDoc.awareness.clearEditingState();
  }, [crdtDoc, isConnected]);

  const updateSelection = useCallback((elementIds: string[], boundingBox?: { x: number; y: number; width: number; height: number }) => {
    if (!crdtDoc || !isConnected) return;

    crdtDoc.awareness.updateSelection({
      elementIds,
      boundingBox,
    });
  }, [crdtDoc, isConnected]);

  const getConnectionStats = useCallback(() => {
    return crdtDoc?.awareness.getConnectionStats() || {
      connectedUsers: 0,
      localClientId: 0,
      totalClients: 0,
    };
  }, [crdtDoc]);

  const getEditingUsers = useCallback(() => {
    return crdtDoc?.awareness.getEditingUsers() || {};
  }, [crdtDoc]);

  return {
    // State
    isConnected,
    cursors,
    presence,
    connectedUsers: connectedUsers.size,

    // Actions - simplified interface
    broadcastCursorMovement,
    updateUserPresence,
    setEditingElement,
    clearEditingElement,
    updateSelection,

    // Utilities
    getConnectionStats,
    getEditingUsers,
  };
}