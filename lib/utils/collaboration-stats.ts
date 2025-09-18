/**
 * Collaboration Statistics Utility
 * 
 * This utility tracks and reports real-time collaboration metrics
 * such as active users, synchronization events, and latency.
 */

// Types of collaboration events we track
export enum CollaborationEventType {
  USER_JOINED = 'user_joined',
  USER_LEFT = 'user_left',
  CURSOR_MOVED = 'cursor_moved',
  ELEMENT_CREATED = 'element_created',
  ELEMENT_UPDATED = 'element_updated',
  ELEMENT_DELETED = 'element_deleted',
  SYNC_STARTED = 'sync_started',
  SYNC_COMPLETED = 'sync_completed',
  SYNC_FAILED = 'sync_failed',
  CONNECTION_ESTABLISHED = 'connection_established',
  CONNECTION_LOST = 'connection_lost',
  CONNECTION_RECONNECTED = 'connection_reconnected',
}

// Interface for a collaboration event
export interface CollaborationEvent {
  type: CollaborationEventType | string;
  timestamp: number;
  boardId?: string;
  userId?: string;
  username?: string;
  elementId?: string;
  elementType?: string;
  latency?: number;
  connectionQuality?: 'excellent' | 'good' | 'fair' | 'poor';
  additionalData?: Record<string, any>;
}

// Interface for board statistics
export interface BoardStatistics {
  boardId: string;
  activeUsers: Map<string, {
    userId: string;
    username: string;
    lastActive: number;
    isActive: boolean;
    cursorPosition?: { x: number; y: number };
  }>;
  eventCounts: Record<string, number>;
  averageLatency: number;
  latencySamples: number[];
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  elementCounts: Record<string, number>;
  lastUpdated: number;
}

// Store statistics in memory
const boardStats: Map<string, BoardStatistics> = new Map();

// Configuration
const config = {
  // Consider a user inactive after this many milliseconds
  userInactivityThreshold: 60000, // 1 minute
  // Maximum number of latency samples to keep
  maxLatencySamples: 100,
  // Thresholds for connection quality (in ms)
  connectionQualityThresholds: {
    excellent: 100, // < 100ms is excellent
    good: 250,      // < 250ms is good
    fair: 500,      // < 500ms is fair
    poor: Infinity, // >= 500ms is poor
  },
};

/**
 * Get or create statistics for a board
 * @param boardId Board ID
 * @returns Board statistics object
 */
const getOrCreateBoardStats = (boardId: string): BoardStatistics => {
  if (!boardStats.has(boardId)) {
    boardStats.set(boardId, {
      boardId,
      activeUsers: new Map(),
      eventCounts: {},
      averageLatency: 0,
      latencySamples: [],
      connectionQuality: 'excellent',
      elementCounts: {},
      lastUpdated: Date.now(),
    });
  }
  
  return boardStats.get(boardId)!;
};

/**
 * Record a collaboration event
 * @param event Collaboration event details
 */
export const recordCollaborationEvent = (event: CollaborationEvent): void => {
  if (!event.boardId) {
    console.warn('Collaboration event missing boardId', event);
    return;
  }
  
  const stats = getOrCreateBoardStats(event.boardId);
  
  // Update event counts
  stats.eventCounts[event.type] = (stats.eventCounts[event.type] || 0) + 1;
  
  // Update last activity timestamp
  stats.lastUpdated = Date.now();
  
  // Handle specific event types
  switch (event.type) {
    case CollaborationEventType.USER_JOINED:
      if (event.userId && event.username) {
        stats.activeUsers.set(event.userId, {
          userId: event.userId,
          username: event.username,
          lastActive: Date.now(),
          isActive: true,
        });
      }
      break;
      
    case CollaborationEventType.USER_LEFT:
      if (event.userId) {
        stats.activeUsers.delete(event.userId);
      }
      break;
      
    case CollaborationEventType.CURSOR_MOVED:
      if (event.userId) {
        const user = stats.activeUsers.get(event.userId);
        if (user) {
          user.lastActive = Date.now();
          user.isActive = true;
          if (event.additionalData?.position) {
            user.cursorPosition = event.additionalData.position;
          }
        }
      }
      break;
      
    case CollaborationEventType.ELEMENT_CREATED:
      if (event.elementType) {
        stats.elementCounts[event.elementType] = (stats.elementCounts[event.elementType] || 0) + 1;
      }
      break;
      
    case CollaborationEventType.ELEMENT_DELETED:
      if (event.elementType) {
        stats.elementCounts[event.elementType] = Math.max(
          0,
          (stats.elementCounts[event.elementType] || 0) - 1
        );
      }
      break;
      
    case CollaborationEventType.SYNC_COMPLETED:
      if (typeof event.latency === 'number') {
        // Add latency sample
        stats.latencySamples.push(event.latency);
        
        // Keep only the most recent samples
        if (stats.latencySamples.length > config.maxLatencySamples) {
          stats.latencySamples.shift();
        }
        
        // Recalculate average latency
        stats.averageLatency = stats.latencySamples.reduce((sum, val) => sum + val, 0) / 
          stats.latencySamples.length;
        
        // Update connection quality
        if (stats.averageLatency < config.connectionQualityThresholds.excellent) {
          stats.connectionQuality = 'excellent';
        } else if (stats.averageLatency < config.connectionQualityThresholds.good) {
          stats.connectionQuality = 'good';
        } else if (stats.averageLatency < config.connectionQualityThresholds.fair) {
          stats.connectionQuality = 'fair';
        } else {
          stats.connectionQuality = 'poor';
        }
      }
      break;
  }
  
  // Send event to server if in production
  if (process.env.NODE_ENV === 'production') {
    sendEventToServer(event).catch(console.error);
  }
  
  // Clean up inactive users
  cleanupInactiveUsers(stats);
};

/**
 * Clean up inactive users from the statistics
 * @param stats Board statistics
 */
const cleanupInactiveUsers = (stats: BoardStatistics): void => {
  const now = Date.now();
  
  for (const [userId, user] of stats.activeUsers.entries()) {
    if (now - user.lastActive > config.userInactivityThreshold) {
      user.isActive = false;
    }
  }
};

/**
 * Send an event to the server for storage and analysis
 * @param event The event to send
 */
const sendEventToServer = async (event: CollaborationEvent): Promise<void> => {
  try {
    await fetch('/api/monitoring/collaboration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event }),
      // Use keepalive to ensure the request completes even if the page is unloading
      keepalive: true,
    });
  } catch (error) {
    // Silent fail - we don't want to disrupt the user experience
    console.error('Failed to send collaboration event to server:', error);
  }
};

/**
 * Get statistics for a specific board
 * @param boardId Board ID
 * @returns Board statistics or null if not found
 */
export const getBoardStatistics = (boardId: string): BoardStatistics | null => {
  return boardStats.get(boardId) || null;
};

/**
 * Get statistics for all boards
 * @returns Array of board statistics
 */
export const getAllBoardStatistics = (): BoardStatistics[] => {
  return Array.from(boardStats.values());
};

/**
 * Get the number of active users across all boards
 * @returns Number of active users
 */
export const getTotalActiveUsers = (): number => {
  let count = 0;
  
  for (const stats of boardStats.values()) {
    for (const user of stats.activeUsers.values()) {
      if (user.isActive) {
        count++;
      }
    }
  }
  
  return count;
};

/**
 * Reset statistics for a specific board
 * @param boardId Board ID
 */
export const resetBoardStatistics = (boardId: string): void => {
  boardStats.delete(boardId);
};

/**
 * Reset all statistics
 */
export const resetAllStatistics = (): void => {
  boardStats.clear();
};
