/**
 * CRDT Awareness Protocol Implementation for Phase 3
 * Handles ephemeral state like cursors, user presence, and real-time interactions
 */

import * as Y from 'yjs';
import { Awareness } from 'y-protocols/awareness';

export interface UserCursor {
  x: number;
  y: number;
  userId: string;
  name: string;
  color?: string;
  isActive: boolean;
  lastActivity: number;
  currentTool?: string;
  isDrawing?: boolean;
  isSelecting?: boolean;
  activeElementId?: string;
  pressure?: number;
}

export interface UserPresence {
  userId: string;
  name: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: number;
  sessionDuration: number;
  connectionQuality: 'good' | 'fair' | 'poor';
  currentActivity?: string;
}

export interface AwarenessState {
  cursor?: UserCursor;
  presence?: UserPresence;
  selection?: {
    elementIds: string[];
    boundingBox?: { x: number; y: number; width: number; height: number };
  };
  editingState?: {
    elementId: string;
    type: 'text' | 'shape' | 'drawing';
    startTime: number;
  };
}

export class CRDTAwareness {
  public readonly awareness: Awareness;
  private listeners: Map<string, Set<(...args: any[]) => void>> = new Map();
  private cursorThrottle: NodeJS.Timeout | null = null;
  private presenceUpdateInterval: NodeJS.Timeout | null = null;

  constructor(
    private ydoc: Y.Doc,
    private config: {
      userId: string;
      userName: string;
      updateInterval?: number; // ms
      cursorThrottleMs?: number;
    }
  ) {
    this.awareness = new Awareness(ydoc);

    // Set initial user state
    this.awareness.setLocalStateField('user', {
      id: config.userId,
      name: config.userName,
      color: this.generateUserColor(config.userId),
    });

    this.setupListeners();
    this.startPresenceUpdates();
  }

  /**
   * Update cursor position with throttling
   */
  public updateCursor(cursor: Omit<UserCursor, 'userId' | 'name' | 'color' | 'lastActivity'>): void {
    if (this.cursorThrottle) return;

    const fullCursor: UserCursor = {
      ...cursor,
      userId: this.config.userId,
      name: this.config.userName,
      color: this.generateUserColor(this.config.userId),
      lastActivity: Date.now(),
    };

    this.awareness.setLocalStateField('cursor', fullCursor);

    this.cursorThrottle = setTimeout(() => {
      this.cursorThrottle = null;
    }, this.config.cursorThrottleMs || 100);
  }

  /**
   * Update user presence
   */
  public updatePresence(presence: Partial<UserPresence>): void {
    const currentPresence = this.awareness.getLocalState()?.presence as UserPresence;

    const updatedPresence: UserPresence = {
      ...currentPresence,
      ...presence,
      userId: this.config.userId,
      name: this.config.userName,
      status: presence.status || 'online',
      lastSeen: Date.now(),
      sessionDuration: currentPresence?.sessionDuration || 0,
      connectionQuality: presence.connectionQuality || currentPresence?.connectionQuality || 'good',
    };

    this.awareness.setLocalStateField('presence', updatedPresence);
  }

  /**
   * Update user selection
   */
  public updateSelection(selection: AwarenessState['selection']): void {
    this.awareness.setLocalStateField('selection', selection);
  }

  /**
   * Set editing state when user starts editing an element
   */
  public setEditingState(editingState: AwarenessState['editingState']): void {
    this.awareness.setLocalStateField('editingState', editingState);
  }

  /**
   * Clear editing state when user stops editing
   */
  public clearEditingState(): void {
    this.awareness.setLocalStateField('editingState', null);
  }

  /**
   * Get all user cursors except own
   */
  public getOtherCursors(): Record<string, UserCursor> {
    const cursors: Record<string, UserCursor> = {};

    this.awareness.getStates().forEach((state, clientId) => {
      if (clientId === this.awareness.clientID) return;

      const cursor = state.cursor as UserCursor;
      if (cursor && cursor.userId !== this.config.userId) {
        cursors[cursor.userId] = cursor;
      }
    });

    return cursors;
  }

