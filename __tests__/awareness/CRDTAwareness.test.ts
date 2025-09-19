import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as Y from 'yjs';
import { CRDTAwareness } from '@/lib/crdt/CRDTAwareness';

// Mock y-protocols/awareness
vi.mock('y-protocols/awareness', () => ({
  Awareness: vi.fn().mockImplementation((ydoc) => ({
    setLocalStateField: vi.fn(),
    getLocalState: vi.fn(() => ({})),
    getStates: vi.fn(() => new Map()),
    on: vi.fn(),
    off: vi.fn(),
    destroy: vi.fn(),
    clientID: 1,
  })),
}));

describe('CRDTAwareness', () => {
  let ydoc: Y.Doc;
  let awareness: CRDTAwareness;

  beforeEach(() => {
    ydoc = new Y.Doc();
    awareness = new CRDTAwareness(ydoc, {
      userId: 'test-user',
      userName: 'Test User',
    });
  });

  afterEach(() => {
    awareness.destroy();
    ydoc.destroy();
  });

  describe('initialization', () => {
    it('should initialize with user data', () => {
      expect(awareness.awareness.setLocalStateField).toHaveBeenCalledWith('user', {
        id: 'test-user',
        name: 'Test User',
        color: expect.any(String),
      });
    });

    it('should generate consistent colors for users', () => {
      const awareness1 = new CRDTAwareness(new Y.Doc(), {
        userId: 'user1',
        userName: 'User 1',
      });
      const awareness2 = new CRDTAwareness(new Y.Doc(), {
        userId: 'user1',
        userName: 'User 1',
      });

      // Same user ID should generate same color
      const color1 = awareness1['generateUserColor']('user1');
      const color2 = awareness2['generateUserColor']('user1');
      expect(color1).toBe(color2);

      awareness1.destroy();
      awareness2.destroy();
    });
  });

  describe('cursor updates', () => {
    it('should update cursor position', () => {
      awareness.updateCursor({
        x: 100,
        y: 200,
        isActive: true,
      });

      expect(awareness.awareness.setLocalStateField).toHaveBeenCalledWith('cursor', {
        x: 100,
        y: 200,
        userId: 'test-user',
        name: 'Test User',
        color: expect.any(String),
        isActive: true,
        lastActivity: expect.any(Number),
      });
    });

    it('should throttle cursor updates', async () => {
      const config = {
        userId: 'test-user',
        userName: 'Test User',
        cursorThrottleMs: 50,
      };
      const throttledAwareness = new CRDTAwareness(ydoc, config);

      // First update should go through
      throttledAwareness.updateCursor({ x: 100, y: 200, isActive: true });
      expect(throttledAwareness.awareness.setLocalStateField).toHaveBeenCalledTimes(2); // user + cursor

      // Second immediate update should be throttled
      throttledAwareness.updateCursor({ x: 150, y: 250, isActive: true });
      expect(throttledAwareness.awareness.setLocalStateField).toHaveBeenCalledTimes(2); // Still 2

      // Wait for throttle to clear
      await new Promise(resolve => setTimeout(resolve, 60));

      // Now update should go through
      throttledAwareness.updateCursor({ x: 200, y: 300, isActive: true });
      expect(throttledAwareness.awareness.setLocalStateField).toHaveBeenCalledTimes(3);

      throttledAwareness.destroy();
    });
  });

  describe('presence updates', () => {
    it('should update user presence', () => {
      awareness.updatePresence({
        status: 'away',
        currentActivity: 'Taking a break',
      });

      expect(awareness.awareness.setLocalStateField).toHaveBeenCalledWith('presence', {
        userId: 'test-user',
        name: 'Test User',
        status: 'away',
        lastSeen: expect.any(Number),
        sessionDuration: 0,
        connectionQuality: 'good',
        currentActivity: 'Taking a break',
      });
    });

    it('should merge with existing presence data', () => {
      // Mock existing presence
      const mockPresence = {
        userId: 'test-user',
        name: 'Test User',
        status: 'online' as const,
        sessionDuration: 5,
        connectionQuality: 'good' as const,
      };

      awareness.awareness.getLocalState = vi.fn(() => ({ presence: mockPresence }));

      awareness.updatePresence({
        status: 'away',
        currentActivity: 'In a meeting',
      });

      expect(awareness.awareness.setLocalStateField).toHaveBeenCalledWith('presence', {
        ...mockPresence,
        status: 'away',
        currentActivity: 'In a meeting',
        lastSeen: expect.any(Number),
      });
    });
  });

  describe('selection and editing state', () => {
    it('should update selection state', () => {
      const selection = {
        elementIds: ['element1', 'element2'],
        boundingBox: { x: 0, y: 0, width: 100, height: 200 },
      };

      awareness.updateSelection(selection);

      expect(awareness.awareness.setLocalStateField).toHaveBeenCalledWith('selection', selection);
    });

    it('should set editing state', () => {
      const editingState = {
        elementId: 'text-element-1',
        type: 'text' as const,
        startTime: Date.now(),
      };

      awareness.setEditingState(editingState);

      expect(awareness.awareness.setLocalStateField).toHaveBeenCalledWith('editingState', editingState);
    });

    it('should clear editing state', () => {
      awareness.clearEditingState();

      expect(awareness.awareness.setLocalStateField).toHaveBeenCalledWith('editingState', null);
    });
  });

  describe('state retrieval', () => {
    beforeEach(() => {
      // Mock states map
      const mockStates = new Map([
        [1, { // own client
          user: { id: 'test-user', name: 'Test User' },
          cursor: { userId: 'test-user', x: 100, y: 200 },
          presence: { userId: 'test-user', status: 'online' },
        }],
        [2, { // other client
          user: { id: 'other-user', name: 'Other User' },
          cursor: { userId: 'other-user', x: 300, y: 400 },
          presence: { userId: 'other-user', status: 'away' },
        }],
      ]);

      awareness.awareness.getStates = vi.fn(() => mockStates);
      awareness.awareness.clientID = 1;
    });

    it('should get other user cursors', () => {
      const cursors = awareness.getOtherCursors();

      expect(cursors).toEqual({
        'other-user': { userId: 'other-user', x: 300, y: 400 },
      });
    });

    it('should get other user presence', () => {
      const presence = awareness.getOtherPresence();

      expect(presence).toEqual({
        'other-user': { userId: 'other-user', status: 'away' },
      });
    });

    it('should get connection statistics', () => {
      const stats = awareness.getConnectionStats();

      expect(stats).toEqual({
        connectedUsers: 1, // Excluding self
        localClientId: 1,
        totalClients: 2,
      });
    });
  });

  describe('event subscriptions', () => {
    it('should subscribe to awareness changes', () => {
      const callback = vi.fn();
      const unsubscribe = awareness.onAwarenessChange(callback);

      expect(awareness.awareness.on).toHaveBeenCalledWith('change', callback);
      expect(typeof unsubscribe).toBe('function');

      unsubscribe();
      expect(awareness.awareness.off).toHaveBeenCalledWith('change', callback);
    });

    it('should subscribe to cursor changes', () => {
      const callback = vi.fn();
      awareness.onCursorsChange(callback);

      expect(awareness.awareness.on).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should subscribe to presence changes', () => {
      const callback = vi.fn();
      awareness.onPresenceChange(callback);

      expect(awareness.awareness.on).toHaveBeenCalledWith('change', expect.any(Function));
    });
  });

  describe('cleanup', () => {
    it('should destroy cleanly', () => {
      awareness.destroy();

      expect(awareness.awareness.destroy).toHaveBeenCalled();
    });

    it('should clear timeouts on destroy', async () => {
      // Create awareness with short throttle
      const throttledAwareness = new CRDTAwareness(ydoc, {
        userId: 'test-user',
        userName: 'Test User',
        cursorThrottleMs: 100,
      });

      // Trigger cursor update to create throttle timeout
      throttledAwareness.updateCursor({ x: 100, y: 200, isActive: true });

      // Destroy should clear timeouts without errors
      expect(() => throttledAwareness.destroy()).not.toThrow();
    });
  });
});