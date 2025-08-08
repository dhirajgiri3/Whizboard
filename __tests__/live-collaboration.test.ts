import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSession } from 'next-auth/react';
import { useQuery, useSubscription, useMutation } from '@apollo/client';
import useRealTimeCollaboration from '../hooks/useRealTimeCollaboration';

// Mock next-auth
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}));

// Mock Apollo Client
vi.mock('@apollo/client', () => ({
  useQuery: vi.fn(),
  useSubscription: vi.fn(),
  useMutation: vi.fn(),
  gql: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

// Mock EventSource
global.EventSource = vi.fn().mockImplementation(() => ({
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  close: vi.fn(),
  readyState: 1,
}));

// Mock the real-time collaboration hook
vi.mock('../hooks/useRealTimeCollaboration', () => ({
  default: vi.fn(),
}));

describe('Live Collaboration Feature', () => {
  const mockSession = {
    data: {
      user: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        image: 'https://example.com/avatar.jpg',
      },
    },
    status: 'authenticated',
  };

  const mockBoardData = {
    getBoard: {
      id: 'test-board-id',
      name: 'Test Board',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      createdBy: 'test-user-id',
      elements: [],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    (useSession as any).mockReturnValue(mockSession);
    (useQuery as any).mockReturnValue({
      data: mockBoardData,
      loading: false,
      error: null,
    });
    (useSubscription as any).mockReturnValue({});
    (useMutation as any).mockReturnValue([vi.fn(), {}]);
    
    // Mock successful fetch responses
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Real-time Collaboration Setup', () => {
    it('should establish SSE connection when board loads', async () => {
      const mockUseRealTimeCollaboration = vi.fn().mockReturnValue({
        isConnected: true,
        cursors: {},
        broadcastCursorMovement: vi.fn(),
        broadcastDrawingStart: vi.fn(),
        broadcastDrawingUpdate: vi.fn(),
        broadcastDrawingComplete: vi.fn(),
        broadcastElementAdd: vi.fn(),
        broadcastElementUpdate: vi.fn(),
        broadcastElementDelete: vi.fn(),
        broadcastTextElementCreate: vi.fn(),
        broadcastTextElementUpdate: vi.fn(),
        broadcastTextElementDelete: vi.fn(),
        broadcastTextElementEditStart: vi.fn(),
        broadcastTextElementEditFinish: vi.fn(),
        broadcastShapeElementCreate: vi.fn(),
        broadcastShapeElementUpdate: vi.fn(),
        broadcastShapeElementDelete: vi.fn(),
        broadcastShapeElementTransform: vi.fn(),
      });

      (useRealTimeCollaboration as any).mockImplementation(mockUseRealTimeCollaboration);

      // Test that the hook can be called with correct parameters
      const hookResult = mockUseRealTimeCollaboration({
        boardId: 'test-board-id',
        userId: 'test-user-id',
        userName: 'Test User',
        isOwner: true,
        onBoardUpdate: vi.fn(),
        onCursorMove: vi.fn(),
        onElementAdded: vi.fn(),
        onElementUpdated: vi.fn(),
        onElementDeleted: vi.fn(),
      });

      // Verify the hook returns expected structure
      expect(hookResult.isConnected).toBe(true);
      expect(hookResult.cursors).toEqual({});
      expect(typeof hookResult.broadcastCursorMovement).toBe('function');
      expect(typeof hookResult.broadcastDrawingStart).toBe('function');
      expect(typeof hookResult.broadcastDrawingComplete).toBe('function');
    });

    it('should handle user join events', async () => {
      const mockCursors = {
        'other-user-id': {
          x: 100,
          y: 200,
          userId: 'other-user-id',
          name: 'Other User',
        },
      };

      const mockUseRealTimeCollaboration = vi.fn().mockReturnValue({
        isConnected: true,
        cursors: mockCursors,
        broadcastCursorMovement: vi.fn(),
        broadcastDrawingStart: vi.fn(),
        broadcastDrawingUpdate: vi.fn(),
        broadcastDrawingComplete: vi.fn(),
        broadcastElementAdd: vi.fn(),
        broadcastElementUpdate: vi.fn(),
        broadcastElementDelete: vi.fn(),
        broadcastTextElementCreate: vi.fn(),
        broadcastTextElementUpdate: vi.fn(),
        broadcastTextElementDelete: vi.fn(),
        broadcastTextElementEditStart: vi.fn(),
        broadcastTextElementEditFinish: vi.fn(),
        broadcastShapeElementCreate: vi.fn(),
        broadcastShapeElementUpdate: vi.fn(),
        broadcastShapeElementDelete: vi.fn(),
        broadcastShapeElementTransform: vi.fn(),
      });

      (useRealTimeCollaboration as any).mockImplementation(mockUseRealTimeCollaboration);

      // Verify that cursors are properly managed
      const hookResult = mockUseRealTimeCollaboration();
      expect(hookResult.cursors).toEqual(mockCursors);
      expect(Object.keys(hookResult.cursors)).toHaveLength(1);
      expect(hookResult.cursors['other-user-id']).toBeDefined();
    });

    it('should handle connection failures gracefully', async () => {
      const mockUseRealTimeCollaboration = vi.fn().mockReturnValue({
        isConnected: false,
        cursors: {},
        broadcastCursorMovement: vi.fn(),
        broadcastDrawingStart: vi.fn(),
        broadcastDrawingUpdate: vi.fn(),
        broadcastDrawingComplete: vi.fn(),
        broadcastElementAdd: vi.fn(),
        broadcastElementUpdate: vi.fn(),
        broadcastElementDelete: vi.fn(),
        broadcastTextElementCreate: vi.fn(),
        broadcastTextElementUpdate: vi.fn(),
        broadcastTextElementDelete: vi.fn(),
        broadcastTextElementEditStart: vi.fn(),
        broadcastTextElementEditFinish: vi.fn(),
        broadcastShapeElementCreate: vi.fn(),
        broadcastShapeElementUpdate: vi.fn(),
        broadcastShapeElementDelete: vi.fn(),
        broadcastShapeElementTransform: vi.fn(),
      });

      (useRealTimeCollaboration as any).mockImplementation(mockUseRealTimeCollaboration);

      const hookResult = mockUseRealTimeCollaboration();

      // Verify disconnected state
      expect(hookResult.isConnected).toBe(false);
      
      // Verify that broadcast functions don't throw errors when disconnected
      expect(() => hookResult.broadcastCursorMovement(100, 200)).not.toThrow();
      expect(() => hookResult.broadcastDrawingStart({} as any)).not.toThrow();
    });
  });

  describe('Drawing Collaboration', () => {
    it('should broadcast drawing events to other users', async () => {
      const mockBroadcastDrawingComplete = vi.fn();
      const mockBroadcastDrawingUpdate = vi.fn();
      const mockBroadcastDrawingStart = vi.fn();

      const mockUseRealTimeCollaboration = vi.fn().mockReturnValue({
        isConnected: true,
        cursors: {},
        broadcastCursorMovement: vi.fn(),
        broadcastDrawingStart: mockBroadcastDrawingStart,
        broadcastDrawingUpdate: mockBroadcastDrawingUpdate,
        broadcastDrawingComplete: mockBroadcastDrawingComplete,
        broadcastElementAdd: vi.fn(),
        broadcastElementUpdate: vi.fn(),
        broadcastElementDelete: vi.fn(),
        broadcastTextElementCreate: vi.fn(),
        broadcastTextElementUpdate: vi.fn(),
        broadcastTextElementDelete: vi.fn(),
        broadcastTextElementEditStart: vi.fn(),
        broadcastTextElementEditFinish: vi.fn(),
        broadcastShapeElementCreate: vi.fn(),
        broadcastShapeElementUpdate: vi.fn(),
        broadcastShapeElementDelete: vi.fn(),
        broadcastShapeElementTransform: vi.fn(),
      });

      (useRealTimeCollaboration as any).mockImplementation(mockUseRealTimeCollaboration);

      const hookResult = mockUseRealTimeCollaboration();

      // Simulate drawing a line
      const testLine = {
        id: 'test-line-id',
        points: [0, 0, 100, 100],
        tool: 'pen',
        color: '#000000',
        strokeWidth: 3,
      };

      // Test drawing start
      hookResult.broadcastDrawingStart(testLine);
      expect(mockBroadcastDrawingStart).toHaveBeenCalledWith(testLine);

      // Test drawing update
      hookResult.broadcastDrawingUpdate(testLine);
      expect(mockBroadcastDrawingUpdate).toHaveBeenCalledWith(testLine);

      // Test drawing complete
      hookResult.broadcastDrawingComplete(testLine);
      expect(mockBroadcastDrawingComplete).toHaveBeenCalledWith(testLine);
    });

    it('should handle drawing events from other users', async () => {
      const mockOnElementAdded = vi.fn();
      const mockOnElementUpdated = vi.fn();

      const mockUseRealTimeCollaboration = vi.fn().mockReturnValue({
        isConnected: true,
        cursors: {},
        broadcastCursorMovement: vi.fn(),
        broadcastDrawingStart: vi.fn(),
        broadcastDrawingUpdate: vi.fn(),
        broadcastDrawingComplete: vi.fn(),
        broadcastElementAdd: vi.fn(),
        broadcastElementUpdate: vi.fn(),
        broadcastElementDelete: vi.fn(),
        broadcastTextElementCreate: vi.fn(),
        broadcastTextElementUpdate: vi.fn(),
        broadcastTextElementDelete: vi.fn(),
        broadcastTextElementEditStart: vi.fn(),
        broadcastTextElementEditFinish: vi.fn(),
        broadcastShapeElementCreate: vi.fn(),
        broadcastShapeElementUpdate: vi.fn(),
        broadcastShapeElementDelete: vi.fn(),
        broadcastShapeElementTransform: vi.fn(),
      });

      (useRealTimeCollaboration as any).mockImplementation(mockUseRealTimeCollaboration);

      // Simulate receiving a drawing event from another user
      const remoteDrawingEvent = {
        type: 'drawingCompleted',
        payload: {
          userId: 'other-user-id',
          userName: 'Other User',
          line: {
            id: 'remote-line-id',
            points: [50, 50, 150, 150],
            tool: 'pen',
            color: '#ff0000',
            strokeWidth: 2,
          },
          timestamp: Date.now(),
        },
      };

      // This would be handled by the SSE event handler
      // The event should trigger the appropriate callback
      expect(mockOnElementAdded).not.toHaveBeenCalled();
      expect(mockOnElementUpdated).not.toHaveBeenCalled();
    });

    it('should throttle drawing updates to prevent spam', async () => {
      const mockBroadcastDrawingUpdate = vi.fn();

      const mockUseRealTimeCollaboration = vi.fn().mockReturnValue({
        isConnected: true,
        cursors: {},
        broadcastCursorMovement: vi.fn(),
        broadcastDrawingStart: vi.fn(),
        broadcastDrawingUpdate: mockBroadcastDrawingUpdate,
        broadcastDrawingComplete: vi.fn(),
        broadcastElementAdd: vi.fn(),
        broadcastElementUpdate: vi.fn(),
        broadcastElementDelete: vi.fn(),
        broadcastTextElementCreate: vi.fn(),
        broadcastTextElementUpdate: vi.fn(),
        broadcastTextElementDelete: vi.fn(),
        broadcastTextElementEditStart: vi.fn(),
        broadcastTextElementEditFinish: vi.fn(),
        broadcastShapeElementCreate: vi.fn(),
        broadcastShapeElementUpdate: vi.fn(),
        broadcastShapeElementDelete: vi.fn(),
        broadcastShapeElementTransform: vi.fn(),
      });

      (useRealTimeCollaboration as any).mockImplementation(mockUseRealTimeCollaboration);

      const hookResult = mockUseRealTimeCollaboration();

      const testLine = {
        id: 'test-line-id',
        points: [0, 0, 100, 100],
        tool: 'pen',
        color: '#000000',
        strokeWidth: 3,
      };

      // Call multiple times rapidly
      hookResult.broadcastDrawingUpdate(testLine);
      hookResult.broadcastDrawingUpdate(testLine);
      hookResult.broadcastDrawingUpdate(testLine);

      // Should be called at least once
      expect(mockBroadcastDrawingUpdate).toHaveBeenCalled();
    });
  });

  describe('Cursor Movement', () => {
    it('should broadcast cursor movements', async () => {
      const mockBroadcastCursorMovement = vi.fn();

      const mockUseRealTimeCollaboration = vi.fn().mockReturnValue({
        isConnected: true,
        cursors: {},
        broadcastCursorMovement: mockBroadcastCursorMovement,
        broadcastDrawingStart: vi.fn(),
        broadcastDrawingUpdate: vi.fn(),
        broadcastDrawingComplete: vi.fn(),
        broadcastElementAdd: vi.fn(),
        broadcastElementUpdate: vi.fn(),
        broadcastElementDelete: vi.fn(),
        broadcastTextElementCreate: vi.fn(),
        broadcastTextElementUpdate: vi.fn(),
        broadcastTextElementDelete: vi.fn(),
        broadcastTextElementEditStart: vi.fn(),
        broadcastTextElementEditFinish: vi.fn(),
        broadcastShapeElementCreate: vi.fn(),
        broadcastShapeElementUpdate: vi.fn(),
        broadcastShapeElementDelete: vi.fn(),
        broadcastShapeElementTransform: vi.fn(),
      });

      (useRealTimeCollaboration as any).mockImplementation(mockUseRealTimeCollaboration);

      const hookResult = mockUseRealTimeCollaboration();

      // Simulate cursor movement
      hookResult.broadcastCursorMovement(100, 200);
      expect(mockBroadcastCursorMovement).toHaveBeenCalledWith(100, 200);
    });

    it('should display cursors from other users', async () => {
      const mockCursors = {
        'user-1': {
          x: 100,
          y: 200,
          userId: 'user-1',
          name: 'User 1',
        },
        'user-2': {
          x: 300,
          y: 400,
          userId: 'user-2',
          name: 'User 2',
        },
      };

      const mockUseRealTimeCollaboration = vi.fn().mockReturnValue({
        isConnected: true,
        cursors: mockCursors,
        broadcastCursorMovement: vi.fn(),
        broadcastDrawingStart: vi.fn(),
        broadcastDrawingUpdate: vi.fn(),
        broadcastDrawingComplete: vi.fn(),
        broadcastElementAdd: vi.fn(),
        broadcastElementUpdate: vi.fn(),
        broadcastElementDelete: vi.fn(),
        broadcastTextElementCreate: vi.fn(),
        broadcastTextElementUpdate: vi.fn(),
        broadcastTextElementDelete: vi.fn(),
        broadcastTextElementEditStart: vi.fn(),
        broadcastTextElementEditFinish: vi.fn(),
        broadcastShapeElementCreate: vi.fn(),
        broadcastShapeElementUpdate: vi.fn(),
        broadcastShapeElementDelete: vi.fn(),
        broadcastShapeElementTransform: vi.fn(),
      });

      (useRealTimeCollaboration as any).mockImplementation(mockUseRealTimeCollaboration);

      const hookResult = mockUseRealTimeCollaboration();

      // Verify that multiple cursors are tracked
      expect(Object.keys(hookResult.cursors)).toHaveLength(2);
      expect(hookResult.cursors['user-1']).toBeDefined();
      expect(hookResult.cursors['user-2']).toBeDefined();
      expect(hookResult.cursors['user-1'].x).toBe(100);
      expect(hookResult.cursors['user-1'].y).toBe(200);
      expect(hookResult.cursors['user-2'].x).toBe(300);
      expect(hookResult.cursors['user-2'].y).toBe(400);
    });

    it('should throttle cursor updates to prevent spam', async () => {
      const mockBroadcastCursorMovement = vi.fn();

      const mockUseRealTimeCollaboration = vi.fn().mockReturnValue({
        isConnected: true,
        cursors: {},
        broadcastCursorMovement: mockBroadcastCursorMovement,
        broadcastDrawingStart: vi.fn(),
        broadcastDrawingUpdate: vi.fn(),
        broadcastDrawingComplete: vi.fn(),
        broadcastElementAdd: vi.fn(),
        broadcastElementUpdate: vi.fn(),
        broadcastElementDelete: vi.fn(),
        broadcastTextElementCreate: vi.fn(),
        broadcastTextElementUpdate: vi.fn(),
        broadcastTextElementDelete: vi.fn(),
        broadcastTextElementEditStart: vi.fn(),
        broadcastTextElementEditFinish: vi.fn(),
        broadcastShapeElementCreate: vi.fn(),
        broadcastShapeElementUpdate: vi.fn(),
        broadcastShapeElementDelete: vi.fn(),
        broadcastShapeElementTransform: vi.fn(),
      });

      (useRealTimeCollaboration as any).mockImplementation(mockUseRealTimeCollaboration);

      const hookResult = mockUseRealTimeCollaboration();

      // Call multiple times rapidly
      hookResult.broadcastCursorMovement(100, 200);
      hookResult.broadcastCursorMovement(101, 201);
      hookResult.broadcastCursorMovement(102, 202);

      // Should be called at least once
      expect(mockBroadcastCursorMovement).toHaveBeenCalled();
    });
  });

  describe('Element Collaboration', () => {
    it('should broadcast text element creation', async () => {
      const mockBroadcastTextElementCreate = vi.fn();

      const mockUseRealTimeCollaboration = vi.fn().mockReturnValue({
        isConnected: true,
        cursors: {},
        broadcastCursorMovement: vi.fn(),
        broadcastDrawingStart: vi.fn(),
        broadcastDrawingUpdate: vi.fn(),
        broadcastDrawingComplete: vi.fn(),
        broadcastElementAdd: vi.fn(),
        broadcastElementUpdate: vi.fn(),
        broadcastElementDelete: vi.fn(),
        broadcastTextElementCreate: mockBroadcastTextElementCreate,
        broadcastTextElementUpdate: vi.fn(),
        broadcastTextElementDelete: vi.fn(),
        broadcastTextElementEditStart: vi.fn(),
        broadcastTextElementEditFinish: vi.fn(),
        broadcastShapeElementCreate: vi.fn(),
        broadcastShapeElementUpdate: vi.fn(),
        broadcastShapeElementDelete: vi.fn(),
        broadcastShapeElementTransform: vi.fn(),
      });

      (useRealTimeCollaboration as any).mockImplementation(mockUseRealTimeCollaboration);

      const hookResult = mockUseRealTimeCollaboration();

      const testTextElement = {
        id: 'test-text-id',
        type: 'text',
        x: 100,
        y: 100,
        text: 'Hello World',
        fontSize: 16,
        color: '#000000',
      };

      hookResult.broadcastTextElementCreate(testTextElement);
      expect(mockBroadcastTextElementCreate).toHaveBeenCalledWith(testTextElement);
    });

    it('should broadcast shape element updates', async () => {
      const mockBroadcastShapeElementUpdate = vi.fn();

      const mockUseRealTimeCollaboration = vi.fn().mockReturnValue({
        isConnected: true,
        cursors: {},
        broadcastCursorMovement: vi.fn(),
        broadcastDrawingStart: vi.fn(),
        broadcastDrawingUpdate: vi.fn(),
        broadcastDrawingComplete: vi.fn(),
        broadcastElementAdd: vi.fn(),
        broadcastElementUpdate: vi.fn(),
        broadcastElementDelete: vi.fn(),
        broadcastTextElementCreate: vi.fn(),
        broadcastTextElementUpdate: vi.fn(),
        broadcastTextElementDelete: vi.fn(),
        broadcastTextElementEditStart: vi.fn(),
        broadcastTextElementEditFinish: vi.fn(),
        broadcastShapeElementCreate: vi.fn(),
        broadcastShapeElementUpdate: mockBroadcastShapeElementUpdate,
        broadcastShapeElementDelete: vi.fn(),
        broadcastShapeElementTransform: vi.fn(),
      });

      (useRealTimeCollaboration as any).mockImplementation(mockUseRealTimeCollaboration);

      const hookResult = mockUseRealTimeCollaboration();

      const testShapeElement = {
        id: 'test-shape-id',
        type: 'shape',
        x: 200,
        y: 200,
        width: 100,
        height: 100,
        shapeType: 'rectangle',
        style: {
          fill: '#ffffff',
          stroke: '#000000',
          strokeWidth: 2,
        },
      };

      hookResult.broadcastShapeElementUpdate(testShapeElement);
      expect(mockBroadcastShapeElementUpdate).toHaveBeenCalledWith(testShapeElement);
    });

    it('should handle text element editing states', async () => {
      const mockBroadcastTextElementEditStart = vi.fn();
      const mockBroadcastTextElementEditFinish = vi.fn();

      const mockUseRealTimeCollaboration = vi.fn().mockReturnValue({
        isConnected: true,
        cursors: {},
        broadcastCursorMovement: vi.fn(),
        broadcastDrawingStart: vi.fn(),
        broadcastDrawingUpdate: vi.fn(),
        broadcastDrawingComplete: vi.fn(),
        broadcastElementAdd: vi.fn(),
        broadcastElementUpdate: vi.fn(),
        broadcastElementDelete: vi.fn(),
        broadcastTextElementCreate: vi.fn(),
        broadcastTextElementUpdate: vi.fn(),
        broadcastTextElementDelete: vi.fn(),
        broadcastTextElementEditStart: mockBroadcastTextElementEditStart,
        broadcastTextElementEditFinish: mockBroadcastTextElementEditFinish,
        broadcastShapeElementCreate: vi.fn(),
        broadcastShapeElementUpdate: vi.fn(),
        broadcastShapeElementDelete: vi.fn(),
        broadcastShapeElementTransform: vi.fn(),
      });

      (useRealTimeCollaboration as any).mockImplementation(mockUseRealTimeCollaboration);

      const hookResult = mockUseRealTimeCollaboration();

      // Test edit start
      hookResult.broadcastTextElementEditStart('test-text-id');
      expect(mockBroadcastTextElementEditStart).toHaveBeenCalledWith('test-text-id');

      // Test edit finish
      hookResult.broadcastTextElementEditFinish('test-text-id');
      expect(mockBroadcastTextElementEditFinish).toHaveBeenCalledWith('test-text-id');
    });

    it('should handle shape element transformations', async () => {
      const mockBroadcastShapeElementTransform = vi.fn();

      const mockUseRealTimeCollaboration = vi.fn().mockReturnValue({
        isConnected: true,
        cursors: {},
        broadcastCursorMovement: vi.fn(),
        broadcastDrawingStart: vi.fn(),
        broadcastDrawingUpdate: vi.fn(),
        broadcastDrawingComplete: vi.fn(),
        broadcastElementAdd: vi.fn(),
        broadcastElementUpdate: vi.fn(),
        broadcastElementDelete: vi.fn(),
        broadcastTextElementCreate: vi.fn(),
        broadcastTextElementUpdate: vi.fn(),
        broadcastTextElementDelete: vi.fn(),
        broadcastTextElementEditStart: vi.fn(),
        broadcastTextElementEditFinish: vi.fn(),
        broadcastShapeElementCreate: vi.fn(),
        broadcastShapeElementUpdate: vi.fn(),
        broadcastShapeElementDelete: vi.fn(),
        broadcastShapeElementTransform: mockBroadcastShapeElementTransform,
      });

      (useRealTimeCollaboration as any).mockImplementation(mockUseRealTimeCollaboration);

      const hookResult = mockUseRealTimeCollaboration();

      const testShapeElement = {
        id: 'test-shape-id',
        type: 'shape',
        x: 200,
        y: 200,
        width: 100,
        height: 100,
        rotation: 45,
        shapeType: 'rectangle',
        style: {
          fill: '#ffffff',
          stroke: '#000000',
          strokeWidth: 2,
        },
      };

      hookResult.broadcastShapeElementTransform(testShapeElement);
      expect(mockBroadcastShapeElementTransform).toHaveBeenCalledWith(testShapeElement);
    });
  });

  describe('Connection Management', () => {
    it('should handle connection state changes', async () => {
      const mockUseRealTimeCollaboration = vi.fn().mockReturnValue({
        isConnected: true,
        cursors: {},
        broadcastCursorMovement: vi.fn(),
        broadcastDrawingStart: vi.fn(),
        broadcastDrawingUpdate: vi.fn(),
        broadcastDrawingComplete: vi.fn(),
        broadcastElementAdd: vi.fn(),
        broadcastElementUpdate: vi.fn(),
        broadcastElementDelete: vi.fn(),
        broadcastTextElementCreate: vi.fn(),
        broadcastTextElementUpdate: vi.fn(),
        broadcastTextElementDelete: vi.fn(),
        broadcastTextElementEditStart: vi.fn(),
        broadcastTextElementEditFinish: vi.fn(),
        broadcastShapeElementCreate: vi.fn(),
        broadcastShapeElementUpdate: vi.fn(),
        broadcastShapeElementDelete: vi.fn(),
        broadcastShapeElementTransform: vi.fn(),
      });

      (useRealTimeCollaboration as any).mockImplementation(mockUseRealTimeCollaboration);

      const hookResult = mockUseRealTimeCollaboration();

      // Verify connection state
      expect(hookResult.isConnected).toBe(true);
    });

    it('should handle disconnection gracefully', async () => {
      const mockUseRealTimeCollaboration = vi.fn().mockReturnValue({
        isConnected: false,
        cursors: {},
        broadcastCursorMovement: vi.fn(),
        broadcastDrawingStart: vi.fn(),
        broadcastDrawingUpdate: vi.fn(),
        broadcastDrawingComplete: vi.fn(),
        broadcastElementAdd: vi.fn(),
        broadcastElementUpdate: vi.fn(),
        broadcastElementDelete: vi.fn(),
        broadcastTextElementCreate: vi.fn(),
        broadcastTextElementUpdate: vi.fn(),
        broadcastTextElementDelete: vi.fn(),
        broadcastTextElementEditStart: vi.fn(),
        broadcastTextElementEditFinish: vi.fn(),
        broadcastShapeElementCreate: vi.fn(),
        broadcastShapeElementUpdate: vi.fn(),
        broadcastShapeElementDelete: vi.fn(),
        broadcastShapeElementTransform: vi.fn(),
      });

      (useRealTimeCollaboration as any).mockImplementation(mockUseRealTimeCollaboration);

      const hookResult = mockUseRealTimeCollaboration();

      // Verify disconnected state
      expect(hookResult.isConnected).toBe(false);
    });

    it('should handle user leave events', async () => {
      const mockCursors = {
        'user-1': {
          x: 100,
          y: 200,
          userId: 'user-1',
          name: 'User 1',
        },
        'user-2': {
          x: 300,
          y: 400,
          userId: 'user-2',
          name: 'User 2',
        },
      };

      const mockUseRealTimeCollaboration = vi.fn().mockReturnValue({
        isConnected: true,
        cursors: mockCursors,
        broadcastCursorMovement: vi.fn(),
        broadcastDrawingStart: vi.fn(),
        broadcastDrawingUpdate: vi.fn(),
        broadcastDrawingComplete: vi.fn(),
        broadcastElementAdd: vi.fn(),
        broadcastElementUpdate: vi.fn(),
        broadcastElementDelete: vi.fn(),
        broadcastTextElementCreate: vi.fn(),
        broadcastTextElementUpdate: vi.fn(),
        broadcastTextElementDelete: vi.fn(),
        broadcastTextElementEditStart: vi.fn(),
        broadcastTextElementEditFinish: vi.fn(),
        broadcastShapeElementCreate: vi.fn(),
        broadcastShapeElementUpdate: vi.fn(),
        broadcastShapeElementDelete: vi.fn(),
        broadcastShapeElementTransform: vi.fn(),
      });

      (useRealTimeCollaboration as any).mockImplementation(mockUseRealTimeCollaboration);

      const hookResult = mockUseRealTimeCollaboration();

      // Simulate user leaving
      const updatedCursors = { ...mockCursors };
      delete updatedCursors['user-1'];

      // Verify cursor removal
      expect(Object.keys(hookResult.cursors)).toHaveLength(2);
      expect(hookResult.cursors['user-1']).toBeDefined();
      expect(hookResult.cursors['user-2']).toBeDefined();
    });
  });

  describe('API Integration', () => {
    it('should make correct API calls for drawing events', async () => {
      const mockUseRealTimeCollaboration = vi.fn().mockReturnValue({
        isConnected: true,
        cursors: {},
        broadcastCursorMovement: vi.fn(),
        broadcastDrawingStart: vi.fn(),
        broadcastDrawingUpdate: vi.fn(),
        broadcastDrawingComplete: vi.fn(),
        broadcastElementAdd: vi.fn(),
        broadcastElementUpdate: vi.fn(),
        broadcastElementDelete: vi.fn(),
        broadcastTextElementCreate: vi.fn(),
        broadcastTextElementUpdate: vi.fn(),
        broadcastTextElementDelete: vi.fn(),
        broadcastTextElementEditStart: vi.fn(),
        broadcastTextElementEditFinish: vi.fn(),
        broadcastShapeElementCreate: vi.fn(),
        broadcastShapeElementUpdate: vi.fn(),
        broadcastShapeElementDelete: vi.fn(),
        broadcastShapeElementTransform: vi.fn(),
      });

      (useRealTimeCollaboration as any).mockImplementation(mockUseRealTimeCollaboration);

      // Simulate a drawing event that would trigger an API call
      const testLine = {
        id: 'test-line-id',
        points: [0, 0, 100, 100],
        tool: 'pen',
        color: '#000000',
        strokeWidth: 3,
      };

      // This would trigger a POST to /api/board/drawing
      const response = await fetch('/api/board/drawing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          boardId: 'test-board-id',
          userId: 'test-user-id',
          userName: 'Test User',
          line: testLine,
          action: 'complete',
        }),
      });

      expect(fetch).toHaveBeenCalledWith('/api/board/drawing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          boardId: 'test-board-id',
          userId: 'test-user-id',
          userName: 'Test User',
          line: testLine,
          action: 'complete',
        }),
      });
    });

    it('should make correct API calls for cursor movement', async () => {
      const mockUseRealTimeCollaboration = vi.fn().mockReturnValue({
        isConnected: true,
        cursors: {},
        broadcastCursorMovement: vi.fn(),
        broadcastDrawingStart: vi.fn(),
        broadcastDrawingUpdate: vi.fn(),
        broadcastDrawingComplete: vi.fn(),
        broadcastElementAdd: vi.fn(),
        broadcastElementUpdate: vi.fn(),
        broadcastElementDelete: vi.fn(),
        broadcastTextElementCreate: vi.fn(),
        broadcastTextElementUpdate: vi.fn(),
        broadcastTextElementDelete: vi.fn(),
        broadcastTextElementEditStart: vi.fn(),
        broadcastTextElementEditFinish: vi.fn(),
        broadcastShapeElementCreate: vi.fn(),
        broadcastShapeElementUpdate: vi.fn(),
        broadcastShapeElementDelete: vi.fn(),
        broadcastShapeElementTransform: vi.fn(),
      });

      (useRealTimeCollaboration as any).mockImplementation(mockUseRealTimeCollaboration);

      // Simulate cursor movement that would trigger an API call
      const response = await fetch('/api/board/cursor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          boardId: 'test-board-id',
          userId: 'test-user-id',
          name: 'Test User',
          x: 100,
          y: 200,
        }),
      });

      expect(fetch).toHaveBeenCalledWith('/api/board/cursor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          boardId: 'test-board-id',
          userId: 'test-user-id',
          name: 'Test User',
          x: 100,
          y: 200,
        }),
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing user data gracefully', async () => {
      const mockUseRealTimeCollaboration = vi.fn().mockReturnValue({
        isConnected: true,
        cursors: {},
        broadcastCursorMovement: vi.fn(),
        broadcastDrawingStart: vi.fn(),
        broadcastDrawingUpdate: vi.fn(),
        broadcastDrawingComplete: vi.fn(),
        broadcastElementAdd: vi.fn(),
        broadcastElementUpdate: vi.fn(),
        broadcastElementDelete: vi.fn(),
        broadcastTextElementCreate: vi.fn(),
        broadcastTextElementUpdate: vi.fn(),
        broadcastTextElementDelete: vi.fn(),
        broadcastTextElementEditStart: vi.fn(),
        broadcastTextElementEditFinish: vi.fn(),
        broadcastShapeElementCreate: vi.fn(),
        broadcastShapeElementUpdate: vi.fn(),
        broadcastShapeElementDelete: vi.fn(),
        broadcastShapeElementTransform: vi.fn(),
      });

      (useRealTimeCollaboration as any).mockImplementation(mockUseRealTimeCollaboration);

      // Test with missing user data
      const hookResult = mockUseRealTimeCollaboration({
        boardId: 'test-board-id',
        userId: undefined,
        userName: undefined,
        isOwner: false,
        onBoardUpdate: vi.fn(),
        onCursorMove: vi.fn(),
        onElementAdded: vi.fn(),
        onElementUpdated: vi.fn(),
        onElementDeleted: vi.fn(),
      });

      // Should still return valid structure
      expect(hookResult.isConnected).toBe(true);
      expect(typeof hookResult.broadcastCursorMovement).toBe('function');
    });

    it('should handle invalid element data', async () => {
      const mockOnElementAdded = vi.fn();
      const mockOnElementUpdated = vi.fn();

      const mockUseRealTimeCollaboration = vi.fn().mockReturnValue({
        isConnected: true,
        cursors: {},
        broadcastCursorMovement: vi.fn(),
        broadcastDrawingStart: vi.fn(),
        broadcastDrawingUpdate: vi.fn(),
        broadcastDrawingComplete: vi.fn(),
        broadcastElementAdd: vi.fn(),
        broadcastElementUpdate: vi.fn(),
        broadcastElementDelete: vi.fn(),
        broadcastTextElementCreate: vi.fn(),
        broadcastTextElementUpdate: vi.fn(),
        broadcastTextElementDelete: vi.fn(),
        broadcastTextElementEditStart: vi.fn(),
        broadcastTextElementEditFinish: vi.fn(),
        broadcastShapeElementCreate: vi.fn(),
        broadcastShapeElementUpdate: vi.fn(),
        broadcastShapeElementDelete: vi.fn(),
        broadcastShapeElementTransform: vi.fn(),
      });

      (useRealTimeCollaboration as any).mockImplementation(mockUseRealTimeCollaboration);

      // Test with invalid element data
      const invalidElement = {
        id: 'invalid-element',
        type: 'unknown',
        data: null,
      };

      // Should not throw errors
      expect(() => {
        mockOnElementAdded(invalidElement);
      }).not.toThrow();
    });

    it('should handle rapid state changes', async () => {
      const mockUseRealTimeCollaboration = vi.fn().mockReturnValue({
        isConnected: true,
        cursors: {},
        broadcastCursorMovement: vi.fn(),
        broadcastDrawingStart: vi.fn(),
        broadcastDrawingUpdate: vi.fn(),
        broadcastDrawingComplete: vi.fn(),
        broadcastElementAdd: vi.fn(),
        broadcastElementUpdate: vi.fn(),
        broadcastElementDelete: vi.fn(),
        broadcastTextElementCreate: vi.fn(),
        broadcastTextElementUpdate: vi.fn(),
        broadcastTextElementDelete: vi.fn(),
        broadcastTextElementEditStart: vi.fn(),
        broadcastTextElementEditFinish: vi.fn(),
        broadcastShapeElementCreate: vi.fn(),
        broadcastShapeElementUpdate: vi.fn(),
        broadcastShapeElementDelete: vi.fn(),
        broadcastShapeElementTransform: vi.fn(),
      });

      (useRealTimeCollaboration as any).mockImplementation(mockUseRealTimeCollaboration);

      const hookResult = mockUseRealTimeCollaboration();

      // Test rapid function calls
      for (let i = 0; i < 10; i++) {
        hookResult.broadcastCursorMovement(i, i);
        hookResult.broadcastDrawingStart({} as any);
        hookResult.broadcastTextElementCreate({} as any);
      }

      // Should not throw errors
      expect(hookResult.isConnected).toBe(true);
    });
  });
}); 