  /**
   * Get all user presence data except own
   */
  public getOtherPresence(): Record<string, UserPresence> {
    const presence: Record<string, UserPresence> = {};

    this.awareness.getStates().forEach((state, clientId) => {
      if (clientId === this.awareness.clientID) return;

      const userPresence = state.presence as UserPresence;
      if (userPresence && userPresence.userId !== this.config.userId) {
        presence[userPresence.userId] = userPresence;
      }
    });

    return presence;
  }

  /**
   * Get users currently editing elements
   */
  public getEditingUsers(): Record<string, AwarenessState['editingState']> {
    const editing: Record<string, AwarenessState['editingState']> = {};

    this.awareness.getStates().forEach((state, clientId) => {
      if (clientId === this.awareness.clientID) return;

      const editingState = state.editingState as AwarenessState['editingState'];
      const user = state.user as { id: string; name: string };

      if (editingState && user) {
        editing[user.id] = editingState;
      }
    });

    return editing;
  }

  /**
   * Subscribe to awareness changes
   */
  public onAwarenessChange(callback: (changes: {
    added: number[];
    updated: number[];
    removed: number[];
  }) => void): () => void {
    this.awareness.on('change', callback);
    return () => this.awareness.off('change', callback);
  }

  /**
   * Subscribe to cursor changes
   */
  public onCursorsChange(callback: (cursors: Record<string, UserCursor>) => void): () => void {
    const handleChange = () => {
      callback(this.getOtherCursors());
    };

    this.awareness.on('change', handleChange);
    return () => this.awareness.off('change', handleChange);
  }

  /**
   * Subscribe to presence changes
   */
  public onPresenceChange(callback: (presence: Record<string, UserPresence>) => void): () => void {
    const handleChange = () => {
      callback(this.getOtherPresence());
    };

    this.awareness.on('change', handleChange);
    return () => this.awareness.off('change', handleChange);
  }

  /**
   * Get connection statistics
   */
  public getConnectionStats(): {
    connectedUsers: number;
    localClientId: number;
    totalClients: number;
  } {
    return {
      connectedUsers: this.awareness.getStates().size - 1, // Exclude self
      localClientId: this.awareness.clientID,
      totalClients: this.awareness.getStates().size,
    };
  }

  /**
   * Destroy and cleanup
   */
  public destroy(): void {
    if (this.cursorThrottle) {
      clearTimeout(this.cursorThrottle);
      this.cursorThrottle = null;
    }

    if (this.presenceUpdateInterval) {
      clearInterval(this.presenceUpdateInterval);
      this.presenceUpdateInterval = null;
    }

    this.awareness.destroy();
    this.listeners.clear();
  }

  // Private methods

  private setupListeners(): void {
    // Clean up inactive cursors
    this.awareness.on('change', () => {
      const now = Date.now();
      const states = this.awareness.getStates();

      states.forEach((state, clientId) => {
        const cursor = state.cursor as UserCursor;
        if (cursor && now - cursor.lastActivity > 30000) { // 30 seconds
          // Mark cursor as inactive
          if (clientId !== this.awareness.clientID) {
            // We can't modify other clients' state directly
            // This is handled by the UI layer filtering inactive cursors
          }
        }
      });
    });
  }

  private startPresenceUpdates(): void {
    const updateInterval = this.config.updateInterval || 30000; // 30 seconds

    this.presenceUpdateInterval = setInterval(() => {
      this.updatePresence({
        lastSeen: Date.now(),
        sessionDuration: (this.awareness.getLocalState()?.presence as UserPresence)?.sessionDuration + 0.5 || 0.5,
      });
    }, updateInterval);
  }

  private generateUserColor(userId: string): string {
    const colors = [
      "#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6",
      "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1"
    ];

    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash + userId.charCodeAt(i)) & 0xffffffff;
    }
    return colors[Math.abs(hash) % colors.length];
  }
}